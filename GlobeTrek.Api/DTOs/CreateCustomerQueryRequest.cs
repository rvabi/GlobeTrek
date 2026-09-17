namespace GlobeTrek.Api.DTOs;

public class CreateCustomerQueryRequest
{
    public string Subject { get; set; } = string.Empty;

    public string Message { get; set; } = string.Empty;
}