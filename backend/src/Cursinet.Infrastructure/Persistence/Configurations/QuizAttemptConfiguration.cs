using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Cursinet.Domain.Entities;

namespace Cursinet.Infrastructure.Persistence.Configurations;

public class QuizAttemptConfiguration : IEntityTypeConfiguration<QuizAttempt>
{
	public void Configure(EntityTypeBuilder<QuizAttempt> builder)
	{
		// Nombre que le daremos a la tabla
		builder.ToTable("QuizAttempts");

		// Configuraciones de los campos de la tabla QuizAttempts
		builder.HasKey(a => a.Id);
		builder.Property(a => a.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");

		builder.Property(a => a.QuizId).IsRequired().HasColumnName("quiz_id");
		builder.HasIndex(a => a.QuizId);
		// Relación con la tabla de quizzes
		builder.HasOne(a => a.Quiz)
			.WithMany()
			.HasForeignKey(a => a.QuizId)
			.OnDelete(DeleteBehavior.Restrict);

		builder.Property(a => a.UserId).IsRequired().HasColumnName("user_id");
		builder.HasIndex(a => a.UserId);
		// Relación con la tabla de usuarios
		builder.HasOne(a => a.User)
			.WithMany()
			.HasForeignKey(a => a.UserId)
			.OnDelete(DeleteBehavior.Restrict);

		builder.Property(a => a.Score).HasColumnName("score").HasColumnType("decimal(5,2)");

		builder.Property(a => a.IsPassed).IsRequired().HasColumnName("is_passed").HasDefaultValue(false);

		builder.Property(a => a.TimeSpentSeconds).HasColumnName("time_spent_seconds");

		builder.Property(a => a.StartedAt).HasColumnName("started_at");

		builder.Property(a => a.CompletedAt).HasColumnName("completed_at");

		builder.Property(a => a.CreatedAt).IsRequired().HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
	}
}
