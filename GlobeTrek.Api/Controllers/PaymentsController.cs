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
public class PaymentsController : ControllerBase
{
    private readonly AppDbContext _context;

    public PaymentsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> Create(CreatePaymentRequest request)
    {
        var userIdClaim =
            User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!int.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(new
            {
                message = "Invalid user."
            });
        }

        var booking = await _context.Bookings
            .Include(b => b.TourPackage)
            .FirstOrDefaultAsync(b =>
                b.BookingId == request.BookingId &&
                b.UserId == userId);

        if (booking == null)
        {
            return NotFound(new
            {
                message = "Booking not found."
            });
        }

        var existingPayment = await _context.Payments
            .AnyAsync(p => p.BookingId == request.BookingId);

        if (existingPayment)
        {
            return BadRequest(new
            {
                message = "A payment already exists for this booking."
            });
        }

        if (string.IsNullOrWhiteSpace(request.PaymentMethod))
        {
            return BadRequest(new
            {
                message = "Payment method is required."
            });
        }

        var payment = new Payment
        {
            BookingId = booking.BookingId,
            Amount = booking.TotalAmount,
            PaymentMethod = request.PaymentMethod.Trim(),
            TransactionReference =
                request.TransactionReference.Trim(),
            PaymentStatus = "Completed",
            PaymentDate = DateTime.UtcNow
        };

        _context.Payments.Add(payment);

        booking.BookingStatus = "Confirmed";

        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetById),
            new { id = payment.PaymentId },
            new
            {
                message = "Payment completed successfully.",
                payment
            }
        );
    }

    [HttpGet("my")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> GetMyPayments()
    {
        var userIdClaim =
            User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!int.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var payments = await _context.Payments
            .Include(p => p.Booking)
                .ThenInclude(b => b!.TourPackage)
            .Where(p => p.Booking!.UserId == userId)
            .OrderByDescending(p => p.PaymentDate)
            .Select(p => new
            {
                p.PaymentId,
                p.Amount,
                p.PaymentMethod,
                p.PaymentStatus,
                p.TransactionReference,
                p.PaymentDate,
                Booking = new
                {
                    p.Booking!.BookingId,
                    p.Booking.BookingStatus,
                    p.Booking.TravelDate,
                    TourPackage = new
                    {
                        p.Booking.TourPackage!.TourPackageId,
                        p.Booking.TourPackage.PackageName,
                        p.Booking.TourPackage.Destination
                    }
                }
            })
            .ToListAsync();

        return Ok(payments);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var payment = await _context.Payments
            .Include(p => p.Booking)
            .ThenInclude(b => b!.TourPackage)
            .FirstOrDefaultAsync(p => p.PaymentId == id);

        if (payment == null)
        {
            return NotFound(new
            {
                message = "Payment not found."
            });
        }

        var role = User.FindFirstValue(ClaimTypes.Role);

        var userIdClaim =
            User.FindFirstValue(ClaimTypes.NameIdentifier);

        int.TryParse(userIdClaim, out var currentUserId);

        if (role == "Customer" &&
            payment.Booking?.UserId != currentUserId)
        {
            return Forbid();
        }

        return Ok(payment);
    }

    [HttpGet]
    [Authorize(Roles = "Staff,Admin")]
    public async Task<IActionResult> GetAll()
    {
        var payments = await _context.Payments
            .AsNoTracking()
            .Include(p => p.Booking)
                .ThenInclude(b => b!.TourPackage)
            .OrderByDescending(p => p.PaymentDate)
            .ToListAsync();

        var userIds = payments
            .Where(p => p.Booking != null)
            .Select(p => p.Booking!.UserId)
            .Distinct()
            .ToList();
        var users = await _context.Users
            .AsNoTracking()
            .Where(u => userIds.Contains(u.UserId))
            .ToDictionaryAsync(u => u.UserId);

        foreach (var payment in payments)
        {
            if (payment.Booking != null)
            {
                users.TryGetValue(payment.Booking.UserId, out var user);
                payment.Booking.User = user;
            }
        }

        return Ok(payments);
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
            "Completed",
            "Failed",
            "Refunded"
        };

        if (!allowedStatuses.Contains(
                status,
                StringComparer.OrdinalIgnoreCase))
        {
            return BadRequest(new
            {
                message = "Invalid payment status."
            });
        }

        var payment = await _context.Payments
            .FirstOrDefaultAsync(p => p.PaymentId == id);

        if (payment == null)
        {
            return NotFound(new
            {
                message = "Payment not found."
            });
        }

        payment.PaymentStatus =
            allowedStatuses.First(s =>
                s.Equals(
                    status,
                    StringComparison.OrdinalIgnoreCase));

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Payment status updated successfully.",
            payment.PaymentId,
            payment.PaymentStatus
        });
    }
}
