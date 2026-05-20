using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApp.Server.Data;
using WebApp.Server.Models;

namespace WebApp.Server.Controllers;

/// <summary>
/// Gestión de productos del catálogo EcoConecta.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class ProductsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProductsController(AppDbContext context) => _context = context;

    /// <summary>Obtiene todos los productos. Soporta filtro por categoría y búsqueda por nombre/productor.</summary>
    /// <param name="categoryId">Filtrar por ID de categoría (opcional).</param>
    /// <param name="search">Buscar por nombre o productor (opcional).</param>
    /// <param name="onlyActive">Si es true, solo devuelve productos activos (por defecto true).</param>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<Product>), 200)]
    public async Task<ActionResult<IEnumerable<Product>>> GetProducts(
        [FromQuery] int? categoryId = null,
        [FromQuery] string? search = null,
        [FromQuery] bool onlyActive = true)
    {
        var query = _context.Products.Include(p => p.Category).AsQueryable();

        if (onlyActive)
            query = query.Where(p => p.IsActive);

        if (categoryId.HasValue)
            query = query.Where(p => p.CategoryId == categoryId.Value);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.ToLower();
            query = query.Where(p =>
                p.Name.ToLower().Contains(term) ||
                p.Producer.ToLower().Contains(term));
        }

        var products = await query.OrderBy(p => p.Name).ToListAsync();
        return Ok(products);
    }

    /// <summary>Obtiene un producto por su ID.</summary>
    /// <param name="id">ID del producto.</param>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(Product), 200)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<Product>> GetProduct(int id)
    {
        var product = await _context.Products
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product is null)
            return NotFound(new { message = $"Producto con ID {id} no encontrado." });

        return Ok(product);
    }

    /// <summary>Crea un nuevo producto.</summary>
    /// <param name="product">Datos del producto a crear.</param>
    [HttpPost]
    [ProducesResponseType(typeof(Product), 201)]
    [ProducesResponseType(400)]
    public async Task<ActionResult<Product>> CreateProduct([FromBody] Product product)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var categoryExists = await _context.Categories.AnyAsync(c => c.Id == product.CategoryId);
        if (!categoryExists)
            return BadRequest(new { message = $"La categoría con ID {product.CategoryId} no existe." });

        product.Id = 0;
        product.CreatedAt = DateTime.UtcNow;
        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        // Recargar con la categoría incluida
        await _context.Entry(product).Reference(p => p.Category).LoadAsync();
        return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
    }

    /// <summary>Actualiza un producto existente.</summary>
    /// <param name="id">ID del producto a actualizar.</param>
    /// <param name="product">Nuevos datos del producto.</param>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(Product), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<Product>> UpdateProduct(int id, [FromBody] Product product)
    {
        if (id != product.Id)
            return BadRequest(new { message = "El ID de la URL no coincide con el ID del cuerpo." });

        var existing = await _context.Products.FindAsync(id);
        if (existing is null)
            return NotFound(new { message = $"Producto con ID {id} no encontrado." });

        var categoryExists = await _context.Categories.AnyAsync(c => c.Id == product.CategoryId);
        if (!categoryExists)
            return BadRequest(new { message = $"La categoría con ID {product.CategoryId} no existe." });

        existing.Name = product.Name;
        existing.Description = product.Description;
        existing.Price = product.Price;
        existing.Stock = product.Stock;
        existing.Unit = product.Unit;
        existing.Producer = product.Producer;
        existing.ImageUrl = product.ImageUrl;
        existing.IsActive = product.IsActive;
        existing.CategoryId = product.CategoryId;

        await _context.SaveChangesAsync();
        await _context.Entry(existing).Reference(p => p.Category).LoadAsync();
        return Ok(existing);
    }

    /// <summary>Elimina un producto por su ID.</summary>
    /// <param name="id">ID del producto a eliminar.</param>
    [HttpDelete("{id}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(404)]
    [ProducesResponseType(409)]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product is null)
            return NotFound(new { message = $"Producto con ID {id} no encontrado." });

        // Verificar si el producto tiene órdenes asociadas
        var hasOrders = await _context.OrderItems.AnyAsync(oi => oi.ProductId == id);
        if (hasOrders)
        {
            // Desactivar en lugar de eliminar para mantener integridad referencial
            product.IsActive = false;
            await _context.SaveChangesAsync();
            return Ok(new { message = "Producto desactivado (tiene órdenes asociadas)." });
        }

        _context.Products.Remove(product);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
