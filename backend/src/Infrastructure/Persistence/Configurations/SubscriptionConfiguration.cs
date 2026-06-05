using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Cursinet.Domain.Entities;

namespace Cursinet.Infrastructure.Persistence.Configurations;

public class SubscriptionConfiguration : IEntityTypeConfiguration<Subscription>
{
	public void Configure(EntityTypeBuilder<Subscription> builder)
	{
		// Nombre que le daremos a la tabla
		builder.ToTable("Subscriptions");

		// Configuraciones de los campos de la tabla Subscriptions
		builder.HasKey(s => s.Id);
		builder.Property(s => s.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");

		builder.Property(s => s.UserId).IsRequired().HasColumnName("user_id");
		builder.HasIndex(s => s.UserId);
		// Relación con la tabla de usuarios (suscriptor)
		builder.HasOne(s => s.User)
			.WithMany()
			.HasForeignKey(s => s.UserId)
			.OnDelete(DeleteBehavior.Restrict);

		builder.Property(s => s.StripeSubscriptionId).HasColumnName("stripe_subscription_id").HasMaxLength(255);
		builder.HasIndex(s => s.StripeSubscriptionId);

		builder.Property(s => s.Plan).IsRequired().HasColumnName("plan");

		builder.Property(s => s.Status).IsRequired().HasColumnName("status").HasMaxLength(50);
		builder.HasIndex(s => s.Status);

		builder.Property(s => s.CurrentPeriodStart).HasColumnName("current_period_start");

		builder.Property(s => s.CurrentPeriodEnd).HasColumnName("current_period_end");

		builder.Property(s => s.CancelAtPeriodEnd).IsRequired().HasColumnName("cancel_at_period_end").HasDefaultValue(false);

		builder.Property(s => s.CreatedAt).IsRequired().HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
		builder.Property(s => s.UpdatedAt).IsRequired().HasColumnName("updated_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
	}
}
