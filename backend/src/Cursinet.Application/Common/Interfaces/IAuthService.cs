using Cursinet.Application.Common.Models;

namespace Cursinet.Application.Common.Interfaces;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
    Task<AuthResponse> LoginAsync(LoginRequest request);
    Task<RefreshResponse> RefreshAsync(string refreshToken);
    Task LogoutAsync(string refreshToken);
    Task<AuthResponse> VerifyEmailAsync(string identifier, string code);
    Task<ForgotPasswordResponse> ForgotPasswordAsync(string email);
    Task<ResetPasswordResponse> ResetPasswordAsync(string email, string code, string newPassword);
    Task ResendVerificationAsync(string email);
    Task<UserDto> UpdateMyProfileAsync(Guid userId, UpdateMyProfileRequest request);
    Task<UserDto> ChangePasswordAsync(Guid userId, ChangePasswordRequest request);
}
