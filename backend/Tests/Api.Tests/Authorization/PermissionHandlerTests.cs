using System.Security.Claims;
using Cursinet.Api.Authorization;
using Microsoft.AspNetCore.Authorization;
using NSubstitute;
using Shouldly;

namespace Cursinet.Api.Tests.Authorization;

public class PermissionHandlerTests
{
    private readonly PermissionHandler _handler;

    public PermissionHandlerTests()
    {
        _handler = new PermissionHandler();
    }

    private static AuthorizationHandlerContext BuildContext(string permission, params Claim[] extraClaims)
    {
        var identity = new ClaimsIdentity();
        foreach (var claim in extraClaims)
            identity.AddClaim(claim);

        var principal = new ClaimsPrincipal(identity);
        var requirements = new[] { new PermissionRequirement(permission) };

        return new AuthorizationHandlerContext(requirements, principal, resource: null);
    }

    [Fact]
    public async Task HandleRequirementAsync_WhenUserHasPermissionClaim_ShouldSucceed()
    {
        // Arrange
        var ctx = BuildContext(
            "courses:create",
            new Claim("permission", "courses:create"));

        // Act
        await _handler.HandleAsync(ctx);

        // Assert
        ctx.HasSucceeded.ShouldBeTrue();
    }

    [Fact]
    public async Task HandleRequirementAsync_WhenUserHasDifferentPermission_ShouldNotSucceed()
    {
        // Arrange — user only has courses:read but we require courses:create
        var ctx = BuildContext(
            "courses:create",
            new Claim("permission", "courses:read"));

        // Act
        await _handler.HandleAsync(ctx);

        // Assert
        ctx.HasSucceeded.ShouldBeFalse();
    }

    [Fact]
    public async Task HandleRequirementAsync_WhenUserHasNoClaims_ShouldNotSucceed()
    {
        // Arrange
        var ctx = BuildContext("courses:create");

        // Act
        await _handler.HandleAsync(ctx);

        // Assert
        ctx.HasSucceeded.ShouldBeFalse();
    }

    [Fact]
    public async Task HandleRequirementAsync_WhenUserHasMultiplePermissions_ShouldMatchCorrectOne()
    {
        // Arrange
        var ctx = BuildContext(
            "users:delete",
            new Claim("permission", "courses:read"),
            new Claim("permission", "users:delete"),
            new Claim("permission", "admin:panel"));

        // Act
        await _handler.HandleAsync(ctx);

        // Assert — match found
        ctx.HasSucceeded.ShouldBeTrue();
    }

    [Fact]
    public async Task HandleRequirementAsync_WhenClaimHasDifferentType_ShouldNotSucceed()
    {
        // Arrange — claim with same value but different claim type
        var ctx = BuildContext(
            "courses:create",
            new Claim("role", "courses:create")); // not "permission"

        // Act
        await _handler.HandleAsync(ctx);

        // Assert
        ctx.HasSucceeded.ShouldBeFalse();
    }

    [Fact]
    public void PermissionRequirement_ShouldExposePermissionProperty()
    {
        // Arrange & Act
        var req = new PermissionRequirement("courses:create");

        // Assert
        req.Permission.ShouldBe("courses:create");
    }
}
