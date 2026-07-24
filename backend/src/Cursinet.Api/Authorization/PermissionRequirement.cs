using Microsoft.AspNetCore.Authorization;

namespace Cursinet.Api.Authorization;

/// Representa un permiso específico que se requiere para acceder a un recurso.
/// Se usa junto con <see cref="PermissionHandler"/> para validar claims del JWT.
public record PermissionRequirement(string Permission) : IAuthorizationRequirement;
