using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace WebApp.Server.Models;

public class OrderItem
{
    public int Id { get; set; }

    public int OrderId { get; set; }

    [JsonIgnore]
    public Order? Order { get; set; }

    [Required]
    public int ProductId { get; set; }

    public Product? Product { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "La cantidad debe ser al menos 1.")]
    public int Quantity { get; set; }

    public decimal UnitPrice { get; set; }

    public decimal Subtotal => Quantity * UnitPrice;
}
