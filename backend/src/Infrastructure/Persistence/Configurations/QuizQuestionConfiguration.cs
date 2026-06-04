using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Cursinet.Domain.Entities;

namespace Cursinet.Infrastructure.Persistence.Configurations;

public class QuizQuestionConfiguration : IEntityTypeConfiguration<QuizQuestion>
{
	public void Configure(EntityTypeBuilder<QuizQuestion> builder)
	{
		// Nombre que le daremos a la tabla
		builder.ToTable("QuizQuestions");

		// Configuraciones de los campos de la tabla QuizQuestions
		builder.HasKey(q => q.Id);
		builder.Property(q => q.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");

		builder.Property(q => q.QuizId).IsRequired().HasColumnName("quiz_id");
		builder.HasIndex(q => q.QuizId);
		// Relación con la tabla de quizzes
		builder.HasOne(q => q.Quiz)
			.WithMany()
			.HasForeignKey(q => q.QuizId)
			.OnDelete(DeleteBehavior.Cascade);

		builder.Property(q => q.Text).IsRequired().HasColumnName("text");

		builder.Property(q => q.Type).IsRequired().HasColumnName("type").HasMaxLength(50);

		builder.Property(q => q.Explanation).HasColumnName("explanation");

		builder.Property(q => q.SortOrder).IsRequired().HasColumnName("sort_order").HasDefaultValue(0);

		builder.Property(q => q.CreatedAt).IsRequired().HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
		builder.Property(q => q.UpdatedAt).IsRequired().HasColumnName("updated_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
	}
}
