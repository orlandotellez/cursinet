using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using NSubstitute;

namespace Cursinet.Api.Tests.TestInfrastructure;

/// <summary>
/// Base class for controller unit tests.
/// Provides helper methods to set up HttpContext with JWT claims.
/// </summary>
public abstract class ControllerTestBase
{
    /// <summary>
    /// Sets up the controller's HttpContext with a ClaimsPrincipal that includes
    /// NameIdentifier and Role claims, simulating an authenticated request.
    /// </summary>
    protected static void SetUserAuth(ControllerBase controller, Guid userId, string role = "Student")
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, userId.ToString()),
            new(ClaimTypes.Role, role),
        };

        var identity = new ClaimsIdentity(claims, "TestAuth");
        var principal = new ClaimsPrincipal(identity);

        var httpContext = Substitute.For<HttpContext>();
        httpContext.User.Returns(principal);

        controller.ControllerContext = new ControllerContext
        {
            HttpContext = httpContext,
        };
    }

    /// <summary>
    /// Sets up the controller's HttpContext WITHOUT claims, simulating an unauthenticated request.
    /// </summary>
    protected static void SetAnonymous(ControllerBase controller)
    {
        var identity = new ClaimsIdentity();
        var principal = new ClaimsPrincipal(identity);

        var httpContext = Substitute.For<HttpContext>();
        httpContext.User.Returns(principal);

        controller.ControllerContext = new ControllerContext
        {
            HttpContext = httpContext,
        };
    }
}
