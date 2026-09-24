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

        var completedAmounts = await _context.Payments
            .Where(p => p.PaymentStatus == "Completed")
            .Select(p => p.Amount)
            .ToListAsync();

        var totalSales = completedAmounts.Sum();

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
        var payments = await (
            from p in _context.Payments
            join b in _context.Bookings on p.BookingId equals b.BookingId into bookings
            from b in bookings.DefaultIfEmpty()
            join u in _context.Users on b.UserId equals u.UserId into users
            from u in users.DefaultIfEmpty()
            join t in _context.TourPackages on b.TourPackageId equals t.TourPackageId into packages
            from t in packages.DefaultIfEmpty()
            where p.PaymentStatus == "Completed"
            orderby p.PaymentDate descending
            select new
            {
                p.PaymentId,
                p.PaymentDate,
                p.Amount,
                p.PaymentMethod,
                p.TransactionReference,

                Customer = new
                {
                    UserId = b != null ? b.UserId : 0,
                    FirstName = u != null ? u.FirstName : "Former",
                    LastName = u != null ? u.LastName : "customer",
                    Email = u != null ? u.Email : string.Empty
                },

                TourPackage = new
                {
                    TourPackageId = b != null ? b.TourPackageId : 0,
                    PackageName = t != null ? t.PackageName : "Unavailable package",
                    Destination = t != null ? t.Destination : string.Empty
                }
            }).ToListAsync();

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
        var bookings = await (
            from b in _context.Bookings
            join u in _context.Users on b.UserId equals u.UserId into users
            from u in users.DefaultIfEmpty()
            join t in _context.TourPackages on b.TourPackageId equals t.TourPackageId into packages
            from t in packages.DefaultIfEmpty()
            orderby b.BookingDate descending
            select new
            {
                b.BookingId,
                b.BookingDate,
                b.TravelDate,
                b.NumberOfTravelers,
                b.TotalAmount,
                b.BookingStatus,

                Customer = new
                {
                    b.UserId,
                    FirstName = u != null ? u.FirstName : "Former",
                    LastName = u != null ? u.LastName : "customer",
                    Email = u != null ? u.Email : string.Empty
                },

                Package = new
                {
                    b.TourPackageId,
                    PackageName = t != null ? t.PackageName : "Unavailable package",
                    Destination = t != null ? t.Destination : string.Empty
                }
            }).ToListAsync();

        return Ok(bookings);
    }
}
