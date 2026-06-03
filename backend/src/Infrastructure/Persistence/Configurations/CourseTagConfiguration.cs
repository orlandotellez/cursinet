using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Cursinet.Domain.Entities;

namespace Cursinet.Infrastructure.Persistence.Configurations;

public class CourseTagConfiguration : IEntityTypeConfiguration<CourseTag>
{
	public void Configure(EntityTypeBuilder<CourseTag> builder)
	{
		// Nombre que le daremos a la tabla
		builder.ToTable("CourseTags");

		// Configuración de la PK compuesta
		builder.HasKey(ct => new { ct.CourseId, ct.TagId });

		// Configuraciones de los campos de la tabla CourseTags
		builder.Property(ct => ct.CourseId).IsRequired().HasColumnName("course_id");
		builder.HasIndex(ct => ct.CourseId);
		// Relación con la tabla de cursos
		builder.HasOne(ct => ct.Course)
			.WithMany()
			.HasForeignKey(ct => ct.CourseId)
			.OnDelete(DeleteBehavior.Cascade);

		builder.Property(ct => ct.TagId).IsRequired().HasColumnName("tag_id");
		builder.HasIndex(ct => ct.TagId);
		// Relación con la tabla de tags
		builder.HasOne(ct => ct.Tag)
			.WithMany()
			.HasForeignKey(ct => ct.TagId)
			.OnDelete(DeleteBehavior.Cascade);
	}
}
