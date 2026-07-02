namespace Cursinet.Domain.Entities;

/// <summary>
/// Outbox record for incoming PayPal webhook events. Each delivery from PayPal produces exactly one
/// row here; the <see cref="EventId"/> unique index absorbs PayPal's aggressive retry behaviour so we
/// never double-process the same event.
/// </summary>
/// <remarks>
/// <para>
/// The handler pipeline is "insert or fail-on-conflict": if two deliveries land concurrently the second
/// loses on the unique constraint and we treat it as a successful dedup rather than an error.
/// </para>
/// <para>
/// <see cref="ProcessedAt"/> is set once we successfully apply the side effects to our domain (e.g.
/// marking a Payment Completed and creating the Enrollment). Events left with a null
/// <see cref="ProcessedAt"/> are candidates for diagnostic replay via a future admin tool.
/// </para>
/// </remarks>
public class PayPalWebhookEvent
{
    public Guid Id { get; set; }

    /// <summary>PayPal's event <c>id</c> field. Globally unique per delivery. Used for deduplication.</summary>
    public string EventId { get; set; } = string.Empty;

    /// <summary>e.g. <c>PAYMENT.CAPTURE.COMPLETED</c>, <c>PAYMENT.CAPTURE.REFUNDED</c>.</summary>
    public string EventType { get; set; } = string.Empty;

    /// <summary>PayPal resource.type, e.g. <c>capture</c>, <c>subscription</c>.</summary>
    public string ResourceType { get; set; } = string.Empty;

    /// <summary>PayPal resource.id (the capture id, subscription id, etc.) — used to look up our domain entities.</summary>
    public string ResourceId { get; set; } = string.Empty;

    /// <summary>UTC timestamp of when the webhook hit our endpoint.</summary>
    public DateTime ReceivedAt { get; set; }

    /// <summary>UTC timestamp of when we successfully applied the side effects; null until processed.</summary>
    public DateTime? ProcessedAt { get; set; }

    /// <summary>Free-form note: failure reason (if any) for diagnostics; success/failure tag.</summary>
    public string? Notes { get; set; }

    /// <summary>Raw JSON payload from PayPal, stored verbatim for troubleshooting/replay.</summary>
    public string Payload { get; set; } = string.Empty;
}
