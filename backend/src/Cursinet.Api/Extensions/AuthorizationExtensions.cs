using Cursinet.Api.Authorization;
using Cursinet.Domain.Enums;
using Microsoft.AspNetCore.Authorization;

namespace Cursinet.Api.Extensions;

public static class AuthorizationExtensions
{
    public static IServiceCollection AddAuthorizationConfiguration(this IServiceCollection services)
    {
        services.AddSingleton<IAuthorizationHandler, PermissionHandler>();
        services.AddAuthorization(options =>
        {
            foreach (var permission in Permissions.All)
            {
                options.AddPolicy(permission, policy =>
                    policy.Requirements.Add(new PermissionRequirement(permission)));
            }
        });

        return services;
    }
}
