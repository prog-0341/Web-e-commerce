using System.ComponentModel.DataAnnotations;

namespace WebApp.Server.Models;

public class Order
{
    public int Id { get; set; }

    [Required, MaxLength(150)]
    public string CustomerName { get; set; } = string.Empty;

    [Required, EmailAddress, MaxLength(200)]
    public string CustomerEmail { get; set; } = string.Empty;

    public DateTime OrderDate { get; set; } = DateTime.UtcNow;

    [MaxLength(50)]
    public string Status { get; set; } = "Pendiente";

    public decimal Total { get; set; }

    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
}
