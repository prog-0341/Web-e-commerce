using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApp.Server.Data;
using WebApp.Server.Models;

namespace WebApp.Server.Controllers;

/// <summary>
/// Gestión de pedidos de clientes.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class OrdersController : ControllerBase
{
    private readonly AppDbContext _context;

    private static readonly string[] ValidStatuses =
        ["Pendiente", "Confirmado", "Enviado", "Entregado", "Cancelado"];

    public OrdersController(AppDbContext context) => _context = context;

    /// <summary>Obtiene todos los pedidos. Soporta filtro por estatus.</summary>
    /// <param name="status">Filtrar por estatus: Pendiente, Confirmado, Enviado, Entregado, Cancelado.</param>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<Order>), 200)]
    public async Task<ActionResult<IEnumerable<Order>>> GetOrders([FromQuery] string? status = null)
    {
        var query = _context.Orders
            .Include(o => o.Items)
                .ThenInclude(i => i.Product)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(o => o.Status == status);

        var orders = await query.OrderByDescending(o => o.OrderDate).ToListAsync();
        return Ok(orders);
    }

    /// <summary>Obtiene un pedido por su ID con todos sus artículos.</summary>
    /// <param name="id">ID del pedido.</param>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(Order), 200)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<Order>> GetOrder(int id)
    {
        var order = await _context.Orders
            .Include(o => o.Items)
                .ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order is null)
            return NotFound(new { message = $"Pedido con ID {id} no encontrado." });

        return Ok(order);
    }

    /// <summary>Crea un nuevo pedido con sus artículos.</summary>
    [HttpPost]
    [ProducesResponseType(typeof(Order), 201)]
    [ProducesResponseType(400)]
    public async Task<ActionResult<Order>> CreateOrder([FromBody] CreateOrderRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        if (request.Items is null || request.Items.Count == 0)
            return BadRequest(new { message = "El pedido debe tener al menos un artículo." });

        var order = new Order
        {
            CustomerName = request.CustomerName,
            CustomerEmail = request.CustomerEmail,
            OrderDate = DateTime.UtcNow,
            Status = "Pendiente"
        };

        decimal total = 0;

        foreach (var item in request.Items)
        {
            var product = await _context.Products.FindAsync(item.ProductId);

            if (product is null)
                return BadRequest(new { message = $"Producto con ID {item.ProductId} no encontrado." });

            if (!product.IsActive)
                return BadRequest(new { message = $"El producto '{product.Name}' no está disponible." });

            if (product.Stock < item.Quantity)
                return BadRequest(new
                {
                    message = $"Stock insuficiente para '{product.Name}'. Disponible: {product.Stock}, solicitado: {item.Quantity}."
                });

            var orderItem = new OrderItem
            {
                ProductId = product.Id,
                Quantity = item.Quantity,
                UnitPrice = product.Price
            };

            order.Items.Add(orderItem);
            total += orderItem.UnitPrice * orderItem.Quantity;

            // Reducir stock
            product.Stock -= item.Quantity;
        }

        order.Total = total;
        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        // Recargar con productos incluidos
        await _context.Entry(order)
            .Collection(o => o.Items)
            .Query()
            .Include(i => i.Product)
            .LoadAsync();

        return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, order);
    }

    /// <summary>Actualiza el estatus de un pedido.</summary>
    /// <param name="id">ID del pedido.</param>
    /// <param name="request">Nuevo estatus.</param>
    [HttpPut("{id}/status")]
    [ProducesResponseType(typeof(Order), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<Order>> UpdateOrderStatus(int id, [FromBody] UpdateStatusRequest request)
    {
        if (!ValidStatuses.Contains(request.Status))
            return BadRequest(new { message = $"Estatus inválido. Valores permitidos: {string.Join(", ", ValidStatuses)}." });

        var order = await _context.Orders
            .Include(o => o.Items).ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order is null)
            return NotFound(new { message = $"Pedido con ID {id} no encontrado." });

        if (order.Status == "Entregado" || order.Status == "Cancelado")
            return BadRequest(new { message = $"No se puede modificar un pedido en estatus '{order.Status}'." });

        order.Status = request.Status;
        await _context.SaveChangesAsync();
        return Ok(order);
    }

    /// <summary>Cancela y elimina un pedido. Devuelve el stock a los productos.</summary>
    /// <param name="id">ID del pedido a eliminar.</param>
    [HttpDelete("{id}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DeleteOrder(int id)
    {
        var order = await _context.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order is null)
            return NotFound(new { message = $"Pedido con ID {id} no encontrado." });

        if (order.Status == "Enviado" || order.Status == "Entregado")
            return BadRequest(new { message = $"No se puede eliminar un pedido en estatus '{order.Status}'." });

        // Restaurar stock
        foreach (var item in order.Items)
        {
            var product = await _context.Products.FindAsync(item.ProductId);
            if (product is not null)
                product.Stock += item.Quantity;
        }

        _context.Orders.Remove(order);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}

// DTOs para los requests
public record CreateOrderItemRequest(int ProductId, int Quantity);

public class CreateOrderRequest
{
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public List<CreateOrderItemRequest> Items { get; set; } = new();
}

public class UpdateStatusRequest
{
    public string Status { get; set; } = string.Empty;
}
