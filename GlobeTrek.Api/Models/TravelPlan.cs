namespace GlobeTrek.Api.Models;

public class TravelPlan
{
    public int TravelPlanId { get; set; }

    public int BookingId { get; set; }
    public Booking? Booking { get; set; }

    public string AccommodationPreference { get; set; } = string.Empty;

    public string TransportationPreference { get; set; } = string.Empty;

    public string SelectedActivities { get; set; } = string.Empty;

    public string SpecialRequests { get; set; } = string.Empty;

    public string Notes { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}