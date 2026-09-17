namespace GlobeTrek.Api.Models;

public class Payment
{
    public int PaymentId { get; set; }

    public int BookingId { get; set; }
    public Booking? Booking { get; set; }

    public decimal Amount { get; set; }

    public string PaymentMethod { get; set; } = string.Empty;

    public string PaymentStatus { get; set; } = "Pending";

    public string TransactionReference { get; set; } = string.Empty;

    public DateTime PaymentDate { get; set; } = DateTime.UtcNow;
}