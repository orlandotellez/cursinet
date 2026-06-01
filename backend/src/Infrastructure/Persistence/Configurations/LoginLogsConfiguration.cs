using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Cursinet.Domain.Entities;

namespace Cursinet.Infrastructure.Persistence.Configurations;

public class LoginLogsConfiguration : IEntityTypeConfiguration<LoginLogs>
{
	public void Configure(EntityTypeBuilder<LoginLogs> builder)
	{
		// Nombre de la tabla
		builder.ToTable("LoginLogs");

		// Configuraciones de los campos de la tabla
		builder.HasKey(l => l.Id);
		builder.Property(l => l.Id).HasColumnName("id").HasDefaultValueSql("uuid_generate_v4()");

		builder.Property(l => l.UserId).HasColumnName("user_id");
		builder.HasIndex(l => l.UserId);
		// Relación con la tabla de usuarios
		builder.HasOne(l => l.User)
			.WithMany()
			.HasForeignKey(l => l.UserId)
			.OnDelete(DeleteBehavior.SetNull);

		builder.Property(l => l.Email).HasColumnName("email");
		builder.HasIndex(l => l.Email);

		builder.Property(l => l.Success).HasColumnName("success").IsRequired();
		builder.HasIndex(l => l.Success);

		builder.Property(l => l.ProviderId).HasColumnName("provider_id");

		builder.Property(l => l.IpAddress).HasColumnName("ip_address");

		builder.Property(l => l.UserAgent).HasColumnName("user_agent");

		builder.Property(l => l.FailureReason).HasColumnName("failure_reason");

		builder.Property(l => l.CreatedAt).HasColumnName("created_at").IsRequired().HasDefaultValueSql("CURRENT_TIMESTAMP");
		builder.HasIndex(l => l.CreatedAt);
	}
}
