using GlobeTrek.Api.Data;
using GlobeTrek.Api.DTOs;
using GlobeTrek.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GlobeTrek.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DestinationsController : ControllerBase
{
    private readonly AppDbContext _context;

    public DestinationsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll()
    {
        var destinations = await _context.Destinations
            .Where(d => d.IsActive)
            .OrderBy(d => d.Name)
            .ToListAsync();

        return Ok(destinations);
    }

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(int id)
    {
        var destination = await _context.Destinations
            .FirstOrDefaultAsync(d =>
                d.DestinationId == id);

        if (destination == null)
        {
            return NotFound(new
            {
                message = "Destination not found."
            });
        }

        return Ok(destination);
    }

    [HttpPost]
    [Authorize(Roles = "Staff,Admin")]
    public async Task<IActionResult> Create(
        CreateDestinationRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name) ||
            string.IsNullOrWhiteSpace(request.Location))
        {
            return BadRequest(new
            {
                message = "Name and location are required."
            });
        }

        var destination = new Destination
        {
            Name = request.Name.Trim(),
            Location = request.Location.Trim(),
            Description = request.Description.Trim(),
            BestTimeToVisit = request.BestTimeToVisit.Trim(),
            Attractions = request.Attractions.Trim(),
            TravelTips = request.TravelTips.Trim(),
            ImageUrl = request.ImageUrl.Trim(),
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Destinations.Add(destination);

        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetById),
            new { id = destination.DestinationId },
            destination
        );
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Staff,Admin")]
    public async Task<IActionResult> Update(
        int id,
        UpdateDestinationRequest request)
    {
        var destination = await _context.Destinations
            .FirstOrDefaultAsync(d =>
                d.DestinationId == id);

        if (destination == null)
        {
            return NotFound(new
            {
                message = "Destination not found."
            });
        }

        if (string.IsNullOrWhiteSpace(request.Name) ||
            string.IsNullOrWhiteSpace(request.Location))
        {
            return BadRequest(new
            {
                message = "Name and location are required."
            });
        }

        destination.Name = request.Name.Trim();
        destination.Location = request.Location.Trim();
        destination.Description = request.Description.Trim();
        destination.BestTimeToVisit =
            request.BestTimeToVisit.Trim();
        destination.Attractions =
            request.Attractions.Trim();
        destination.TravelTips =
            request.TravelTips.Trim();
        destination.ImageUrl =
            request.ImageUrl.Trim();
        destination.IsActive =
            request.IsActive;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Destination updated successfully.",
            destination
        });
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Staff,Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var destination = await _context.Destinations
            .FirstOrDefaultAsync(d =>
                d.DestinationId == id);

        if (destination == null)
        {
            return NotFound(new
            {
                message = "Destination not found."
            });
        }

        destination.IsActive = false;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Destination deleted successfully."
        });
    }
}