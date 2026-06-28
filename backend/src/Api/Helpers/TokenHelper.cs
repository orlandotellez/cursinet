using System.Security.Claims;
using Cursinet.Application.Common.Interfaces;
using Cursinet.Domain.Enums;
using Microsoft.AspNetCore.Http;

namespace Cursinet.Api.Helpers;

public class TokenHelper
{
    private readonly ITokenService _tokenService;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public TokenHelper(ITokenService tokenService, IHttpContextAccessor httpContextAccessor)
    {
        _tokenService = tokenService;
        _httpContextAccessor = httpContextAccessor;
    }

    public (string accessToken, string refreshToken) GenerateTokens(
        Guid userId, string email, UserRole role)
        => _tokenService.GenerateTokens(userId, email, role);

    public ClaimsPrincipal? ValidateAccessToken(string token)
        => _tokenService.ValidateAccessToken(token);

    public ClaimsPrincipal? ValidateRefreshToken(string token)
        => _tokenService.ValidateRefreshToken(token);

    public string GetRefreshToken(string? bodyRefreshToken = null)
    {
        var context = _httpContextAccessor.HttpContext;
        if (context == null) return string.Empty;

        var cookieToken = context.Request.Cookies["refreshToken"];
        if (!string.IsNullOrEmpty(cookieToken))
            return cookieToken;

        return bodyRefreshToken ?? string.Empty;
    }
}
