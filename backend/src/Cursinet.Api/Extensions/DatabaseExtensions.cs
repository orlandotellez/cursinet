using Cursinet.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Cursinet.Api.Extensions;

public static class DatabaseExtensions
{
    public static IServiceCollection AddDatabase(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException(
                "DefaultConnection string is not configured. Set it in appsettings.json, user secrets, or environment variables.");

        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseNpgsql(connectionString, b => b.MigrationsAssembly("Cursinet.Infrastructure")));

        return services;
    }
}
