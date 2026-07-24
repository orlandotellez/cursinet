using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Cursinet.Domain.Entities;

namespace Cursinet.Infrastructure.Persistence.Configurations;

public class QuizAttemptAnswerConfiguration : IEntityTypeConfiguration<QuizAttemptAnswer>
{
	public void Configure(EntityTypeBuilder<QuizAttemptAnswer> builder)
	{
		// Nombre que le daremos a la tabla
		builder.ToTable("QuizAttemptAnswers");

		// Configuraciones de los campos de la tabla QuizAttemptAnswers
		builder.HasKey(a => a.Id);
		builder.Property(a => a.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");

		builder.Property(a => a.AttemptId).IsRequired().HasColumnName("attempt_id");
		builder.HasIndex(a => a.AttemptId);
		// Relación con la tabla de intentos
		builder.HasOne(a => a.Attempt)
			.WithMany()
			.HasForeignKey(a => a.AttemptId)
			.OnDelete(DeleteBehavior.Cascade);

		builder.Property(a => a.QuestionId).IsRequired().HasColumnName("question_id");
		builder.HasIndex(a => a.QuestionId);
		// Relación con la tabla de preguntas
		builder.HasOne(a => a.Question)
			.WithMany()
			.HasForeignKey(a => a.QuestionId)
			.OnDelete(DeleteBehavior.Restrict);

		builder.Property(a => a.SelectedOptionId).HasColumnName("selected_option_id");
		builder.HasIndex(a => a.SelectedOptionId);
		// Relación con la tabla de opciones
		builder.HasOne(a => a.SelectedOption)
			.WithMany()
			.HasForeignKey(a => a.SelectedOptionId)
			.OnDelete(DeleteBehavior.Restrict);

		builder.Property(a => a.CodeAnswer).HasColumnName("code_answer");

		builder.Property(a => a.IsCorrect).IsRequired().HasColumnName("is_correct").HasDefaultValue(false);

		builder.Property(a => a.CreatedAt).IsRequired().HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
	}
}
