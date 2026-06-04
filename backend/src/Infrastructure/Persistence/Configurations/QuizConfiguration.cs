using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Cursinet.Domain.Entities;

namespace Cursinet.Infrastructure.Persistence.Configurations;

public class QuizConfiguration : IEntityTypeConfiguration<Quiz>
{
	public void Configure(EntityTypeBuilder<Quiz> builder)
	{
		// Nombre que le daremos a la tabla
		builder.ToTable("Quizzes");

		// Configuraciones de los campos de la tabla Quizzes
		builder.HasKey(q => q.Id);
		builder.Property(q => q.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");

		builder.Property(q => q.LessonId).IsRequired().HasColumnName("lesson_id");
		builder.HasIndex(q => q.LessonId);
		// Relación con la tabla de lecciones
		builder.HasOne(q => q.Lesson)
			.WithMany()
			.HasForeignKey(q => q.LessonId)
			.OnDelete(DeleteBehavior.Cascade);

		builder.Property(q => q.Title).IsRequired().HasColumnName("title").HasMaxLength(255);

		builder.Property(q => q.PassingScore).IsRequired().HasColumnName("passing_score").HasDefaultValue(70);

		builder.Property(q => q.MaxAttempts).HasColumnName("max_attempts");

		builder.Property(q => q.TimeLimitMinutes).HasColumnName("time_limit_minutes");

		builder.Property(q => q.CreatedAt).IsRequired().HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
		builder.Property(q => q.UpdatedAt).IsRequired().HasColumnName("updated_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
	}
}
