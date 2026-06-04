using Microsoft.Extensions.Logging;
using Cursinet.Application.Common.Interfaces;

namespace Cursinet.Infrastructure.Services;

/// Development email service — logs to console instead of sending real emails.
/// Replace with SMTP/SendGrid/Mailgun in production.
public class DevEmailService : IEmailService
{
    private readonly ILogger<DevEmailService> _logger;

    public DevEmailService(ILogger<DevEmailService> logger)
    {
        _logger = logger;
    }

    public Task SendVerificationEmailAsync(string to, string userName, string code)
    {
        _logger.LogInformation(
            "=== EMAIL (DEV) ===\nTo: {To}\nSubject: Verify your email\nBody:\nHi {UserName},\n" +
            "Use this code to verify your email: {Code}\n" +
            "Or click: http://localhost:3000/verificar-email?identifier={To}&code={Code}\n" +
            "==================",
            to, userName, code, Uri.EscapeDataString(to), code);

        return Task.CompletedTask;
    }

    public Task SendPasswordResetEmailAsync(string to, string userName, string code)
    {
        _logger.LogInformation(
            "=== EMAIL (DEV) ===\nTo: {To}\nSubject: Password Reset\nBody:\nHi {UserName},\n" +
            "Use this code to reset your password: {Code}\n" +
            "Or click: http://localhost:3000/restablecer?email={To}&code={Code}\n" +
            "This code expires in 15 minutes.\n" +
            "==================",
            to, userName, code, Uri.EscapeDataString(to), code);

        return Task.CompletedTask;
    }
}
