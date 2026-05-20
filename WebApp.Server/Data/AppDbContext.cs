using Microsoft.EntityFrameworkCore;
using WebApp.Server.Models;

namespace WebApp.Server.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Product> Products => Set<Product>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Product>()
            .Property(p => p.Price)
            .HasColumnType("decimal(18,2)");

        modelBuilder.Entity<OrderItem>()
            .Property(oi => oi.UnitPrice)
            .HasColumnType("decimal(18,2)");

        modelBuilder.Entity<Order>()
            .Property(o => o.Total)
            .HasColumnType("decimal(18,2)");

        // Ignorar propiedad calculada (no se persiste en BD)
        modelBuilder.Entity<OrderItem>()
            .Ignore(oi => oi.Subtotal);

        // Datos iniciales — categorías
        modelBuilder.Entity<Category>().HasData(
            new Category { Id = 1, Name = "Verduras", Description = "Verduras frescas y orgánicas" },
            new Category { Id = 2, Name = "Frutas", Description = "Frutas de temporada" },
            new Category { Id = 3, Name = "Artesanal", Description = "Productos artesanales y procesados" }
        );

        // Datos iniciales — productos
        var baseDate = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        modelBuilder.Entity<Product>().HasData(
            new Product
            {
                Id = 1, Name = "Tomates Orgánicos", Description = "Tomates frescos cultivados sin pesticidas",
                Price = 45, Stock = 100, Unit = "kg", Producer = "Rancho El Sol",
                CategoryId = 1, IsActive = true, CreatedAt = baseDate
            },
            new Product
            {
                Id = 2, Name = "Miel de Abeja Pura", Description = "Miel 100% natural sin aditivos",
                Price = 120, Stock = 50, Unit = "frasco", Producer = "Apicultura Flores",
                CategoryId = 3, IsActive = true, CreatedAt = baseDate
            },
            new Product
            {
                Id = 3, Name = "Aguacates Hass", Description = "Aguacates cremosos de Michoacán",
                Price = 80, Stock = 200, Unit = "kg", Producer = "Huerto Verde",
                CategoryId = 2, IsActive = true, CreatedAt = baseDate
            },
            new Product
            {
                Id = 4, Name = "Chile Serrano", Description = "Chile serrano fresco de Milpa Alta",
                Price = 35, Stock = 150, Unit = "kg", Producer = "Milpa Alta",
                CategoryId = 1, IsActive = true, CreatedAt = baseDate
            },
            new Product
            {
                Id = 5, Name = "Mermelada de Fresa", Description = "Mermelada artesanal sin conservadores",
                Price = 65, Stock = 30, Unit = "frasco", Producer = "Delicias del Campo",
                CategoryId = 3, IsActive = true, CreatedAt = baseDate
            }
        );
    }
}
