using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Cursinet.Domain.Entities;

namespace Cursinet.Infrastructure.Persistence.Configurations;

public class QuizOptionConfiguration : IEntityTypeConfiguration<QuizOption>
{
	public void Configure(EntityTypeBuilder<QuizOption> builder)
	{
		// Nombre que le daremos a la tabla
		builder.ToTable("QuizOptions");

		// Configuraciones de los campos de la tabla QuizOptions
		builder.HasKey(o => o.Id);
		builder.Property(o => o.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");

		builder.Property(o => o.QuestionId).IsRequired().HasColumnName("question_id");
		builder.HasIndex(o => o.QuestionId);
		// Relación con la tabla de preguntas
		builder.HasOne(o => o.Question)
			.WithMany()
			.HasForeignKey(o => o.QuestionId)
			.OnDelete(DeleteBehavior.Cascade);

		builder.Property(o => o.Text).IsRequired().HasColumnName("text");

		builder.Property(o => o.IsCorrect).IsRequired().HasColumnName("is_correct").HasDefaultValue(false);

		builder.Property(o => o.SortOrder).IsRequired().HasColumnName("sort_order").HasDefaultValue(0);

		builder.Property(o => o.CreatedAt).IsRequired().HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
		builder.Property(o => o.UpdatedAt).IsRequired().HasColumnName("updated_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
	}
}
