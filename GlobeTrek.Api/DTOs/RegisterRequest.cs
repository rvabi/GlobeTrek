using System.ComponentModel.DataAnnotations;

namespace GlobeTrek.Api.DTOs;

public class RegisterRequest
{
    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    public string PhoneNumber { get; set; } = string.Empty;

    [MinLength(8)]
    public string Password { get; set; } = string.Empty;
}
