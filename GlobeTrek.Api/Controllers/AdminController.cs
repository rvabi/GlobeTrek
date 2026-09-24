using System.Security.Claims;
using GlobeTrek.Api.Data;
using GlobeTrek.Api.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GlobeTrek.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly AppDbContext _context;

    public AdminController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _context.Users
            .Include(u => u.Role)
            .OrderByDescending(u => u.CreatedAt)
            .Select(u => new
            {
                u.UserId,
                u.FirstName,
                u.LastName,
                u.Email,
                u.PhoneNumber,
                u.IsActive,
                u.CreatedAt,
                Role = u.Role!.RoleName
            })
            .ToListAsync();

        return Ok(users);
    }

    [HttpGet("users/{id:int}")]
    public async Task<IActionResult> GetUserById(int id)
    {
        var user = await _context.Users
            .Include(u => u.Role)
            .Where(u => u.UserId == id)
            .Select(u => new
            {
                u.UserId,
                u.FirstName,
                u.LastName,
                u.Email,
                u.PhoneNumber,
                u.IsActive,
                u.CreatedAt,
                RoleId = u.RoleId,
                Role = u.Role!.RoleName
            })
            .FirstOrDefaultAsync();

        if (user == null)
        {
            return NotFound(new
            {
                message = "User not found."
            });
        }

        return Ok(user);
    }

    [HttpPut("users/{id:int}/role")]
    public async Task<IActionResult> UpdateRole(
        int id,
        UpdateUserRoleRequest request)
    {
        if (User.FindFirstValue(ClaimTypes.NameIdentifier) == id.ToString())
        {
            return BadRequest(new { message = "You cannot change your own role." });
        }

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.UserId == id);

        if (user == null)
        {
            return NotFound(new
            {
                message = "User not found."
            });
        }

        var role = await _context.Roles
            .FirstOrDefaultAsync(r => r.RoleId == request.RoleId);

        if (role == null)
        {
            return BadRequest(new
            {
                message = "Invalid role."
            });
        }

        user.RoleId = role.RoleId;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "User role updated successfully.",
            user.UserId,
            role = role.RoleName
        });
    }

    [HttpPut("users/{id:int}/status")]
    public async Task<IActionResult> UpdateStatus(
        int id,
        UpdateUserStatusRequest request)
    {
        if (!request.IsActive &&
            User.FindFirstValue(ClaimTypes.NameIdentifier) == id.ToString())
        {
            return BadRequest(new { message = "You cannot deactivate your own account." });
        }

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.UserId == id);

        if (user == null)
        {
            return NotFound(new
            {
                message = "User not found."
            });
        }

        user.IsActive = request.IsActive;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "User status updated successfully.",
            user.UserId,
            user.IsActive
        });
    }

    [HttpGet("staff")]
    public async Task<IActionResult> GetStaff()
    {
        var staff = await _context.Users
            .Include(u => u.Role)
            .Where(u => u.Role!.RoleName == "Staff")
            .OrderBy(u => u.FirstName)
            .Select(u => new
            {
                u.UserId,
                u.FirstName,
                u.LastName,
                u.Email,
                u.PhoneNumber,
                u.IsActive,
                u.CreatedAt
            })
            .ToListAsync();

        return Ok(staff);
    }
}
