namespace GlobeTrek.Api.DTOs;

public class SaveTravelPlanRequest
{
    public int BookingId { get; set; }

    public string AccommodationPreference { get; set; } = string.Empty;

    public string TransportationPreference { get; set; } = string.Empty;

    public string SelectedActivities { get; set; } = string.Empty;

    public string SpecialRequests { get; set; } = string.Empty;

    public string Notes { get; set; } = string.Empty;
}