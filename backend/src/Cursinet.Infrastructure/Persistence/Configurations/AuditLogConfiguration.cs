using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Cursinet.Domain.Entities;

namespace Cursinet.Infrastructure.Persistence.Configurations;

public class AuditLogConfiguration : IEntityTypeConfiguration<AuditLog>
{
	public void Configure(EntityTypeBuilder<AuditLog> builder)
	{
		builder.ToTable("AuditLogs");

		builder.HasKey(a => a.Id);
		builder.Property(a => a.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");

		builder.Property(a => a.UserId).HasColumnName("user_id");
		builder.HasIndex(a => a.UserId);
		builder.HasOne(a => a.User)
			.WithMany()
			.HasForeignKey(a => a.UserId)
			.OnDelete(DeleteBehavior.SetNull);

		builder.Property(a => a.Action).HasColumnName("action").IsRequired().HasMaxLength(255);

		builder.Property(a => a.EntityType).HasColumnName("entity_type").IsRequired().HasMaxLength(255);
		builder.HasIndex(a => a.EntityType);

		builder.Property(a => a.EntityId).HasColumnName("entity_id");
		builder.HasIndex(a => a.EntityId);

		builder.Property(a => a.OldValues).HasColumnName("old_values").HasColumnType("jsonb");

		builder.Property(a => a.NewValues).HasColumnName("new_values").HasColumnType("jsonb");

		builder.Property(a => a.IpAddress).HasColumnName("ip_address").HasMaxLength(45);

		builder.Property(a => a.CreatedAt).HasColumnName("created_at").IsRequired().HasDefaultValueSql("CURRENT_TIMESTAMP");
		builder.HasIndex(a => a.CreatedAt);
	}
}
