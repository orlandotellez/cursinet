using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Cursinet.Domain.Entities;

namespace Cursinet.Infrastructure.Persistence.Configurations;

public class PayPalWebhookEventConfiguration : IEntityTypeConfiguration<PayPalWebhookEvent>
{
    public void Configure(EntityTypeBuilder<PayPalWebhookEvent> builder)
    {
        builder.ToTable("PayPalWebhookEvents");

        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");

        builder.Property(e => e.EventId)
            .IsRequired()
            .HasColumnName("event_id")
            .HasMaxLength(128);

        // PayPal aggressively retries; this constraint is the dedup primitive.
        builder.HasIndex(e => e.EventId)
            .IsUnique()
            .HasDatabaseName("ux_paypal_webhook_events_event_id");

        builder.Property(e => e.EventType)
            .IsRequired()
            .HasColumnName("event_type")
            .HasMaxLength(128);
        builder.HasIndex(e => e.EventType).HasDatabaseName("ix_paypal_webhook_events_event_type");

        builder.Property(e => e.ResourceType)
            .IsRequired()
            .HasColumnName("resource_type")
            .HasMaxLength(64);

        builder.Property(e => e.ResourceId)
            .IsRequired()
            .HasColumnName("resource_id")
            .HasMaxLength(128);
        builder.HasIndex(e => e.ResourceId).HasDatabaseName("ix_paypal_webhook_events_resource_id");

        builder.Property(e => e.ReceivedAt)
            .IsRequired()
            .HasColumnName("received_at")
            .HasDefaultValueSql("CURRENT_TIMESTAMP");
        builder.HasIndex(e => e.ReceivedAt).HasDatabaseName("ix_paypal_webhook_events_received_at");

        builder.Property(e => e.ProcessedAt).HasColumnName("processed_at");
        builder.HasIndex(e => e.ProcessedAt).HasDatabaseName("ix_paypal_webhook_events_processed_at");

        builder.Property(e => e.Notes).HasColumnName("notes").HasMaxLength(1024);

        builder.Property(e => e.Payload).IsRequired().HasColumnName("payload").HasColumnType("text");
    }
}
