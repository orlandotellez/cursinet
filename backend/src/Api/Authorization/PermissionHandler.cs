using Microsoft.AspNetCore.Authorization;

namespace Cursinet.Api.Authorization;

/// Authorization handler que verifica si el JWT contiene el claim "permission"
/// con el valor del permiso requerido.
///
/// Los permisos se inyectan como claims al generar el token en TokenService.
/// Esto hace que la validación sea rápida (sin DB lookup) y stateless.
public class PermissionHandler : AuthorizationHandler<PermissionRequirement>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        PermissionRequirement requirement)
    {
        if (context.User.HasClaim("permission", requirement.Permission))
            context.Succeed(requirement);

        return Task.CompletedTask;
    }
}
