using System.Security.Claims;
using Cursinet.Domain.Enums;

namespace Cursinet.Application.Common.Interfaces;

public interface ITokenService
{
    (string accessToken, string refreshToken) GenerateTokens(Guid userId, string email, UserRole role);
    ClaimsPrincipal? ValidateAccessToken(string token);
    ClaimsPrincipal? ValidateRefreshToken(string token);
}
