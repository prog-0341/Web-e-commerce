using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApp.Server.Data;
using WebApp.Server.Models;

namespace WebApp.Server.Controllers;

/// <summary>
/// Gestión de categorías de productos.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class CategoriesController : ControllerBase
{
    private readonly AppDbContext _context;

    public CategoriesController(AppDbContext context) => _context = context;

    /// <summary>Obtiene todas las categorías.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<Category>), 200)]
    public async Task<ActionResult<IEnumerable<Category>>> GetCategories()
    {
        var categories = await _context.Categories.OrderBy(c => c.Name).ToListAsync();
        return Ok(categories);
    }

    /// <summary>Obtiene una categoría por su ID, incluyendo sus productos.</summary>
    /// <param name="id">ID de la categoría.</param>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(object), 200)]
    [ProducesResponseType(404)]
    public async Task<ActionResult> GetCategory(int id)
    {
        var category = await _context.Categories
            .Include(c => c.Products.Where(p => p.IsActive))
            .FirstOrDefaultAsync(c => c.Id == id);

        if (category is null)
            return NotFound(new { message = $"Categoría con ID {id} no encontrada." });

        return Ok(new
        {
            category.Id,
            category.Name,
            category.Description,
            ProductCount = category.Products.Count,
            Products = category.Products
        });
    }

    /// <summary>Crea una nueva categoría.</summary>
    /// <param name="category">Datos de la categoría.</param>
    [HttpPost]
    [ProducesResponseType(typeof(Category), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(409)]
    public async Task<ActionResult<Category>> CreateCategory([FromBody] Category category)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var exists = await _context.Categories
            .AnyAsync(c => c.Name.ToLower() == category.Name.ToLower());
        if (exists)
            return Conflict(new { message = $"Ya existe una categoría con el nombre '{category.Name}'." });

        category.Id = 0;
        _context.Categories.Add(category);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, category);
    }

    /// <summary>Actualiza una categoría existente.</summary>
    /// <param name="id">ID de la categoría a actualizar.</param>
    /// <param name="category">Nuevos datos de la categoría.</param>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(Category), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<Category>> UpdateCategory(int id, [FromBody] Category category)
    {
        if (id != category.Id)
            return BadRequest(new { message = "El ID de la URL no coincide con el ID del cuerpo." });

        var existing = await _context.Categories.FindAsync(id);
        if (existing is null)
            return NotFound(new { message = $"Categoría con ID {id} no encontrada." });

        existing.Name = category.Name;
        existing.Description = category.Description;

        await _context.SaveChangesAsync();
        return Ok(existing);
    }

    /// <summary>Elimina una categoría. Solo si no tiene productos asociados.</summary>
    /// <param name="id">ID de la categoría a eliminar.</param>
    [HttpDelete("{id}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(404)]
    [ProducesResponseType(409)]
    public async Task<IActionResult> DeleteCategory(int id)
    {
        var category = await _context.Categories.FindAsync(id);
        if (category is null)
            return NotFound(new { message = $"Categoría con ID {id} no encontrada." });

        var hasProducts = await _context.Products.AnyAsync(p => p.CategoryId == id);
        if (hasProducts)
            return Conflict(new { message = "No se puede eliminar la categoría porque tiene productos asociados." });

        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
