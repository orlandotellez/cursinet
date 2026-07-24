using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Cursinet.Domain.Entities;

namespace Cursinet.Infrastructure.Persistence.Configurations;

public class UserTwoFactorConfiguration : IEntityTypeConfiguration<UserTwoFactor>
{
	public void Configure(EntityTypeBuilder<UserTwoFactor> builder)
	{
		// Nombre de la tabla
		builder.ToTable("user_two_factor");

		// Configuración de los campos de la tabla
		builder.HasKey(u => u.Id);
		builder.Property(u => u.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");

		builder.Property(u => u.UserId).HasColumnName("user_id").IsRequired();
		builder.HasIndex(u => u.UserId);
		// Relación con la tabla de usuarios
		builder.HasOne(u => u.User)
			.WithMany()
			.HasForeignKey(u => u.UserId)
			.OnDelete(DeleteBehavior.Cascade);

		builder.Property(u => u.BackUpCodes).HasColumnName("backup_codes");
		
		builder.Property(u => u.Secret).IsRequired().HasColumnName("secret");

		builder.Property(u => u.IsEnabled).IsRequired().HasDefaultValue(false).HasColumnName("is_enabled");

		builder.Property(u => u.CreatedAt).IsRequired().HasDefaultValueSql("CURRENT_TIMESTAMP").HasColumnName("created_at");

		builder.Property(u => u.UpdatedAt).IsRequired().HasDefaultValueSql("CURRENT_TIMESTAMP").HasColumnName("updated_at");
	}
}
