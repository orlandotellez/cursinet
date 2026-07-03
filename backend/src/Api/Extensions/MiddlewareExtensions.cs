using Cursinet.Api.Middleware;
using Cursinet.Infrastructure.Persistence;

namespace Cursinet.Api.Extensions;

public static class MiddlewareExtensions
{
    public static async Task<WebApplication> ConfigureMiddlewareAsync(this WebApplication app)
    {
        using (var scope = app.Services.CreateScope())
        {
            var seeder = scope.ServiceProvider.GetRequiredService<DataSeeder>();
            await seeder.SeedAsync();
        }

        if (app.Environment.IsDevelopment())
        {
            app.MapOpenApi();
        }

        app.UseHttpsRedirection();

        app.UseCors();

        app.UseMiddleware<ErrorHandlingMiddleware>();

        app.UseAuthentication();
        app.UseAuthorization();

        app.MapControllers();

        app.MapGet("/health", () => "ok");

        return app;
    }
}
