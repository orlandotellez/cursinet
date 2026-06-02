using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Cursinet.Application.Common.Authorization;
using Cursinet.Application.Common.Interfaces;
using Cursinet.Domain.Enums;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace Cursinet.Infrastructure.Services;

public class TokenService : ITokenService
{
    private readonly string _secret;
    private readonly string _refreshSecret;
    private readonly TimeSpan _accessTokenExpiry;
    private readonly TimeSpan _refreshTokenExpiry;

    public TokenService(IConfiguration configuration)
    {
        _secret = configuration["Jwt:Secret"] 
            ?? throw new InvalidOperationException("JWT Secret is not configured");
        _refreshSecret = configuration["Jwt:RefreshSecret"] 
            ?? throw new InvalidOperationException("JWT RefreshSecret is not configured");
        _accessTokenExpiry = TimeSpan.Parse(
            configuration["Jwt:AccessTokenExpiry"] ?? "00:15:00");
        _refreshTokenExpiry = TimeSpan.Parse(
            configuration["Jwt:RefreshTokenExpiry"] ?? "7.00:00:00");
    }

    public (string accessToken, string refreshToken) GenerateTokens(
        Guid userId, string email, UserRole role)
    {
        var accessToken = GenerateAccessToken(userId, email, role);
        var refreshToken = GenerateRefreshToken(userId);

        return (accessToken, refreshToken);
    }

    public ClaimsPrincipal? ValidateAccessToken(string token)
    {
        return ValidateToken(token, _secret);
    }

    public ClaimsPrincipal? ValidateRefreshToken(string token)
    {
        return ValidateToken(token, _refreshSecret);
    }

    private string GenerateAccessToken(Guid userId, string email, UserRole role)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, userId.ToString()),
            new(JwtRegisteredClaimNames.Email, email),
            new(ClaimTypes.Role, role.ToString()),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };

        // Inyectar permisos del rol como claims individuales
        var permissions = RolePermissions.GetForRole(role);
        claims.AddRange(permissions.Select(p => new Claim("permission", p)));

        var token = new JwtSecurityToken(
            claims: claims,
            expires: DateTime.UtcNow.Add(_accessTokenExpiry),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private string GenerateRefreshToken(Guid userId)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_refreshSecret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };

        var token = new JwtSecurityToken(
            claims: claims,
            expires: DateTime.UtcNow.Add(_refreshTokenExpiry),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static ClaimsPrincipal? ValidateToken(string token, string secret)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));

        var tokenHandler = new JwtSecurityTokenHandler();

        try
        {
            var principal = tokenHandler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = key,
                ValidateIssuer = false,
                ValidateAudience = false,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero,
            }, out _);

            return principal;
        }
        catch
        {
            return null;
        }
    }
}
