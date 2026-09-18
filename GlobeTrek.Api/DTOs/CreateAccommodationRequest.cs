using System.ComponentModel.DataAnnotations;

namespace GlobeTrek.Api.DTOs;

public class CreateAccommodationRequest
{
    [Required]
    [MaxLength(150)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(150)]
    public string Location { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string Description { get; set; } = string.Empty;

    [Range(1, 1000000)]
    public decimal PricePerNight { get; set; }

    [MaxLength(100)]
    public string RoomType { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string Facilities { get; set; } = string.Empty;

    [MaxLength(500)]
    public string ImageUrl { get; set; } = string.Empty;
}