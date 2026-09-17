using GlobeTrek.Api.Data;
using GlobeTrek.Api.DTOs;
using GlobeTrek.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GlobeTrek.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AccommodationsController : ControllerBase
{
    private readonly AppDbContext _context;

    public AccommodationsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll()
    {
        var accommodations = await _context.Accommodations
            .Where(a => a.IsActive)
            .OrderBy(a => a.Name)
            .ToListAsync();

        return Ok(accommodations);
    }

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(int id)
    {
        var accommodation = await _context.Accommodations
            .FirstOrDefaultAsync(a => a.AccommodationId == id);

        if (accommodation == null)
        {
            return NotFound(new
            {
                message = "Accommodation not found."
            });
        }

        return Ok(accommodation);
    }

    [HttpPost]
    [Authorize(Roles = "Staff,Admin")]
    public async Task<IActionResult> Create(
        CreateAccommodationRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name) ||
            string.IsNullOrWhiteSpace(request.Location) ||
            request.PricePerNight <= 0)
        {
            return BadRequest(new
            {
                message = "Please provide valid accommodation details."
            });
        }

        var accommodation = new Accommodation
        {
            Name = request.Name.Trim(),
            Location = request.Location.Trim(),
            Description = request.Description.Trim(),
            PricePerNight = request.PricePerNight,
            RoomType = request.RoomType.Trim(),
            Facilities = request.Facilities.Trim(),
            ImageUrl = request.ImageUrl.Trim(),
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Accommodations.Add(accommodation);
        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetById),
            new { id = accommodation.AccommodationId },
            accommodation
        );
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Staff,Admin")]
    public async Task<IActionResult> Update(
        int id,
        UpdateAccommodationRequest request)
    {
        var accommodation = await _context.Accommodations
            .FirstOrDefaultAsync(a => a.AccommodationId == id);

        if (accommodation == null)
        {
            return NotFound(new
            {
                message = "Accommodation not found."
            });
        }

        if (string.IsNullOrWhiteSpace(request.Name) ||
            string.IsNullOrWhiteSpace(request.Location) ||
            request.PricePerNight <= 0)
        {
            return BadRequest(new
            {
                message = "Please provide valid accommodation details."
            });
        }

        accommodation.Name = request.Name.Trim();
        accommodation.Location = request.Location.Trim();
        accommodation.Description = request.Description.Trim();
        accommodation.PricePerNight = request.PricePerNight;
        accommodation.RoomType = request.RoomType.Trim();
        accommodation.Facilities = request.Facilities.Trim();
        accommodation.ImageUrl = request.ImageUrl.Trim();
        accommodation.IsActive = request.IsActive;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Accommodation updated successfully.",
            accommodation
        });
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Staff,Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var accommodation = await _context.Accommodations
            .FirstOrDefaultAsync(a => a.AccommodationId == id);

        if (accommodation == null)
        {
            return NotFound(new
            {
                message = "Accommodation not found."
            });
        }

        accommodation.IsActive = false;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Accommodation deleted successfully."
        });
    }
}