using GlobeTrek.Api.Data;
using GlobeTrek.Api.DTOs;
using GlobeTrek.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GlobeTrek.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TransportationsController : ControllerBase
{
    private readonly AppDbContext _context;

    public TransportationsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll()
    {
        var transportations = await _context.Transportations
            .Where(t => t.IsActive)
            .OrderBy(t => t.TransportType)
            .ToListAsync();

        return Ok(transportations);
    }

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(int id)
    {
        var transportation = await _context.Transportations
            .FirstOrDefaultAsync(t => t.TransportationId == id);

        if (transportation == null)
        {
            return NotFound(new
            {
                message = "Transportation service not found."
            });
        }

        return Ok(transportation);
    }

    [HttpPost]
    [Authorize(Roles = "Staff,Admin")]
    public async Task<IActionResult> Create(
        CreateTransportationRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.TransportType) ||
            string.IsNullOrWhiteSpace(request.ProviderName) ||
            request.Price <= 0)
        {
            return BadRequest(new
            {
                message = "Please provide valid transportation details."
            });
        }

        var transportation = new Transportation
        {
            TransportType = request.TransportType.Trim(),
            ProviderName = request.ProviderName.Trim(),
            FromLocation = request.FromLocation.Trim(),
            ToLocation = request.ToLocation.Trim(),
            Price = request.Price,
            Description = request.Description.Trim(),
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Transportations.Add(transportation);
        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetById),
            new { id = transportation.TransportationId },
            transportation
        );
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Staff,Admin")]
    public async Task<IActionResult> Update(
        int id,
        UpdateTransportationRequest request)
    {
        var transportation = await _context.Transportations
            .FirstOrDefaultAsync(t => t.TransportationId == id);

        if (transportation == null)
        {
            return NotFound(new
            {
                message = "Transportation service not found."
            });
        }

        if (string.IsNullOrWhiteSpace(request.TransportType) ||
            string.IsNullOrWhiteSpace(request.ProviderName) ||
            request.Price <= 0)
        {
            return BadRequest(new
            {
                message = "Please provide valid transportation details."
            });
        }

        transportation.TransportType = request.TransportType.Trim();
        transportation.ProviderName = request.ProviderName.Trim();
        transportation.FromLocation = request.FromLocation.Trim();
        transportation.ToLocation = request.ToLocation.Trim();
        transportation.Price = request.Price;
        transportation.Description = request.Description.Trim();
        transportation.IsActive = request.IsActive;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Transportation updated successfully.",
            transportation
        });
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Staff,Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var transportation = await _context.Transportations
            .FirstOrDefaultAsync(t => t.TransportationId == id);

        if (transportation == null)
        {
            return NotFound(new
            {
                message = "Transportation service not found."
            });
        }

        transportation.IsActive = false;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Transportation deleted successfully."
        });
    }
}