using System.Security.Claims;
using GlobeTrek.Api.Data;
using GlobeTrek.Api.DTOs;
using GlobeTrek.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GlobeTrek.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BookingsController : ControllerBase
{
    private readonly AppDbContext _context;

    public BookingsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> Create(CreateBookingRequest request)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!int.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(new
            {
                message = "Invalid user."
            });
        }

        if (request.NumberOfTravelers <= 0)
        {
            return BadRequest(new
            {
                message = "Number of travelers must be greater than zero."
            });
        }

        if (request.TravelDate.Date < DateTime.UtcNow.Date)
        {
            return BadRequest(new
            {
                message = "Travel date cannot be in the past."
            });
        }

        var package = await _context.TourPackages
            .FirstOrDefaultAsync(p =>
                p.TourPackageId == request.TourPackageId &&
                p.IsActive);

        if (package == null)
        {
            return NotFound(new
            {
                message = "Tour package not found."
            });
        }

        var totalAmount =
            package.Price * request.NumberOfTravelers;

        var booking = new Booking
        {
            UserId = userId,
            TourPackageId = package.TourPackageId,
            TravelDate = request.TravelDate,
            NumberOfTravelers = request.NumberOfTravelers,
            TotalAmount = totalAmount,
            BookingStatus = "Pending",
            BookingDate = DateTime.UtcNow
        };

        _context.Bookings.Add(booking);
        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetById),
            new { id = booking.BookingId },
            new
            {
                message = "Booking created successfully.",
                booking
            }
        );
    }

    [HttpGet("my")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> GetMyBookings()
    {
        var userIdClaim =
            User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!int.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var bookings = await _context.Bookings
            .Where(b => b.UserId == userId)
            .Include(b => b.TourPackage)
            .OrderByDescending(b => b.BookingDate)
            .Select(b => new
            {
                b.BookingId,
                b.TravelDate,
                b.NumberOfTravelers,
                b.TotalAmount,
                b.BookingStatus,
                b.BookingDate,
                TourPackage = new
                {
                    b.TourPackage!.TourPackageId,
                    b.TourPackage.PackageName,
                    b.TourPackage.Destination
                }
            })
            .ToListAsync();

        return Ok(bookings);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var booking = await _context.Bookings
            .Include(b => b.User)
            .Include(b => b.TourPackage)
            .FirstOrDefaultAsync(b => b.BookingId == id);

        if (booking == null)
        {
            return NotFound(new
            {
                message = "Booking not found."
            });
        }

        var role = User.FindFirstValue(ClaimTypes.Role);
        var userIdClaim =
            User.FindFirstValue(ClaimTypes.NameIdentifier);

        int.TryParse(userIdClaim, out var currentUserId);

        if (role == "Customer" &&
            booking.UserId != currentUserId)
        {
            return Forbid();
        }

        return Ok(booking);
    }

    [HttpGet]
    [Authorize(Roles = "Staff,Admin")]
    public async Task<IActionResult> GetAll()
    {
        var bookings = await _context.Bookings
            .Include(b => b.User)
            .Include(b => b.TourPackage)
            .OrderByDescending(b => b.BookingDate)
            .ToListAsync();

        return Ok(bookings);
    }

    [HttpPut("{id:int}/status")]
    [Authorize(Roles = "Staff,Admin")]
    public async Task<IActionResult> UpdateStatus(
        int id,
        [FromQuery] string status)
    {
        var allowedStatuses = new[]
        {
            "Pending",
            "Confirmed",
            "Completed",
            "Cancelled"
        };

        if (!allowedStatuses.Contains(
                status,
                StringComparer.OrdinalIgnoreCase))
        {
            return BadRequest(new
            {
                message = "Invalid booking status."
            });
        }

        var booking = await _context.Bookings
            .FirstOrDefaultAsync(b => b.BookingId == id);

        if (booking == null)
        {
            return NotFound(new
            {
                message = "Booking not found."
            });
        }

        booking.BookingStatus =
            allowedStatuses.First(s =>
                s.Equals(
                    status,
                    StringComparison.OrdinalIgnoreCase));

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Booking status updated successfully.",
            booking.BookingId,
            booking.BookingStatus
        });
    }
}