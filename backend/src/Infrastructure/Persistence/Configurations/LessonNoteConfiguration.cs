using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Cursinet.Domain.Entities;

namespace Cursinet.Infrastructure.Persistence.Configurations;

public class LessonNoteConfiguration : IEntityTypeConfiguration<LessonNote>
{
	public void Configure(EntityTypeBuilder<LessonNote> builder)
	{
		// Nombre que le daremos a la tabla
		builder.ToTable("LessonNotes");

		// Configuraciones de los campos de la tabla LessonNotes
		builder.HasKey(ln => ln.Id);
		builder.Property(ln => ln.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");

		builder.Property(ln => ln.UserId).IsRequired().HasColumnName("user_id");
		builder.HasIndex(ln => ln.UserId);
		// Relación con la tabla de usuarios (autor de la nota)
		builder.HasOne(ln => ln.User)
			.WithMany()
			.HasForeignKey(ln => ln.UserId)
			.OnDelete(DeleteBehavior.Restrict);

		builder.Property(ln => ln.LessonId).IsRequired().HasColumnName("lesson_id");
		builder.HasIndex(ln => ln.LessonId);
		// Relación con la tabla de lecciones
		builder.HasOne(ln => ln.Lesson)
			.WithMany()
			.HasForeignKey(ln => ln.LessonId)
			.OnDelete(DeleteBehavior.Restrict);

		builder.Property(ln => ln.Content).IsRequired().HasColumnName("content");

		builder.Property(ln => ln.VideoTimestampSeconds).HasColumnName("video_timestamp_seconds");

		builder.Property(ln => ln.CreatedAt).IsRequired().HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
		builder.Property(ln => ln.UpdatedAt).IsRequired().HasColumnName("updated_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
	}
}
