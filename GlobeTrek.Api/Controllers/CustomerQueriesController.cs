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
public class CustomerQueriesController : ControllerBase
{
    private readonly AppDbContext _context;

    public CustomerQueriesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> Create(
        CreateCustomerQueryRequest request)
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

        if (string.IsNullOrWhiteSpace(request.Subject) ||
            string.IsNullOrWhiteSpace(request.Message))
        {
            return BadRequest(new
            {
                message = "Subject and message are required."
            });
        }

        var query = new CustomerQuery
        {
            UserId = userId,
            Subject = request.Subject.Trim(),
            Message = request.Message.Trim(),
            Response = string.Empty,
            QueryStatus = "Open",
            CreatedAt = DateTime.UtcNow
        };

        _context.CustomerQueries.Add(query);

        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetById),
            new { id = query.CustomerQueryId },
            new
            {
                message = "Query submitted successfully.",
                query
            }
        );
    }

    [HttpGet("my")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> GetMyQueries()
    {
        var userIdClaim =
            User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!int.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var queries = await _context.CustomerQueries
            .Where(q => q.UserId == userId)
            .OrderByDescending(q => q.CreatedAt)
            .Select(q => new
            {
                q.CustomerQueryId,
                q.Subject,
                q.Message,
                q.Response,
                q.QueryStatus,
                q.CreatedAt,
                q.RespondedAt
            })
            .ToListAsync();

        return Ok(queries);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var query = await _context.CustomerQueries
            .Include(q => q.User)
            .FirstOrDefaultAsync(q =>
                q.CustomerQueryId == id);

        if (query == null)
        {
            return NotFound(new
            {
                message = "Query not found."
            });
        }

        var role =
            User.FindFirstValue(ClaimTypes.Role);

        var userIdClaim =
            User.FindFirstValue(ClaimTypes.NameIdentifier);

        int.TryParse(userIdClaim, out var currentUserId);

        if (role == "Customer" &&
            query.UserId != currentUserId)
        {
            return Forbid();
        }

        return Ok(query);
    }

    [HttpGet]
    [Authorize(Roles = "Staff,Admin")]
    public async Task<IActionResult> GetAll()
    {
        var queries = await _context.CustomerQueries
            .Include(q => q.User)
            .OrderByDescending(q => q.CreatedAt)
            .Select(q => new
            {
                q.CustomerQueryId,
                q.Subject,
                q.Message,
                q.Response,
                q.QueryStatus,
                q.CreatedAt,
                q.RespondedAt,
                Customer = new
                {
                    q.User!.UserId,
                    q.User.FirstName,
                    q.User.LastName,
                    q.User.Email
                }
            })
            .ToListAsync();

        return Ok(queries);
    }

    [HttpPut("{id:int}/respond")]
    [Authorize(Roles = "Staff,Admin")]
    public async Task<IActionResult> Respond(
        int id,
        RespondCustomerQueryRequest request)
    {
        var allowedStatuses = new[]
        {
            "Open",
            "In Progress",
            "Resolved",
            "Closed"
        };

        if (string.IsNullOrWhiteSpace(request.Response))
        {
            return BadRequest(new
            {
                message = "Response is required."
            });
        }

        if (!allowedStatuses.Contains(
                request.QueryStatus,
                StringComparer.OrdinalIgnoreCase))
        {
            return BadRequest(new
            {
                message = "Invalid query status."
            });
        }

        var query = await _context.CustomerQueries
            .FirstOrDefaultAsync(q =>
                q.CustomerQueryId == id);

        if (query == null)
        {
            return NotFound(new
            {
                message = "Query not found."
            });
        }

        query.Response = request.Response.Trim();

        query.QueryStatus =
            allowedStatuses.First(s =>
                s.Equals(
                    request.QueryStatus,
                    StringComparison.OrdinalIgnoreCase));

        query.RespondedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Query response saved successfully.",
            query.CustomerQueryId,
            query.QueryStatus,
            query.Response,
            query.RespondedAt
        });
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

        var query = await _context.CustomerQueries
            .FirstOrDefaultAsync(q =>
                q.CustomerQueryId == id &&
                q.UserId == userId);

        if (query == null)
        {
            return NotFound(new
            {
                message = "Query not found."
            });
        }

        if (query.QueryStatus == "Resolved" ||
            query.QueryStatus == "Closed")
        {
            return BadRequest(new
            {
                message =
                    "Resolved or closed queries cannot be deleted."
            });
        }

        _context.CustomerQueries.Remove(query);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Query deleted successfully."
        });
    }
}