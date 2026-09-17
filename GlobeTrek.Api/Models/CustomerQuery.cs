namespace GlobeTrek.Api.Models;

public class CustomerQuery
{
    public int CustomerQueryId { get; set; }

    public int UserId { get; set; }
    public User? User { get; set; }

    public string Subject { get; set; } = string.Empty;

    public string Message { get; set; } = string.Empty;

    public string Response { get; set; } = string.Empty;

    public string QueryStatus { get; set; } = "Open";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? RespondedAt { get; set; }
}