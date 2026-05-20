# EcoConecta — Marketplace de Productores Rurales

Plataforma web e-commerce **fullstack** que conecta productores rurales con consumidores urbanos.

## Tecnologías

| Capa | Tecnología |
|------|-----------|
| **Backend** | ASP.NET Core (.NET 10), Entity Framework Core 9, SQL Server |
| **Frontend** | React 19 + TypeScript, Vite, React Router DOM |
| **Base de datos** | SQL Server LocalDB / SQL Server |
| **Documentación API** | Swagger UI (Swashbuckle) |

## Estructura del proyecto

```
Web-e-commerce/
├── WebApp.Server/                  # Backend ASP.NET Core
│   ├── Controllers/
│   │   ├── ProductsController.cs   # GET/POST/PUT/DELETE productos
│   │   ├── CategoriesController.cs # GET/POST/PUT/DELETE categorías
│   │   └── OrdersController.cs     # GET/POST/PUT/DELETE pedidos
│   ├── Models/
│   │   ├── Product.cs
│   │   ├── Category.cs
│   │   ├── Order.cs
│   │   └── OrderItem.cs
│   ├── Data/
│   │   ├── AppDbContext.cs          # DbContext + seed data
│   │   └── Migrations/
│   ├── Program.cs                  # Configuración: Swagger, EF Core, CORS
│   └── appsettings.json
│
└── webapp.client/                  # Frontend React + TypeScript
    └── src/
        ├── services/api.ts         # Cliente HTTP tipado
        ├── types/index.ts          # Tipos TypeScript
        └── pages/
            ├── Products.tsx        # Catálogo con búsqueda, filtros y carrito
            └── Dashboard.tsx       # Panel admin: estadísticas, CRUD, pedidos
```

## Endpoints disponibles

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/products` | Listar productos (con filtros) |
| GET | `/api/products/{id}` | Obtener producto por ID |
| POST | `/api/products` | Crear producto |
| PUT | `/api/products/{id}` | Actualizar producto |
| DELETE | `/api/products/{id}` | Eliminar producto |
| GET | `/api/categories` | Listar categorías |
| POST | `/api/categories` | Crear categoría |
| PUT | `/api/categories/{id}` | Actualizar categoría |
| DELETE | `/api/categories/{id}` | Eliminar categoría |
| GET | `/api/orders` | Listar pedidos |
| GET | `/api/orders/{id}` | Obtener pedido con artículos |
| POST | `/api/orders` | Crear pedido (descuenta stock) |
| PUT | `/api/orders/{id}/status` | Actualizar estatus del pedido |
| DELETE | `/api/orders/{id}` | Cancelar pedido (restaura stock) |

## Instalación y ejecución

### Requisitos
- .NET 10 SDK
- SQL Server o SQL Server LocalDB
- Node.js 18+

### Pasos

1. **Clonar el repositorio**
   ```bash
   git clone <url-del-repo>
   ```

2. **Configurar la base de datos**  
   Edita `WebApp.Server/appsettings.json` si tu instancia de SQL Server es diferente:
   ```json
   "DefaultConnection": "Server=(localdb)\\MSSQLLocalDB;Database=EcoConectaDb;Trusted_Connection=True;TrustServerCertificate=True;"
   ```

3. **Aplicar migraciones**
   ```bash
   cd WebApp.Server
   dotnet ef database update
   ```

4. **Iniciar el proyecto**
   ```bash
   # Terminal 1 — Backend
   cd WebApp.Server
   dotnet run

   # Terminal 2 — Frontend
   cd webapp.client
   npm install && npm run dev
   ```

5. **Acceder a la aplicación**
   - App: https://localhost:61398
   - Swagger UI: https://localhost:7058/swagger

## Autores
- Julio Oliver Garcia Quintana
- Brandon Peinado Borquez

## Unidad 4 — Programación Web | Mayo 2026
