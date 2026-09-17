namespace GlobeTrek.Api.DTOs;

public class UpdateDestinationRequest
{
    public string Name { get; set; } = string.Empty;

    public string Location { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string BestTimeToVisit { get; set; } = string.Empty;

    public string Attractions { get; set; } = string.Empty;

    public string TravelTips { get; set; } = string.Empty;

    public string ImageUrl { get; set; } = string.Empty;

    public bool IsActive { get; set; }
}