using System.ComponentModel.DataAnnotations;

namespace GlobeTrek.Api.DTOs;

public class CreateCustomerQueryRequest
{
    [Required]
    [MaxLength(150)]
    public string Subject { get; set; } = string.Empty;

    [Required]
    [MaxLength(2000)]
    public string Message { get; set; } = string.Empty;
}