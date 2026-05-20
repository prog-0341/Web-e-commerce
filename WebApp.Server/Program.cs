using Microsoft.EntityFrameworkCore;
using WebApp.Server.Data;

var builder = WebApplication.CreateBuilder(args);

// Controladores con manejo de referencias circulares en JSON
builder.Services.AddControllers()
    .AddJsonOptions(options =>
        options.JsonSerializerOptions.ReferenceHandler =
            System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles);

// Swagger / OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new()
    {
        Title = "EcoConecta API",
        Version = "v1",
        Description = "API REST para e-commerce de productos orgánicos y artesanales."
    });

    // Incluir comentarios XML en Swagger
    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
        c.IncludeXmlComments(xmlPath);
});

// Entity Framework Core — SQL Server
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// CORS — permite peticiones desde el frontend React (dev y prod)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
        policy.WithOrigins("https://localhost:61398", "http://localhost:61398")
              .AllowAnyMethod()
              .AllowAnyHeader());
});

var app = builder.Build();

app.UseDefaultFiles();
app.MapStaticAssets();

// Swagger UI solo en desarrollo
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "EcoConecta API v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseAuthorization();
app.MapControllers();
app.MapFallbackToFile("/index.html");

// Aplicar migraciones y seed automáticamente al iniciar
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    try
    {
        db.Database.Migrate();
        logger.LogInformation("Base de datos lista.");
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Error al aplicar migraciones. Verifica la cadena de conexión en appsettings.json.");
    }
}

app.Run();
