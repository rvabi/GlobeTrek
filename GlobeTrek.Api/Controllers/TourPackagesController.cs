using GlobeTrek.Api.Data;
using GlobeTrek.Api.DTOs;
using GlobeTrek.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GlobeTrek.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TourPackagesController : ControllerBase
{
    private readonly AppDbContext _context;

    public TourPackagesController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/TourPackages
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll()
    {
        var packages = await _context.TourPackages
            .Where(p => p.IsActive)
            .Include(p => p.AccommodationDetail)
            .Include(p => p.TransportationDetail)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

        return Ok(packages);
    }

    // GET: api/TourPackages/1
    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(int id)
    {
        var package = await _context.TourPackages
            .Include(p => p.AccommodationDetail)
            .Include(p => p.TransportationDetail)
            .FirstOrDefaultAsync(p => p.TourPackageId == id);

        if (package == null)
        {
            return NotFound(new
            {
                message = "Tour package not found."
            });
        }

        return Ok(package);
    }

    // POST: api/TourPackages
    [HttpPost]
    [Authorize(Roles = "Staff,Admin")]
    public async Task<IActionResult> Create(
        CreateTourPackageRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.PackageName) ||
            string.IsNullOrWhiteSpace(request.Destination) ||
            request.DurationDays <= 0 ||
            request.Price <= 0)
        {
            return BadRequest(new
            {
                message = "Please provide valid package details."
            });
        }

        if (request.AccommodationId.HasValue)
        {
            var accommodationExists =
                await _context.Accommodations
                    .AnyAsync(a =>
                        a.AccommodationId ==
                            request.AccommodationId.Value &&
                        a.IsActive);

            if (!accommodationExists)
            {
                return BadRequest(new
                {
                    message =
                        "Selected accommodation is invalid."
                });
            }
        }

        if (request.TransportationId.HasValue)
        {
            var transportationExists =
                await _context.Transportations
                    .AnyAsync(t =>
                        t.TransportationId ==
                            request.TransportationId.Value &&
                        t.IsActive);

            if (!transportationExists)
            {
                return BadRequest(new
                {
                    message =
                        "Selected transportation is invalid."
                });
            }
        }

        var package = new TourPackage
        {
            PackageName = request.PackageName.Trim(),
            Destination = request.Destination.Trim(),
            Description = request.Description.Trim(),
            DurationDays = request.DurationDays,
            Price = request.Price,

            Accommodation = request.Accommodation.Trim(),
            Transportation = request.Transportation.Trim(),

            Activities = request.Activities.Trim(),
            ImageUrl = request.ImageUrl.Trim(),

            AccommodationId = request.AccommodationId,
            TransportationId = request.TransportationId,

            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.TourPackages.Add(package);

        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetById),
            new { id = package.TourPackageId },
            package
        );
    }

    // PUT: api/TourPackages/1
    [HttpPut("{id:int}")]
    [Authorize(Roles = "Staff,Admin")]
    public async Task<IActionResult> Update(
        int id,
        UpdateTourPackageRequest request)
    {
        var package = await _context.TourPackages
            .FirstOrDefaultAsync(p =>
                p.TourPackageId == id);

        if (package == null)
        {
            return NotFound(new
            {
                message = "Tour package not found."
            });
        }

        if (string.IsNullOrWhiteSpace(request.PackageName) ||
            string.IsNullOrWhiteSpace(request.Destination) ||
            request.DurationDays <= 0 ||
            request.Price <= 0)
        {
            return BadRequest(new
            {
                message = "Please provide valid package details."
            });
        }

        if (request.AccommodationId.HasValue)
        {
            var accommodationExists =
                await _context.Accommodations
                    .AnyAsync(a =>
                        a.AccommodationId ==
                            request.AccommodationId.Value &&
                        a.IsActive);

            if (!accommodationExists)
            {
                return BadRequest(new
                {
                    message =
                        "Selected accommodation is invalid."
                });
            }
        }

        if (request.TransportationId.HasValue)
        {
            var transportationExists =
                await _context.Transportations
                    .AnyAsync(t =>
                        t.TransportationId ==
                            request.TransportationId.Value &&
                        t.IsActive);

            if (!transportationExists)
            {
                return BadRequest(new
                {
                    message =
                        "Selected transportation is invalid."
                });
            }
        }

        package.PackageName =
            request.PackageName.Trim();

        package.Destination =
            request.Destination.Trim();

        package.Description =
            request.Description.Trim();

        package.DurationDays =
            request.DurationDays;

        package.Price =
            request.Price;

        package.Accommodation =
            request.Accommodation.Trim();

        package.Transportation =
            request.Transportation.Trim();

        package.Activities =
            request.Activities.Trim();

        package.ImageUrl =
            request.ImageUrl.Trim();

        package.AccommodationId =
            request.AccommodationId;

        package.TransportationId =
            request.TransportationId;

        package.IsActive =
            request.IsActive;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message =
                "Tour package updated successfully.",
            package
        });
    }

    // DELETE: api/TourPackages/1
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Staff,Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var package = await _context.TourPackages
            .FirstOrDefaultAsync(p =>
                p.TourPackageId == id);

        if (package == null)
        {
            return NotFound(new
            {
                message = "Tour package not found."
            });
        }

        package.IsActive = false;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message =
                "Tour package deleted successfully."
        });
    }
}