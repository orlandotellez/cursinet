using Cursinet.Api.Helpers;
using Cursinet.Application.Common.Interfaces;
using Cursinet.Application.Common.Models;
using Microsoft.AspNetCore.Mvc;

namespace Cursinet.Api.Controllers;

[ApiController]
[Route("api/v1/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IConfiguration _configuration;
    private readonly IWebHostEnvironment _environment;
    private readonly AuthHelper _authHelper;
    private readonly CookieHelper _cookieHelper;
    private readonly TokenHelper _tokenHelper;

    public AuthController(
        IAuthService authService,
        IConfiguration configuration,
        IWebHostEnvironment environment,
        AuthHelper authHelper,
        CookieHelper cookieHelper,
        TokenHelper tokenHelper)
    {
        _authService = authService;
        _configuration = configuration;
        _environment = environment;
        _authHelper = authHelper;
        _cookieHelper = cookieHelper;
        _tokenHelper = tokenHelper;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
    {
        var currentUserId = await _authHelper.ResolveCurrentUserId();

        if (currentUserId.HasValue)
        {
            return Conflict("Already logged in. Please logout before creating a new account.");
        }

        var result = await _authService.RegisterAsync(request);

        _cookieHelper.SetAuthCookies(result.AccessToken, result.RefreshToken);

        return CreatedAtAction(null, new
        {
            message = result.Message,
            user = result.User
        });

    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
    {
        var currentUserId = await _authHelper.ResolveCurrentUserId();

        var result = await _authService.LoginAsync(request);

        if (currentUserId.HasValue && currentUserId != result.User?.Id)
        {
            _cookieHelper.ClearAuthCookies();
        }

        _cookieHelper.SetAuthCookies(result.AccessToken, result.RefreshToken);

        return Ok(new
        {
            message = result.Message,
            user = result.User
        });
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<RefreshResponse>> Refresh([FromBody] RefreshRequest? request = null)
    {
        var refreshToken = _tokenHelper.GetRefreshToken(request?.RefreshToken);
        if (string.IsNullOrEmpty(refreshToken))
            return BadRequest(new { error = "Refresh token is required" });

        var result = await _authService.RefreshAsync(refreshToken);

        _cookieHelper.SetAuthCookies(result.AccessToken, result.RefreshToken);

        return Ok(result);
    }

    [HttpPost("logout")]
    public async Task<ActionResult> Logout()
    {
        var refreshToken = _tokenHelper.GetRefreshToken();
        if (!string.IsNullOrEmpty(refreshToken))
        {
            await _authService.LogoutAsync(refreshToken);
        }
        _cookieHelper.ClearAuthCookies();
        return Ok(new { message = "Logged out successfully" });
    }
}
