using System.Security.Claims;
using Cursinet.Api.Helpers;
using Cursinet.Domain.Enums;
using Cursinet.Domain.Exceptions;
using Microsoft.AspNetCore.Http;
using NSubstitute;
using Shouldly;

namespace Cursinet.Api.Tests.Helpers;

public class AuthHelperTests
{
    private static HttpContext BuildContext(params Claim[] claims)
    {
        var identity = new ClaimsIdentity(claims, "TestAuth");
        var principal = new ClaimsPrincipal(identity);
        var ctx = Substitute.For<HttpContext>();
        ctx.User.Returns(principal);
        return ctx;
    }

    // ─── GetCurrentUserId ──────────────────────────────────────

    [Fact]
    public void GetCurrentUserId_WithValidGuidClaim_ShouldParseGuid()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var ctx = BuildContext(new Claim(ClaimTypes.NameIdentifier, userId.ToString()));

        // Act
        var result = ctx.GetCurrentUserId();

        // Assert
        result.ShouldBe(userId);
    }

    [Fact]
    public void GetCurrentUserId_WithoutClaim_ShouldReturnNull()
    {
        // Arrange
        var ctx = BuildContext(); // no claims

        // Act
        var result = ctx.GetCurrentUserId();

        // Assert
        result.ShouldBeNull();
    }

    [Fact]
    public void GetCurrentUserId_WithInvalidGuidFormat_ShouldReturnNull()
    {
        // Arrange
        var ctx = BuildContext(new Claim(ClaimTypes.NameIdentifier, "not-a-guid"));

        // Act
        var result = ctx.GetCurrentUserId();

        // Assert
        result.ShouldBeNull();
    }

    // ─── GetCurrentUserRole ─────────────────────────────────────

    [Fact]
    public void GetCurrentUserRole_WithValidRole_ShouldParseEnum()
    {
        // Arrange
        var ctx = BuildContext(new Claim(ClaimTypes.Role, "Instructor"));

        // Act
        var result = ctx.GetCurrentUserRole();

        // Assert
        result.ShouldBe(UserRole.Instructor);
    }

    [Fact]
    public void GetCurrentUserRole_WithoutClaim_ShouldThrowUnauthorized()
    {
        // Arrange
        var ctx = BuildContext(); // no claims

        // Act & Assert
        var ex = Should.Throw<AppException>(() => ctx.GetCurrentUserRole());
        ex.StatusCode.ShouldBe(401);
        ex.Code.ShouldBe("UNAUTHORIZED");
    }

    [Fact]
    public void GetCurrentUserRole_WithInvalidRole_ShouldThrowUnauthorized()
    {
        // Arrange
        var ctx = BuildContext(new Claim(ClaimTypes.Role, "NotARealRole"));

        // Act & Assert
        var ex = Should.Throw<AppException>(() => ctx.GetCurrentUserRole());
        ex.StatusCode.ShouldBe(401);
        ex.Code.ShouldBe("UNAUTHORIZED");
    }

    // ─── GetCurrentUserRoleOrDefault ────────────────────────────────

    [Fact]
    public void GetCurrentUserRoleOrDefault_WithoutClaim_ShouldReturnNull()
    {
        // Arrange — anonymous users have no Role claim; the
        // [AllowAnonymous] code path must accept that with role=null.
        var ctx = BuildContext(); // no claims

        // Act
        var result = ctx.GetCurrentUserRoleOrDefault();

        // Assert
        result.ShouldBeNull();
    }

    [Fact]
    public void GetCurrentUserRoleOrDefault_WithValidRole_ShouldReturnRole()
    {
        // Arrange
        var ctx = BuildContext(new Claim(ClaimTypes.Role, "Instructor"));

        // Act
        var result = ctx.GetCurrentUserRoleOrDefault();

        // Assert
        result.ShouldBe(UserRole.Instructor);
    }

    [Fact]
    public void GetCurrentUserRoleOrDefault_WithInvalidRole_ShouldStillThrow()
    {
        // A present-but-garbage role claim is a misconfiguration, so we still
        // throw — only the missing-claim case is silent.
        var ctx = BuildContext(new Claim(ClaimTypes.Role, "NotARealRole"));

        // Act & Assert
        var ex = Should.Throw<AppException>(() => ctx.GetCurrentUserRoleOrDefault());
        ex.StatusCode.ShouldBe(401);
        ex.Code.ShouldBe("UNAUTHORIZED");
    }
}
