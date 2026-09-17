namespace GlobeTrek.Api.DTOs;

public class RespondCustomerQueryRequest
{
    public string Response { get; set; } = string.Empty;

    public string QueryStatus { get; set; } = "Resolved";
}