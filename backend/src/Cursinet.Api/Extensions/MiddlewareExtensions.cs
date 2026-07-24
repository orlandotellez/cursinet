using Cursinet.Api.Middleware;
using Cursinet.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Cursinet.Api.Extensions;

public static class MiddlewareExtensions
{
    public static async Task<WebApplication> ConfigureMiddlewareAsync(this WebApplication app)
    {
        using (var scope = app.Services.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            // Aplica migraciones pendientes (crea las tablas si no existen)
            await context.Database.MigrateAsync();

            var seeder = scope.ServiceProvider.GetRequiredService<DataSeeder>();
            await seeder.SeedAsync();
        }

        if (app.Environment.IsDevelopment())
        {
            app.MapOpenApi();
        }

        app.UseHttpsRedirection();

        app.UseCors();

        app.UseResponseCaching();

        app.UseMiddleware<ErrorHandlingMiddleware>();

        app.UseAuthentication();
        app.UseAuthorization();

        app.MapControllers();

        app.MapGet("/health", () => "ok");

        return app;
    }
}
