namespace GlobeTrek.Api.DTOs;

public class CreateAccommodationRequest
{
    public string Name { get; set; } = string.Empty;

    public string Location { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public decimal PricePerNight { get; set; }

    public string RoomType { get; set; } = string.Empty;

    public string Facilities { get; set; } = string.Empty;

    public string ImageUrl { get; set; } = string.Empty;
}