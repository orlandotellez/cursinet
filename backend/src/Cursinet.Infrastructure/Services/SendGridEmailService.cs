using System.Net;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Cursinet.Application.Common.Interfaces;
using SendGrid;
using SendGrid.Helpers.Mail;

namespace Cursinet.Infrastructure.Services;

public class SendGridEmailService : IEmailService
{
    private readonly SendGridClient _client;
    private readonly SendGridOptions _options;
    private readonly ILogger<SendGridEmailService> _logger;

    public SendGridEmailService(IOptions<SendGridOptions> options, ILogger<SendGridEmailService> logger)
    {
        _options = options.Value;
        _client = new SendGridClient(_options.ApiKey);
        _logger = logger;
    }

    public async Task SendVerificationEmailAsync(string to, string userName, string code)
    {
        var from = new EmailAddress(_options.FromEmail, _options.FromName);
        var toEmail = new EmailAddress(to, userName);

        var htmlContent = BuildVerificationHtml(userName, code, to, _options.BaseUrl);
        var plainText = $"""
            Hola {userName},

            Gracias por registrarte en Cursinet. Para verificar tu dirección de correo electrónico, usa el siguiente código:

            {code}

            O haz clic en este enlace:
            {_options.BaseUrl}/verificar-email?identifier={Uri.EscapeDataString(to)}&code={code}

            Este código expira en 15 minutos.

            Si no creaste una cuenta en Cursinet, ignora este mensaje.

            Saludos,
            El equipo de Cursinet
            """;

        var msg = MailHelper.CreateSingleEmail(
            from,
            toEmail,
            "Verifica tu correo electrónico - Cursinet",
            plainText,
            htmlContent);

        var response = await _client.SendEmailAsync(msg);

        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Body.ReadAsStringAsync();
            _logger.LogError("SendGrid error al enviar verificación a {Email}: {StatusCode} - {Body}", to, response.StatusCode, body);
            return;
        }

        _logger.LogInformation("Verification email sent to {Email}", to);
    }

    public async Task SendPasswordResetEmailAsync(string to, string userName, string code)
    {
        var from = new EmailAddress(_options.FromEmail, _options.FromName);
        var toEmail = new EmailAddress(to, userName);

        var htmlContent = BuildPasswordResetHtml(userName, code, to, _options.BaseUrl);
        var plainText = $"""
            Hola {userName},

            Recibimos una solicitud para restablecer tu contraseña en Cursinet.

            Usa el siguiente código para restablecerla:
            {code}

            O haz clic en este enlace:
            {_options.BaseUrl}/restablecer?email={Uri.EscapeDataString(to)}&code={code}

            Este código expira en 15 minutos.

            Si no solicitaste restablecer tu contraseña, ignora este mensaje.

            Saludos,
            El equipo de Cursinet
            """;

        var msg = MailHelper.CreateSingleEmail(
            from,
            toEmail,
            "Restablece tu contraseña - Cursinet",
            plainText,
            htmlContent);

        var response = await _client.SendEmailAsync(msg);

        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Body.ReadAsStringAsync();
            _logger.LogError("SendGrid error al enviar restablecimiento a {Email}: {StatusCode} - {Body}", to, response.StatusCode, body);
            return;
        }

        _logger.LogInformation("Password reset email sent to {Email}", to);
    }

    private static string BuildVerificationHtml(string name, string code, string email, string baseUrl)
    {
        var encodedEmail = Uri.EscapeDataString(email);
        var safeName = WebUtility.HtmlEncode(name);

        return $"""
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            </head>
            <body style="margin:0;padding:0;background-color:#f4f4f5;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 0;">
                    <tr>
                        <td align="center">
                            <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                                <tr>
                                    <td style="background:linear-gradient(135deg,#7c3aed,#2563eb);padding:36px 40px;text-align:center;">
                                        <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">Cursinet</h1>
                                        <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Aprende sin límites</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:36px 40px;">
                                        <h2 style="margin:0 0 8px;color:#18181b;font-size:20px;">Verifica tu correo</h2>
                                        <p style="margin:0 0 24px;color:#52525b;font-size:14px;line-height:1.6;">
                                            Hola <strong>{safeName}</strong>,<br /><br />
                                            Gracias por registrarte en Cursinet. Para comenzar a aprender, verifica tu dirección de correo electrónico con el siguiente código:
                                        </p>
                                        <div style="background:#f4f4f5;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
                                            <p style="margin:0 0 8px;color:#52525b;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Tu código de verificación</p>
                                            <p style="margin:0;font-size:36px;font-weight:700;letter-spacing:8px;color:#7c3aed;font-family:monospace;">{code}</p>
                                        </div>
                                        <p style="margin:0 0 4px;color:#52525b;font-size:13px;line-height:1.5;">
                                            O haz clic en el siguiente enlace:
                                        </p>
                                        <p style="margin:0 0 24px;">
                                            <a href="{baseUrl}/verificar-email?identifier={encodedEmail}&code={code}" style="color:#2563eb;font-size:13px;">Verificar mi correo</a>
                                        </p>
                                        <p style="margin:0;color:#a1a1aa;font-size:12px;line-height:1.5;">
                                            Este código expira en <strong>15 minutos</strong>. Si no creaste una cuenta en Cursinet, ignora este mensaje.
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="background:#fafafa;padding:20px 40px;text-align:center;border-top:1px solid #e4e4e7;">
                                        <p style="margin:0;color:#a1a1aa;font-size:11px;">
                                            Cursinet &mdash; Plataforma de Cursos Online<br />
                                            Si tienes preguntas, escríbenos a soporte@cursinet.com
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
            """;
    }

    private static string BuildPasswordResetHtml(string name, string code, string email, string baseUrl)
    {
        var encodedEmail = Uri.EscapeDataString(email);
        var safeName = WebUtility.HtmlEncode(name);

        return $"""
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            </head>
            <body style="margin:0;padding:0;background-color:#f4f4f5;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 0;">
                    <tr>
                        <td align="center">
                            <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                                <tr>
                                    <td style="background:linear-gradient(135deg,#7c3aed,#2563eb);padding:36px 40px;text-align:center;">
                                        <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">Cursinet</h1>
                                        <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Aprende sin límites</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:36px 40px;">
                                        <h2 style="margin:0 0 8px;color:#18181b;font-size:20px;">Restablece tu contraseña</h2>
                                        <p style="margin:0 0 24px;color:#52525b;font-size:14px;line-height:1.6;">
                                            Hola <strong>{safeName}</strong>,<br /><br />
                                            Recibimos una solicitud para restablecer tu contraseña en Cursinet. Usa el siguiente código:
                                        </p>
                                        <div style="background:#f4f4f5;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
                                            <p style="margin:0 0 8px;color:#52525b;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Tu código de restablecimiento</p>
                                            <p style="margin:0;font-size:36px;font-weight:700;letter-spacing:8px;color:#2563eb;font-family:monospace;">{code}</p>
                                        </div>
                                        <p style="margin:0 0 4px;color:#52525b;font-size:13px;line-height:1.5;">
                                            O haz clic en el siguiente enlace:
                                        </p>
                                        <p style="margin:0 0 24px;">
                                            <a href="{baseUrl}/restablecer?email={encodedEmail}&code={code}" style="color:#2563eb;font-size:13px;">Restablecer mi contraseña</a>
                                        </p>
                                        <p style="margin:0;color:#a1a1aa;font-size:12px;line-height:1.5;">
                                            Este código expira en <strong>15 minutos</strong>. Si no solicitaste este cambio, ignora este mensaje.
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="background:#fafafa;padding:20px 40px;text-align:center;border-top:1px solid #e4e4e7;">
                                        <p style="margin:0;color:#a1a1aa;font-size:11px;">
                                            Cursinet &mdash; Plataforma de Cursos Online<br />
                                            Si tienes preguntas, escríbenos a soporte@cursinet.com
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
            """;
    }

}

public class SendGridOptions
{
    public const string SectionName = "SendGrid";

    public string ApiKey { get; set; } = string.Empty;
    public string FromEmail { get; set; } = "noreply@cursinet.com";
    public string FromName { get; set; } = "Cursinet";
    public string BaseUrl { get; set; } = "http://localhost:3000";
}
