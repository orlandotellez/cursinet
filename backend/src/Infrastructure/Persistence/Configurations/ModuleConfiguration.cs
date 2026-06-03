using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Cursinet.Domain.Entities;

namespace Cursinet.Infrastructure.Persistence.Configurations;

public class ModuleConfiguration : IEntityTypeConfiguration<Module>
{
	public void Configure(EntityTypeBuilder<Module> builder)
	{
		// Nombre que le daremos a la tabla
		builder.ToTable("Modules");

		// Configuraciones de los campos de la tabla Modules
		builder.HasKey(m => m.Id);
		builder.Property(m => m.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");

		builder.Property(m => m.CourseId).IsRequired().HasColumnName("course_id");
		builder.HasIndex(m => m.CourseId);
		// Relación con la tabla de cursos
		builder.HasOne(m => m.Course)
			.WithMany()
			.HasForeignKey(m => m.CourseId)
			.OnDelete(DeleteBehavior.Cascade);

		builder.Property(m => m.Title).IsRequired().HasColumnName("title").HasMaxLength(255);

		builder.Property(m => m.Description).HasColumnName("description");

		builder.Property(m => m.SortOrder).IsRequired().HasColumnName("sort_order").HasDefaultValue(0);

		builder.Property(m => m.IsPublished).IsRequired().HasColumnName("is_published").HasDefaultValue(false);

		builder.Property(m => m.CreatedAt).IsRequired().HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
		builder.Property(m => m.UpdatedAt).IsRequired().HasColumnName("updated_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
		builder.Property(m => m.DeletedAt).HasColumnName("deleted_at");
	}
}
