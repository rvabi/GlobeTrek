namespace GlobeTrek.Api.DTOs;

public class CreateTransportationRequest
{
    public string TransportType { get; set; } = string.Empty;

    public string ProviderName { get; set; } = string.Empty;

    public string FromLocation { get; set; } = string.Empty;

    public string ToLocation { get; set; } = string.Empty;

    public decimal Price { get; set; }

    public string Description { get; set; } = string.Empty;
}