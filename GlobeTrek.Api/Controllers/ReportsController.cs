using GlobeTrek.Api.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GlobeTrek.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class ReportsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ReportsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> Dashboard()
    {
        var totalCustomers = await _context.Users
            .CountAsync(u => u.RoleId == 1);

        var totalStaff = await _context.Users
            .CountAsync(u => u.RoleId == 2);

        var totalBookings =
            await _context.Bookings.CountAsync();

        var pendingBookings =
            await _context.Bookings.CountAsync(
                b => b.BookingStatus == "Pending");

        var confirmedBookings =
            await _context.Bookings.CountAsync(
                b => b.BookingStatus == "Confirmed");

        var totalPackages =
            await _context.TourPackages
                .CountAsync(p => p.IsActive);

        var totalQueries =
            await _context.CustomerQueries.CountAsync();

        var openQueries =
            await _context.CustomerQueries
                .CountAsync(q => q.QueryStatus == "Open");

        var totalSales = await _context.Payments
            .Where(p => p.PaymentStatus == "Completed")
            .SumAsync(p => (decimal?)p.Amount) ?? 0;

        return Ok(new
        {
            totalCustomers,
            totalStaff,
            totalBookings,
            pendingBookings,
            confirmedBookings,
            totalPackages,
            totalQueries,
            openQueries,
            totalSales
        });
    }

    [HttpGet("sales")]
    public async Task<IActionResult> SalesReport()
    {
        var payments = await _context.Payments
            .Include(p => p.Booking)
                .ThenInclude(b => b!.User)
            .Include(p => p.Booking)
                .ThenInclude(b => b!.TourPackage)
            .Where(p => p.PaymentStatus == "Completed")
            .OrderByDescending(p => p.PaymentDate)
            .Select(p => new
            {
                p.PaymentId,
                p.PaymentDate,
                p.Amount,
                p.PaymentMethod,
                p.TransactionReference,

                Customer = new
                {
                    p.Booking!.User!.UserId,
                    p.Booking.User.FirstName,
                    p.Booking.User.LastName,
                    p.Booking.User.Email
                },

                TourPackage = new
                {
                    p.Booking!.TourPackage!.TourPackageId,
                    p.Booking.TourPackage.PackageName,
                    p.Booking.TourPackage.Destination
                }
            })
            .ToListAsync();

        var totalSales = payments.Sum(p => p.Amount);

        return Ok(new
        {
            totalSales,
            totalTransactions = payments.Count,
            payments
        });
    }

    [HttpGet("customers")]
    public async Task<IActionResult> CustomerReport()
    {
        var customers = await _context.Users
            .Where(u => u.RoleId == 1)
            .Select(u => new
            {
                u.UserId,
                u.FirstName,
                u.LastName,
                u.Email,
                u.PhoneNumber,
                u.IsActive,
                u.CreatedAt,

                TotalBookings =
                    _context.Bookings.Count(
                        b => b.UserId == u.UserId),

                TotalSpent =
                    _context.Payments
                        .Where(p =>
                            p.Booking!.UserId == u.UserId &&
                            p.PaymentStatus == "Completed")
                        .Sum(p => (decimal?)p.Amount) ?? 0
            })
            .OrderByDescending(u => u.TotalSpent)
            .ToListAsync();

        return Ok(customers);
    }

    [HttpGet("bookings")]
    public async Task<IActionResult> BookingReport()
    {
        var bookings = await _context.Bookings
            .Include(b => b.User)
            .Include(b => b.TourPackage)
            .OrderByDescending(b => b.BookingDate)
            .Select(b => new
            {
                b.BookingId,
                b.BookingDate,
                b.TravelDate,
                b.NumberOfTravelers,
                b.TotalAmount,
                b.BookingStatus,

                Customer = new
                {
                    b.User!.UserId,
                    b.User.FirstName,
                    b.User.LastName,
                    b.User.Email
                },

                Package = new
                {
                    b.TourPackage!.TourPackageId,
                    b.TourPackage.PackageName,
                    b.TourPackage.Destination
                }
            })
            .ToListAsync();

        return Ok(bookings);
    }
}