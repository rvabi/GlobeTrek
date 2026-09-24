using System.Security.Claims;
using System.Text.Json;
using GlobeTrek.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace GlobeTrek.Api.Middleware;

public class ActiveUserMiddleware
{
    private readonly RequestDelegate _next;

    public ActiveUserMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(
        HttpContext context,
        AppDbContext dbContext)
    {
        if (context.User.Identity?.IsAuthenticated == true)
        {
            var userIdClaim =
                context.User.FindFirstValue(
                    ClaimTypes.NameIdentifier
                );

            if (int.TryParse(userIdClaim, out var userId))
            {
                var userState = await dbContext.Users
                    .AsNoTracking()
                    .Where(u => u.UserId == userId)
                    .Select(u => new
                    {
                        u.UserId,
                        u.IsActive,
                        RoleName = u.Role!.RoleName
                    })
                    .FirstOrDefaultAsync();

                var tokenRole = context.User.FindFirstValue(ClaimTypes.Role);
                if (userState == null || !userState.IsActive ||
                    userState.RoleName != tokenRole)
                {
                    context.Response.StatusCode =
                        StatusCodes.Status401Unauthorized;

                    context.Response.ContentType =
                        "application/json";

                    await context.Response.WriteAsync(
                        JsonSerializer.Serialize(new
                        {
                            message =
                                "Your session is no longer valid. Please sign in again."
                        })
                    );

                    return;
                }
            }
        }

        await _next(context);
    }
}
