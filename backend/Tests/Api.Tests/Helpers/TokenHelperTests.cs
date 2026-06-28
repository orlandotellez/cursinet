using System.Security.Claims;
using Cursinet.Api.Helpers;
using Cursinet.Application.Common.Interfaces;
using Cursinet.Domain.Enums;
using Microsoft.AspNetCore.Http;
using NSubstitute;
using Shouldly;

namespace Cursinet.Api.Tests.Helpers;

public class TokenHelperTests
{
    private readonly ITokenService _tokenService;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly TokenHelper _helper;

    public TokenHelperTests()
    {
        _tokenService = Substitute.For<ITokenService>();
        _httpContextAccessor = Substitute.For<IHttpContextAccessor>();
        _helper = new TokenHelper(_tokenService, _httpContextAccessor);
    }

    [Fact]
    public void GenerateTokens_ShouldDelegateToTokenService()
    {
        // Arrange
        var userId = Guid.NewGuid();
        _tokenService.GenerateTokens(userId, "user@test.com", UserRole.Student)
            .Returns(("access-1", "refresh-1"));

        // Act
        var result = _helper.GenerateTokens(userId, "user@test.com", UserRole.Student);

        // Assert
        result.accessToken.ShouldBe("access-1");
        result.refreshToken.ShouldBe("refresh-1");
    }

    [Fact]
    public void ValidateAccessToken_ShouldDelegateToTokenService()
    {
        // Arrange
        var principal = new ClaimsPrincipal(new ClaimsIdentity());
        _tokenService.ValidateAccessToken("token-abc").Returns(principal);

        // Act
        var result = _helper.ValidateAccessToken("token-abc");

        // Assert
        result.ShouldBeSameAs(principal);
    }

    [Fact]
    public void ValidateRefreshToken_ShouldDelegateToTokenService()
    {
        // Arrange
        var principal = new ClaimsPrincipal(new ClaimsIdentity());
        _tokenService.ValidateRefreshToken("token-xyz").Returns(principal);

        // Act
        var result = _helper.ValidateRefreshToken("token-xyz");

        // Assert
        result.ShouldBeSameAs(principal);
    }

    [Fact]
    public void GetRefreshToken_WithNoContext_ShouldReturnEmpty()
    {
        // Arrange
        _httpContextAccessor.HttpContext.Returns((HttpContext?)null);

        // Act
        var result = _helper.GetRefreshToken();

        // Assert
        result.ShouldBe(string.Empty);
    }

    [Fact]
    public void GetRefreshToken_WithCookie_ShouldReturnCookieValue()
    {
        // Arrange
        var ctx = new DefaultHttpContext();
        ctx.Request.Headers["Cookie"] = "refreshToken=from-cookie";
        _httpContextAccessor.HttpContext.Returns(ctx);

        // Act
        var result = _helper.GetRefreshToken("from-body");

        // Assert
        result.ShouldBe("from-cookie");
    }

    [Fact]
    public void GetRefreshToken_WithoutCookieButWithBody_ShouldReturnBodyToken()
    {
        // Arrange
        var ctx = new DefaultHttpContext();
        _httpContextAccessor.HttpContext.Returns(ctx);

        // Act
        var result = _helper.GetRefreshToken("from-body");

        // Assert
        result.ShouldBe("from-body");
    }

    [Fact]
    public void GetRefreshToken_WithoutCookieOrBody_ShouldReturnEmpty()
    {
        // Arrange
        var ctx = new DefaultHttpContext();
        _httpContextAccessor.HttpContext.Returns(ctx);

        // Act
        var result = _helper.GetRefreshToken();

        // Assert
        result.ShouldBe(string.Empty);
    }

    [Fact]
    public void GetRefreshToken_WithEmptyCookieAndNullBody_ShouldReturnEmpty()
    {
        // Arrange — empty Cookie header means no refreshToken cookie present,
        // so GetRefreshToken returns the body fallback (which is null here).
        var ctx = new DefaultHttpContext();
        _httpContextAccessor.HttpContext.Returns(ctx);

        // Act
        var result = _helper.GetRefreshToken(null);

        // Assert
        result.ShouldBe(string.Empty);
    }
}
