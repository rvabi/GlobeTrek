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
public class TravelPlansController : ControllerBase
{
    private readonly AppDbContext _context;

    public TravelPlansController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> Create(
        SaveTravelPlanRequest request)
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

        var existingPlan = await _context.TravelPlans
            .AnyAsync(t => t.BookingId == request.BookingId);

        if (existingPlan)
        {
            return BadRequest(new
            {
                message =
                    "A travel plan already exists for this booking."
            });
        }

        var plan = new TravelPlan
        {
            BookingId = booking.BookingId,
            AccommodationPreference =
                request.AccommodationPreference.Trim(),
            TransportationPreference =
                request.TransportationPreference.Trim(),
            SelectedActivities =
                request.SelectedActivities.Trim(),
            SpecialRequests =
                request.SpecialRequests.Trim(),
            Notes =
                request.Notes.Trim(),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.TravelPlans.Add(plan);

        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetById),
            new { id = plan.TravelPlanId },
            new
            {
                message = "Travel plan created successfully.",
                travelPlan = plan
            }
        );
    }

    [HttpGet("my")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> GetMyTravelPlans()
    {
        var userIdClaim =
            User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!int.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var plans = await _context.TravelPlans
            .Include(t => t.Booking)
                .ThenInclude(b => b!.TourPackage)
            .Where(t => t.Booking!.UserId == userId)
            .OrderByDescending(t => t.UpdatedAt)
            .Select(t => new
            {
                t.TravelPlanId,
                t.BookingId,
                t.AccommodationPreference,
                t.TransportationPreference,
                t.SelectedActivities,
                t.SpecialRequests,
                t.Notes,
                t.CreatedAt,
                t.UpdatedAt,

                Booking = new
                {
                    t.Booking!.BookingId,
                    t.Booking.TravelDate,
                    t.Booking.BookingStatus,

                    TourPackage = new
                    {
                        t.Booking.TourPackage!.TourPackageId,
                        t.Booking.TourPackage.PackageName,
                        t.Booking.TourPackage.Destination
                    }
                }
            })
            .ToListAsync();

        return Ok(plans);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var plan = await _context.TravelPlans
            .Include(t => t.Booking)
                .ThenInclude(b => b!.TourPackage)
            .FirstOrDefaultAsync(t => t.TravelPlanId == id);

        if (plan == null)
        {
            return NotFound(new
            {
                message = "Travel plan not found."
            });
        }

        var role =
            User.FindFirstValue(ClaimTypes.Role);

        var userIdClaim =
            User.FindFirstValue(ClaimTypes.NameIdentifier);

        int.TryParse(userIdClaim, out var currentUserId);

        if (role == "Customer" &&
            plan.Booking?.UserId != currentUserId)
        {
            return Forbid();
        }

        return Ok(plan);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> Update(
        int id,
        SaveTravelPlanRequest request)
    {
        var userIdClaim =
            User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!int.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var plan = await _context.TravelPlans
            .Include(t => t.Booking)
            .FirstOrDefaultAsync(t =>
                t.TravelPlanId == id &&
                t.Booking!.UserId == userId);

        if (plan == null)
        {
            return NotFound(new
            {
                message = "Travel plan not found."
            });
        }

        plan.AccommodationPreference =
            request.AccommodationPreference.Trim();

        plan.TransportationPreference =
            request.TransportationPreference.Trim();

        plan.SelectedActivities =
            request.SelectedActivities.Trim();

        plan.SpecialRequests =
            request.SpecialRequests.Trim();

        plan.Notes =
            request.Notes.Trim();

        plan.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Travel plan updated successfully.",
            travelPlan = plan
        });
    }

    [HttpGet]
    [Authorize(Roles = "Staff,Admin")]
    public async Task<IActionResult> GetAll()
    {
        var plans = await _context.TravelPlans
            .AsNoTracking()
            .Include(t => t.Booking)
                .ThenInclude(b => b!.TourPackage)
            .OrderByDescending(t => t.UpdatedAt)
            .ToListAsync();

        var userIds = plans
            .Where(t => t.Booking != null)
            .Select(t => t.Booking!.UserId)
            .Distinct()
            .ToList();
        var users = await _context.Users
            .AsNoTracking()
            .Where(u => userIds.Contains(u.UserId))
            .ToDictionaryAsync(u => u.UserId);

        foreach (var plan in plans)
        {
            if (plan.Booking != null)
            {
                users.TryGetValue(plan.Booking.UserId, out var user);
                plan.Booking.User = user;
            }
        }

        return Ok(plans);
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> Delete(int id)
    {
        var userIdClaim =
            User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!int.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var plan = await _context.TravelPlans
            .Include(t => t.Booking)
            .FirstOrDefaultAsync(t =>
                t.TravelPlanId == id &&
                t.Booking!.UserId == userId);

        if (plan == null)
        {
            return NotFound(new
            {
                message = "Travel plan not found."
            });
        }

        _context.TravelPlans.Remove(plan);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Travel plan deleted successfully."
        });
    }
}
