namespace GlobeTrek.Api.Models;

public class Transportation
{
    public int TransportationId { get; set; }

    public string TransportType { get; set; } = string.Empty;

    public string ProviderName { get; set; } = string.Empty;

    public string FromLocation { get; set; } = string.Empty;

    public string ToLocation { get; set; } = string.Empty;

    public decimal Price { get; set; }

    public string Description { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}