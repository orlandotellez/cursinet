using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Cursinet.Domain.Entities;

namespace Cursinet.Infrastructure.Persistence.Configurations;

public class LessonConfiguration : IEntityTypeConfiguration<Lesson>
{
	public void Configure(EntityTypeBuilder<Lesson> builder)
	{
		// Nombre que le daremos a la tabla
		builder.ToTable("Lessons");

		// Configuraciones de los campos de la tabla Lessons
		builder.HasKey(l => l.Id);
		builder.Property(l => l.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");

		builder.Property(l => l.ModuleId).IsRequired().HasColumnName("module_id");
		builder.HasIndex(l => l.ModuleId);
		// Relación con la tabla de módulos
		builder.HasOne(l => l.Module)
			.WithMany()
			.HasForeignKey(l => l.ModuleId)
			.OnDelete(DeleteBehavior.Cascade);

		builder.Property(l => l.CourseId).IsRequired().HasColumnName("course_id");
		builder.HasIndex(l => l.CourseId);
		// Relación con la tabla de cursos
		builder.HasOne(l => l.Course)
			.WithMany()
			.HasForeignKey(l => l.CourseId)
			.OnDelete(DeleteBehavior.Cascade);

		builder.Property(l => l.Title).IsRequired().HasColumnName("title").HasMaxLength(255);

		builder.Property(l => l.Slug).IsRequired().HasColumnName("slug").HasMaxLength(255);
		builder.HasIndex(l => l.Slug).IsUnique();

		builder.Property(l => l.Type).IsRequired().HasColumnName("type");

		builder.Property(l => l.VideoUrl).HasColumnName("video_url");

		builder.Property(l => l.VideoDurationSeconds).HasColumnName("video_duration_seconds");

		builder.Property(l => l.ContentMarkdown).HasColumnName("content_markdown");

		builder.Property(l => l.SortOrder).IsRequired().HasColumnName("sort_order").HasDefaultValue(0);

		builder.Property(l => l.IsPublished).IsRequired().HasColumnName("is_published").HasDefaultValue(false);

		builder.Property(l => l.IsPreview).IsRequired().HasColumnName("is_preview").HasDefaultValue(false);

		builder.Property(l => l.AttachmentUrls).HasColumnName("attachment_urls");

		builder.Property(l => l.CreatedAt).IsRequired().HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
		builder.Property(l => l.UpdatedAt).IsRequired().HasColumnName("updated_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
		builder.Property(l => l.DeletedAt).HasColumnName("deleted_at");

		builder.HasIndex(l => l.Type);
	}
}
