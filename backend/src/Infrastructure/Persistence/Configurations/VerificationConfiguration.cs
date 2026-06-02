using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Cursinet.Domain.Entities;

namespace Cursinet.Infrastructure.Persistence.Configurations;

public class VerificationConfiguration : IEntityTypeConfiguration<Verification>
{
	public void Configure(EntityTypeBuilder<Verification> builder)
	{
		// Nombre que le daremos a la tabla
		builder.ToTable("Verification");

		// Configuraciones de los campos de la tabla verifications
		builder.HasKey(v => v.Id);
		builder.Property(v => v.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");

		builder.Property(v => v.Identifier).IsRequired().HasColumnName("identifier");
		builder.HasIndex(v => v.Identifier);
		
		builder.Property(v => v.Value).IsRequired().HasColumnName("value");
		builder.HasIndex(v => v.Value);
		
		builder.Property(v => v.ExpiresAt).IsRequired().HasColumnName("expires_at");
		builder.HasIndex(v => v.ExpiresAt);

		builder.Property(v => v.CreatedAt).IsRequired().HasDefaultValueSql("CURRENT_TIMESTAMP").HasColumnName("created_at");

		builder.Property(v => v.UpdatedAt).IsRequired().HasDefaultValueSql("CURRENT_TIMESTAMP").HasColumnName("updated_at");
	}
}
