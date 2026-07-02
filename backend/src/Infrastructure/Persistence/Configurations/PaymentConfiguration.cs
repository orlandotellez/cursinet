using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Cursinet.Domain.Entities;

namespace Cursinet.Infrastructure.Persistence.Configurations;

public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
{
	public void Configure(EntityTypeBuilder<Payment> builder)
	{
		// Nombre que le daremos a la tabla
		builder.ToTable("Payments");

		// Configuraciones de los campos de la tabla Payments
		builder.HasKey(p => p.Id);
		builder.Property(p => p.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");

		builder.Property(p => p.UserId).IsRequired().HasColumnName("user_id");
		builder.HasIndex(p => p.UserId);
		// Relación con la tabla de usuarios (comprador)
		builder.HasOne(p => p.User)
			.WithMany()
			.HasForeignKey(p => p.UserId)
			.OnDelete(DeleteBehavior.Restrict);

		builder.Property(p => p.CourseId).HasColumnName("course_id");
		builder.HasIndex(p => p.CourseId);
		// Relación con la tabla de cursos
		builder.HasOne(p => p.Course)
			.WithMany()
			.HasForeignKey(p => p.CourseId)
			.OnDelete(DeleteBehavior.Restrict);

		builder.Property(p => p.PayPalOrderId).HasColumnName("paypal_order_id").HasMaxLength(255);
		builder.HasIndex(p => p.PayPalOrderId);

		builder.Property(p => p.PayPalCaptureId).HasColumnName("paypal_capture_id").HasMaxLength(255);

		builder.Property(p => p.Amount).IsRequired().HasColumnName("amount").HasColumnType("decimal(10,2)");

		builder.Property(p => p.Currency).IsRequired().HasColumnName("currency").HasMaxLength(10).HasDefaultValue("USD");

		builder.Property(p => p.Status).IsRequired().HasColumnName("status");
		builder.HasIndex(p => p.Status);

		builder.Property(p => p.Type).HasColumnName("type").HasMaxLength(50);

		builder.Property(p => p.PaidAt).HasColumnName("paid_at");

		builder.Property(p => p.RefundedAt).HasColumnName("refunded_at");

		builder.Property(p => p.CreatedAt).IsRequired().HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
		builder.Property(p => p.UpdatedAt).IsRequired().HasColumnName("updated_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
	}
}
