using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace WebApp.Server.Models;

public class Product
{
    public int Id { get; set; }

    [Required, MaxLength(150)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    [Required, Range(0.01, double.MaxValue, ErrorMessage = "El precio debe ser mayor a 0.")]
    public decimal Price { get; set; }

    [Range(0, int.MaxValue)]
    public int Stock { get; set; }

    [MaxLength(20)]
    public string Unit { get; set; } = "kg";

    [Required, MaxLength(150)]
    public string Producer { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? ImageUrl { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Required]
    public int CategoryId { get; set; }

    public Category? Category { get; set; }
}
