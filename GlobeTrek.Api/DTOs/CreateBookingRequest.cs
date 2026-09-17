namespace GlobeTrek.Api.DTOs;

public class CreateBookingRequest
{
    public int TourPackageId { get; set; }

    public DateTime TravelDate { get; set; }

    public int NumberOfTravelers { get; set; }
}