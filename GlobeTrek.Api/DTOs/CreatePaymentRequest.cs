namespace GlobeTrek.Api.DTOs;

public class CreatePaymentRequest
{
    public int BookingId { get; set; }

    public string PaymentMethod { get; set; } = string.Empty;

    public string TransactionReference { get; set; } = string.Empty;
}