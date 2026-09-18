using System.ComponentModel.DataAnnotations;

namespace GlobeTrek.Api.DTOs;

public class CreateTourPackageRequest
{
    [Required]
    [MaxLength(150)]
    public string PackageName { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Destination { get; set; } = string.Empty;

    [Required]
    [MaxLength(1000)]
    public string Description { get; set; } = string.Empty;

    [Range(1, 365)]
    public int DurationDays { get; set; }

    [Range(1, 10000000)]
    public decimal Price { get; set; }

    [MaxLength(200)]
    public string Accommodation { get; set; } = string.Empty;

    [MaxLength(200)]
    public string Transportation { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string Activities { get; set; } = string.Empty;

    [MaxLength(500)]
    public string ImageUrl { get; set; } = string.Empty;

    public int? AccommodationId { get; set; }

    public int? TransportationId { get; set; }
}