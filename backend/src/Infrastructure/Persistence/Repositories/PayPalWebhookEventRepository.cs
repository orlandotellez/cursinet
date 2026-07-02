using Cursinet.Application.Common.Interfaces;
using Cursinet.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Cursinet.Infrastructure.Persistence.Repositories;

/// <inheritdoc />
public class PayPalWebhookEventRepository : IPayPalWebhookEventRepository
{
    private readonly ApplicationDbContext _context;

    public PayPalWebhookEventRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>Inserts via raw SaveChanges so the UNIQUE constraint on <c>event_id</c> surfaces as
    /// a <see cref="DbUpdateException"/> the controller can catch for idempotent dedup.</summary>
    public async Task<PayPalWebhookEvent> InsertAsync(
        PayPalWebhookEvent webhookEvent,
        CancellationToken cancellationToken = default)
    {
        await _context.PayPalWebhookEvents.AddAsync(webhookEvent, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return webhookEvent;
    }

    public async Task MarkProcessedAsync(Guid eventRowId, string? notes, CancellationToken cancellationToken = default)
    {
        var row = await _context.PayPalWebhookEvents
            .FirstOrDefaultAsync(e => e.Id == eventRowId, cancellationToken);
        if (row == null)
        {
            return;
        }
        row.ProcessedAt = DateTime.UtcNow;
        row.Notes = notes;
        await _context.SaveChangesAsync(cancellationToken);
    }
}
