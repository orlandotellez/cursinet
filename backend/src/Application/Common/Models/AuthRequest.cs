using Cursinet.Domain.Enums;

namespace Cursinet.Application.Common.Models;

public record LoginRequest(
    string Email,
    string Password
);

public record RegisterRequest(
    string Name,
    string Email,
    string Password,
    UserRole? Role = null
);

public record RefreshRequest(
    string RefreshToken
);

public record VerifyEmailRequest(
    string Identifier,
    string Code
);

public record ForgotPasswordRequest(
    string Email
);

public record ResetPasswordRequest(
    string Email,
    string Code,
    string NewPassword
);

public record ResendVerificationRequest(
    string Email
);

public record UpdateMyProfileRequest(
    string? Name = null,
    string? Bio = null,
    string? Phone = null,
    string? UserName = null,
    string? WebsiteUrl = null,
    string? GithubUrl = null,
    string? LinkedinUrl = null,
    string? Image = null
);

public record ChangePasswordRequest(
    string CurrentPassword,
    string NewPassword
);
