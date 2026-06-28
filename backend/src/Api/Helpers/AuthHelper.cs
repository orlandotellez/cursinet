using System.Security.Claims;
using Cursinet.Domain.Enums;
using Cursinet.Domain.Exceptions;
using Microsoft.AspNetCore.Http;

namespace Cursinet.Api.Helpers;

public static class AuthHelper
{
    public static Guid? GetCurrentUserId(this HttpContext httpContext)
    {
        var userIdClaim = httpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return userIdClaim != null && Guid.TryParse(userIdClaim, out var userId) ? userId : null;
    }

    public static UserRole GetCurrentUserRole(this HttpContext httpContext)
    {
        var roleClaim = httpContext.User.FindFirst(ClaimTypes.Role)?.Value
            ?? throw AppExceptions.Unauthorized("User role claim is missing");

        if (!Enum.TryParse<UserRole>(roleClaim, out var role))
            throw AppExceptions.Unauthorized($"Invalid user role: {roleClaim}");

        return role;
    }

    /// <summary>
    /// Non-throwing variant of <see cref="GetCurrentUserRole"/> intended for endpoints
    /// marked <c>[AllowAnonymous]</c>. Returns <c>null</c> when the Role claim is
    /// missing (anonymous or partial auth), and still throws when the claim is present
    /// but its value is not a valid <see cref="UserRole"/> (which indicates a misconfigured token).
    /// </summary>
    public static UserRole? GetCurrentUserRoleOrDefault(this HttpContext httpContext)
    {
        var roleClaim = httpContext.User.FindFirst(ClaimTypes.Role)?.Value;
        if (roleClaim == null) return null;

        if (!Enum.TryParse<UserRole>(roleClaim, out var role))
            throw AppExceptions.Unauthorized($"Invalid user role: {roleClaim}");

        return role;
    }
}
