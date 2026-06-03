using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Cursinet.Domain.Entities;

namespace Cursinet.Infrastructure.Persistence.Configurations;

public class LessonProgressConfiguration : IEntityTypeConfiguration<LessonProgress>
{
	public void Configure(EntityTypeBuilder<LessonProgress> builder)
	{
		// Nombre que le daremos a la tabla
		builder.ToTable("LessonProgress");

		// Configuraciones de los campos de la tabla LessonProgress
		builder.HasKey(lp => lp.Id);
		builder.Property(lp => lp.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");

		builder.Property(lp => lp.UserId).IsRequired().HasColumnName("user_id");
		builder.HasIndex(lp => lp.UserId);
		// Relación con la tabla de usuarios (estudiante)
		builder.HasOne(lp => lp.User)
			.WithMany()
			.HasForeignKey(lp => lp.UserId)
			.OnDelete(DeleteBehavior.Restrict);

		builder.Property(lp => lp.LessonId).IsRequired().HasColumnName("lesson_id");
		builder.HasIndex(lp => lp.LessonId);
		// Relación con la tabla de lecciones
		builder.HasOne(lp => lp.Lesson)
			.WithMany()
			.HasForeignKey(lp => lp.LessonId)
			.OnDelete(DeleteBehavior.Restrict);

		// Índice único compuesto (user_id, lesson_id)
		builder.HasIndex(lp => new { lp.UserId, lp.LessonId }).IsUnique();

		builder.Property(lp => lp.IsCompleted).IsRequired().HasColumnName("is_completed").HasDefaultValue(false);

		builder.Property(lp => lp.WatchedSeconds).IsRequired().HasColumnName("watched_seconds").HasDefaultValue(0);

		builder.Property(lp => lp.LastPositionSeconds).IsRequired().HasColumnName("last_position_seconds").HasDefaultValue(0);

		builder.Property(lp => lp.UpdatedAt).IsRequired().HasColumnName("updated_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
		builder.Property(lp => lp.CreatedAt).IsRequired().HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
	}
}
