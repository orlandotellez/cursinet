using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Cursinet.Domain.Entities;

namespace Cursinet.Infrastructure.Persistence.Configurations;

public class NotificationConfiguration : IEntityTypeConfiguration<Notification>
{
	public void Configure(EntityTypeBuilder<Notification> builder)
	{
		// Nombre que le daremos a la tabla
		builder.ToTable("Notifications");

		// Configuraciones de los campos de la tabla Notifications
		builder.HasKey(n => n.Id);
		builder.Property(n => n.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");

		builder.Property(n => n.UserId).IsRequired().HasColumnName("user_id");
		builder.HasIndex(n => n.UserId);
		// Relación con la tabla de usuarios (destinatario)
		builder.HasOne(n => n.User)
			.WithMany()
			.HasForeignKey(n => n.UserId)
			.OnDelete(DeleteBehavior.Restrict);

		builder.Property(n => n.Type).IsRequired().HasColumnName("type").HasMaxLength(100);
		builder.HasIndex(n => n.Type);

		builder.Property(n => n.Title).IsRequired().HasColumnName("title").HasMaxLength(255);

		builder.Property(n => n.Body).IsRequired().HasColumnName("body");

		builder.Property(n => n.ImageUrl).HasColumnName("image_url");

		builder.Property(n => n.ActionUrl).HasColumnName("action_url");

		builder.Property(n => n.IsRead).IsRequired().HasColumnName("is_read").HasDefaultValue(false);
		builder.HasIndex(n => n.IsRead);

		builder.Property(n => n.CreatedAt).IsRequired().HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
	}
}
