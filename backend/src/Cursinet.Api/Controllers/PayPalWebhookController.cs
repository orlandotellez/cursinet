using System.Text.Json;
using Cursinet.Application.Common.Interfaces;
using Cursinet.Application.Common.Mapping;
using Cursinet.Domain.Entities;
using Cursinet.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cursinet.Api.Controllers;

/// <summary>
/// Receives PayPal webhook deliveries at <c>POST /api/v1/webhooks/paypal</c>. The endpoint is
/// anonymous by design (PayPal has no JWT); ingress security comes from signature verification
/// against PayPal's <c>/v1/notifications/verify-webhook-signature</c> API and the
/// <c>PayPalWebhookEvents</c> outbox table (UNIQUE <c>event_id</c>) that absorbs PayPal's
/// aggressive retry behaviour.
/// </summary>
[ApiController]
[Route("api/v1/webhooks/paypal")]
[AllowAnonymous]
public class PayPalWebhookController : ControllerBase
{
    private readonly IPayPalWebhookSignatureValidator _signatureValidator;
    private readonly IPayPalWebhookEventRepository _eventRepository;
    private readonly IPaymentRepository _paymentRepository;
    private readonly IEnrollmentRepository _enrollmentRepository;
    private readonly ILogger<PayPalWebhookController> _logger;

    public PayPalWebhookController(
        IPayPalWebhookSignatureValidator signatureValidator,
        IPayPalWebhookEventRepository eventRepository,
        IPaymentRepository paymentRepository,
        IEnrollmentRepository enrollmentRepository,
        ILogger<PayPalWebhookController> logger)
    {
        _signatureValidator = signatureValidator;
        _eventRepository = eventRepository;
        _paymentRepository = paymentRepository;
        _enrollmentRepository = enrollmentRepository;
        _logger = logger;
    }

    [HttpPost]
    public async Task<IActionResult> Receive(CancellationToken cancellationToken)
    {
        // Buffering matters: the signature validator needs the raw body bytes verbatim, and we have
        // to read them again for storage. EnableBuffering allows multiple reads on the same stream.
        Request.EnableBuffering();
        using var reader = new StreamReader(Request.Body, leaveOpen: true);
        var rawBody = await reader.ReadToEndAsync(cancellationToken);

        var isValid = await _signatureValidator.VerifyAsync(
            HttpContext.Request.Headers["PAYPAL-AUTH-ALGO"].ToString(),
            HttpContext.Request.Headers["PAYPAL-CERT-URL"].ToString(),
            HttpContext.Request.Headers["PAYPAL-TRANSMISSION-ID"].ToString(),
            HttpContext.Request.Headers["PAYPAL-TRANSMISSION-SIG"].ToString(),
            HttpContext.Request.Headers["PAYPAL-TRANSMISSION-TIME"].ToString(),
            rawBody,
            cancellationToken);

        if (!isValid)
        {
            _logger.LogWarning("PayPal webhook signature verification failed; ignoring payload.");
            // Still acknowledge — PayPal must see 2xx to stop retrying.
            return Ok();
        }

        JsonElement eventRoot;
        try
        {
            using var doc = JsonDocument.Parse(rawBody);
            eventRoot = doc.RootElement.Clone();
        }
        catch (JsonException ex)
        {
            _logger.LogError(ex, "PayPal webhook body was not parseable JSON.");
            // Reject loudly so PayPal retries — leaving the bad body in the response is worse than
            // a 5xx loop, but it's better than silently dropping user-impacting events.
            return StatusCode(StatusCodes.Status400BadRequest);
        }

        var eventId = GetString(eventRoot, "id") ?? string.Empty;
        var eventType = GetString(eventRoot, "event_type") ?? string.Empty;

        // Pull resource.type + resource.id defensively — schema documents the shape but PayPal may
        // add new wrappers in the future.
        var resourceType = string.Empty;
        var resourceId = string.Empty;
        if (eventRoot.TryGetProperty("resource", out var resourceEl) &&
            resourceEl.ValueKind == JsonValueKind.Object)
        {
            resourceType = GetString(resourceEl, "resource_type") ?? string.Empty;
            resourceId = GetString(resourceEl, "id") ?? string.Empty;
        }

        var outbox = new PayPalWebhookEvent
        {
            Id = Guid.NewGuid(),
            EventId = eventId,
            EventType = eventType,
            ResourceType = resourceType,
            ResourceId = resourceId,
            ReceivedAt = DateTime.UtcNow,
            Payload = rawBody,
        };

        PayPalWebhookEvent inserted;
        try
        {
            inserted = await _eventRepository.InsertAsync(outbox, cancellationToken);
        }
        catch (DbUpdateException ex) when (IsUniqueViolation(ex))
        {
            // UNIQUE event_id — PayPal retried an event we already accepted. Idempotent: drop it.
            _logger.LogInformation(
                "PayPal webhook event_id {EventId} already processed; ignoring duplicate delivery.",
                eventId);
            return Ok();
        }

        // Dispatch side effects by event_type. Side effects are idempotent — if they ran before the
        // unique constraint violation path, an earlier delivery already applied them.
        try
        {
            await DispatchAsync(inserted, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "PayPal webhook dispatch failed for event_id {EventId}; leaving ProcessedAt null for replay.",
                inserted.EventId);
            // Leave ProcessedAt null — don't ack as 2xx so PayPal retries. MarkProcessedAsync will
            // be called on a successful eventual delivery.
            return StatusCode(StatusCodes.Status500InternalServerError);
        }

        return Ok();
    }

    private async Task DispatchAsync(PayPalWebhookEvent webhookEvent, CancellationToken cancellationToken)
    {
        switch (webhookEvent.EventType)
        {
            case "PAYMENT.CAPTURE.COMPLETED":
                await HandleCaptureCompletedAsync(webhookEvent, cancellationToken);
                break;

            case "PAYMENT.CAPTURE.REFUNDED":
                await HandleCaptureRefundedAsync(webhookEvent, cancellationToken);
                break;

            case "PAYMENT.CAPTURE.DENIED":
                await HandleCaptureDeniedAsync(webhookEvent, cancellationToken);
                break;

            default:
                _logger.LogInformation(
                    "Ignoring unsupported PayPal event_type {EventType} for event_id {EventId}.",
                    webhookEvent.EventType, webhookEvent.EventId);
                break;
        }

        await _eventRepository.MarkProcessedAsync(webhookEvent.Id,
            $"dispatched:{webhookEvent.EventType}", cancellationToken);
    }

    private async Task HandleCaptureCompletedAsync(PayPalWebhookEvent ev, CancellationToken ct)
    {
        var payment = await _paymentRepository.GetByPayPalCaptureIdAsync(ev.ResourceId);
        if (payment == null)
        {
            _logger.LogWarning(
                "PayPal PAYMENT.CAPTURE.COMPLETED for capture_id {CaptureId} did not match a local Payment. The Payment was likely created server-side without a matching capture — investigation needed.",
                ev.ResourceId);
            return;
        }

        payment.Status = PaymentStatus.Completed;
        payment.PaidAt ??= DateTime.UtcNow;
        payment.PayPalCaptureId ??= ev.ResourceId;
        payment.UpdatedAt = DateTime.UtcNow;
        await _paymentRepository.UpdateAsync(payment);

        if (payment.CourseId.HasValue)
        {
            var existing = await _enrollmentRepository.GetByCourseAndUserAsync(payment.CourseId.Value, payment.UserId);
            if (existing == null)
            {
                var enrollment = new Enrollment
                {
                    Id = Guid.NewGuid(),
                    UserId = payment.UserId,
                    CourseId = payment.CourseId.Value,
                    PaymentId = payment.Id,
                    EnrolledAt = DateTime.UtcNow,
                    ProgressPercentage = 0,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                };
                await _enrollmentRepository.CreateAsync(enrollment, payment.CourseId.Value);
            }
        }
    }

    private async Task HandleCaptureRefundedAsync(PayPalWebhookEvent ev, CancellationToken ct)
    {
        var payment = await _paymentRepository.GetByPayPalCaptureIdAsync(ev.ResourceId);
        if (payment == null)
        {
            _logger.LogWarning(
                "PayPal PAYMENT.CAPTURE.REFUNDED for capture_id {CaptureId} did not match a local Payment.",
                ev.ResourceId);
            return;
        }

        payment.Status = PaymentStatus.Refunded;
        payment.RefundedAt ??= DateTime.UtcNow;
        payment.UpdatedAt = DateTime.UtcNow;
        await _paymentRepository.UpdateAsync(payment);
    }

    private async Task HandleCaptureDeniedAsync(PayPalWebhookEvent ev, CancellationToken ct)
    {
        var payment = await _paymentRepository.GetByPayPalCaptureIdAsync(ev.ResourceId);
        if (payment == null)
        {
            _logger.LogWarning(
                "PayPal PAYMENT.CAPTURE.DENIED for capture_id {CaptureId} did not match a local Payment.",
                ev.ResourceId);
            return;
        }

        payment.Status = PaymentStatus.Failed;
        payment.UpdatedAt = DateTime.UtcNow;
        await _paymentRepository.UpdateAsync(payment);
    }

    private static string? GetString(JsonElement el, string propertyName)
    {
        if (!el.TryGetProperty(propertyName, out var prop))
        {
            return null;
        }
        return prop.ValueKind == JsonValueKind.String ? prop.GetString() : prop.ToString();
    }

    private static bool IsUniqueViolation(DbUpdateException ex)
    {
        // Postgres: SQLSTATE 23505
        var inner = ex.InnerException;
        return inner != null && (
            inner.Message.Contains("23505", StringComparison.Ordinal) ||
            inner.Message.Contains("duplicate key", StringComparison.OrdinalIgnoreCase) ||
            inner.Message.Contains("unique constraint", StringComparison.OrdinalIgnoreCase));
    }
}
