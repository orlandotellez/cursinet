using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Cursinet.Domain.Entities;

namespace Cursinet.Infrastructure.Persistence.Configurations;

public class CategoryConfiguration : IEntityTypeConfiguration<Category>
{
	public void Configure(EntityTypeBuilder<Category> builder)
	{
		// Nombre que le daremos a la tabla
		builder.ToTable("Categories");

		// Configuraciones de campos de la tabla Categories
		builder.HasKey(c => c.Id);
		builder.Property(c => c.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");

		builder.Property(c => c.Name).IsRequired().HasColumnName("name").HasMaxLength(100);

		builder.Property(c => c.Slug).IsRequired().HasColumnName("slug").HasMaxLength(100);
		builder.HasIndex(c => c.Slug).IsUnique();

		builder.Property(c => c.Description).HasColumnName("description");

		builder.Property(c => c.IconName).HasColumnName("icon_name").HasMaxLength(100);

		builder.Property(c => c.Color).HasColumnName("color").HasMaxLength(50);

		builder.Property(c => c.ParentId).HasColumnName("parent_id");
		builder.HasIndex(c => c.ParentId);
		// Relación auto-referenciada (categoría padre)
		builder.HasOne(c => c.Parent)
			.WithMany(c => c.Children)
			.HasForeignKey(c => c.ParentId)
			.OnDelete(DeleteBehavior.SetNull);

		builder.Property(c => c.SortOrder).IsRequired().HasDefaultValue(0).HasColumnName("sort_order");

		builder.Property(c => c.IsActive).IsRequired().HasDefaultValue(true).HasColumnName("is_active");
		builder.HasIndex(c => c.IsActive);

		builder.Property(c => c.CreatedAt).IsRequired().HasDefaultValueSql("CURRENT_TIMESTAMP").HasColumnName("created_at");
		builder.Property(c => c.UpdatedAt).IsRequired().HasDefaultValueSql("CURRENT_TIMESTAMP").HasColumnName("updated_at");
		builder.Property(c => c.DeletedAt).HasColumnName("deleted_at");
	}
}
