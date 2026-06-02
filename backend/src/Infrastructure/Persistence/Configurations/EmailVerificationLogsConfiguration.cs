using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Cursinet.Domain.Entities;

namespace Cursinet.Infrastructure.Persistence.Configurations;

public class EmailVerificationLogsConfiguration : IEntityTypeConfiguration<EmailVerificationLogs>
{
	public void Configure(EntityTypeBuilder<EmailVerificationLogs> builder)
	{
		// Nombre de la tabla 
		builder.ToTable("EmailVerificationLogs");

		// Configuraciones de los campos de la tabla
		builder.HasKey(e => e.Id);
		builder.Property(e => e.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");

		builder.Property(e => e.UserId).HasColumnName("user_id").IsRequired();
		builder.HasIndex(e => e.UserId);
		// Relación con la tabla de usuarios
		builder.HasOne(e => e.User)
			.WithMany()
			.HasForeignKey(e => e.UserId)
			.OnDelete(DeleteBehavior.Cascade);

		builder.Property(e => e.VerifiedAt).HasColumnName("verified_at").IsRequired();
		builder.HasIndex(e => e.VerifiedAt);

		builder.Property(e => e.IpAddress).HasColumnName("ip_address");

		builder.Property(e => e.CreatedAt).HasColumnName("created_at").IsRequired().HasDefaultValueSql("CURRENT_TIMESTAMP");

	}
}
