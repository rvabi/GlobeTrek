using System.Net;
using System.Text.Json;

namespace GlobeTrek.Api.Middleware;

public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;

    public GlobalExceptionMiddleware(
        RequestDelegate next,
        ILogger<GlobalExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Unhandled exception occurred while processing request.");

            await HandleExceptionAsync(context);
        }
    }

    private static async Task HandleExceptionAsync(
        HttpContext context)
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode =
            (int)HttpStatusCode.InternalServerError;

        var response = new
        {
            statusCode = context.Response.StatusCode,
            message =
                "An unexpected server error occurred. Please try again later."
        };

        var json = JsonSerializer.Serialize(response);

        await context.Response.WriteAsync(json);
    }
}