using Cursinet.Api.Helpers;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;
using NSubstitute;
using Shouldly;

namespace Cursinet.Api.Tests.Helpers;

public class CookieHelperTests
{
    private readonly IWebHostEnvironment _environment;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly DefaultHttpContext _httpContext;

    public CookieHelperTests()
    {
        _environment = Substitute.For<IWebHostEnvironment>();
        _httpContextAccessor = Substitute.For<IHttpContextAccessor>();
        _httpContext = new DefaultHttpContext();
        _httpContextAccessor.HttpContext.Returns(_httpContext);
    }

    [Fact]
    public void SetAuthCookies_InDevelopment_ShouldAppendBothCookiesWithNonSecureFlag()
    {
        // Arrange — EnvironmentName defaults to null on the substitute, so
        // HostingEnvironmentExtensions.IsProduction() naturally returns false.
        // No explicit stub needed here.
        var helper = new CookieHelper(_environment, _httpContextAccessor);

        // Act
        helper.SetAuthCookies("access-token-123", "refresh-token-456");

        // Assert
        var setHeaders = _httpContext.Response.Headers.SetCookie;
        setHeaders.Count.ShouldBe(2);

        var accessCookie = setHeaders[0]!;
        accessCookie.ShouldContain("accessToken=access-token-123");
        accessCookie.ShouldContain("httponly");
        accessCookie.ShouldContain("samesite=strict");

        var refreshCookie = setHeaders[1]!;
        refreshCookie.ShouldContain("refreshToken=refresh-token-456");
        refreshCookie.ShouldContain("httponly");
    }

    [Fact]
    public void SetAuthCookies_InProduction_ShouldUseSecureFlag()
    {
        // Arrange — IsProduction() extension reads EnvironmentName, which is a
        // virtual property on IHostEnvironment so we can substitute it.
        _environment.EnvironmentName.Returns("Production");
        var helper = new CookieHelper(_environment, _httpContextAccessor);

        // Act
        helper.SetAuthCookies("access", "refresh");

        // Assert — both Set-Cookie entries should now include the "secure" flag.
        var setHeaders = _httpContext.Response.Headers.SetCookie;
        setHeaders.ShouldNotBeEmpty();
        foreach (var header in setHeaders)
        {
            header!.ShouldContain("secure");
        }
    }

    [Fact]
    public void SetAuthCookies_WhenHttpContextIsNull_ShouldBeNoOp()
    {
        // Arrange
        _httpContextAccessor.HttpContext.Returns((HttpContext?)null);
        var helper = new CookieHelper(_environment, _httpContextAccessor);

        // Act — must not throw
        Should.NotThrow(() => helper.SetAuthCookies("a", "r"));
    }

    [Fact]
    public void ClearAuthCookies_WhenHttpContextExists_ShouldNotThrow()
    {
        // Arrange — same as above; default substitute state makes IsProduction() return false.
        var helper = new CookieHelper(_environment, _httpContextAccessor);
        helper.SetAuthCookies("a", "r");

        // Act & Assert — verifying we can clear after setting up without throwing.
        // The exact Set-Cookie header behaviour is owned by ASP.NET Core's
        // DefaultHttpResponse and is covered by framework tests.
        Should.NotThrow(() => helper.ClearAuthCookies());
    }

    [Fact]
    public void ClearAuthCookies_WhenHttpContextIsNull_ShouldBeNoOp()
    {
        // Arrange
        _httpContextAccessor.HttpContext.Returns((HttpContext?)null);
        var helper = new CookieHelper(_environment, _httpContextAccessor);

        // Act — must not throw
        Should.NotThrow(() => helper.ClearAuthCookies());
    }
}
