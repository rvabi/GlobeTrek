namespace GlobeTrek.Api.DTOs;

public class UpdateTourPackageRequest
{
    public string PackageName { get; set; } = string.Empty;

    public string Destination { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public int DurationDays { get; set; }

    public decimal Price { get; set; }

    public string Accommodation { get; set; } = string.Empty;

    public string Transportation { get; set; } = string.Empty;

    public string Activities { get; set; } = string.Empty;

    public string ImageUrl { get; set; } = string.Empty;

    public bool IsActive { get; set; }
}