using Cursinet.Domain.Entities;

namespace Cursinet.Application.Common.Interfaces;

/// <summary>
/// Repository for <see cref="PayPalWebhookEvent"/> outbox records.
/// </summary>
public interface IPayPalWebhookEventRepository
{
    /// <summary>
    /// Inserts a webhook event. Throws <see cref="DbUpdateException"/> via the underlying DbContext
    /// when a row with the same <c>EventId</c> already exists (UNIQUE constraint on
    /// <c>event_id</c>). The controller catches this and treats it as a successful dedup.
    /// </summary>
    Task<PayPalWebhookEvent> InsertAsync(PayPalWebhookEvent webhookEvent, CancellationToken cancellationToken = default);

    /// <summary>Updates the processed timestamp + notes after the dispatch pipeline completes.</summary>
    Task MarkProcessedAsync(Guid eventRowId, string? notes, CancellationToken cancellationToken = default);
}
