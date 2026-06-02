using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Cursinet.Domain.Entities;

namespace Cursinet.Infrastructure.Persistence.Configurations;

public class PasswordResetLogsConfiguration : IEntityTypeConfiguration<PasswordResetLogs>
{
	public void Configure(EntityTypeBuilder<PasswordResetLogs> builder)
	{
		// Nombre de la tabla
		builder.ToTable("PasswordResetLogs");

		// Configuraciones de los campos de la tabla
		builder.HasKey(p => p.Id);
		builder.Property(p => p.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");

		builder.Property(p => p.UserId).HasColumnName("user_id").IsRequired();
		builder.HasIndex(p => p.UserId);
		// Relación con la tabla de usuarios
		builder.HasOne(p => p.User)
			.WithMany()
			.HasForeignKey(p => p.UserId)
			.OnDelete(DeleteBehavior.Cascade);

		builder.Property(p => p.IpAddress).HasColumnName("ip_address");

		builder.Property(p => p.UserAgent).HasColumnName("user_agent");

		builder.Property(p => p.CreatedAt).HasColumnName("created_at").IsRequired().HasDefaultValueSql("CURRENT_TIMESTAMP");
		builder.HasIndex(p => p.CreatedAt);
	}
}

