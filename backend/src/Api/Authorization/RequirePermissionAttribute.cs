using Microsoft.AspNetCore.Authorization;

namespace Cursinet.Api.Authorization;

/// Atajo para [Authorize(Policy = "...")].
/// Uso: [RequirePermission(Permissions.CourseCreate)]
[AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, AllowMultiple = true)]
public class RequirePermissionAttribute : AuthorizeAttribute
{
    public RequirePermissionAttribute(string permission)
        : base(policy: permission)
    {
    }
}
