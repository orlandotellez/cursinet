namespace Cursinet.Application.Common.Interfaces;

/// Service for sending emails (verification, password reset, etc.)
public interface IEmailService
{
    Task SendVerificationEmailAsync(string to, string userName, string code);
    Task SendPasswordResetEmailAsync(string to, string userName, string code);
}
