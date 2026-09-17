namespace GlobeTrek.Api.Models;

public class Booking
{
    public int BookingId { get; set; }

    public int UserId { get; set; }
    public User? User { get; set; }

    public int TourPackageId { get; set; }
    public TourPackage? TourPackage { get; set; }

    public DateTime TravelDate { get; set; }

    public int NumberOfTravelers { get; set; }

    public decimal TotalAmount { get; set; }

    public string BookingStatus { get; set; } = "Pending";

    public DateTime BookingDate { get; set; } = DateTime.UtcNow;
}