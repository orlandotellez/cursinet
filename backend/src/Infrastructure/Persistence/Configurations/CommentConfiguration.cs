using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Cursinet.Domain.Entities;

namespace Cursinet.Infrastructure.Persistence.Configurations;

public class CommentConfiguration : IEntityTypeConfiguration<Comment>
{
	public void Configure(EntityTypeBuilder<Comment> builder)
	{
		// Nombre que le daremos a la tabla
		builder.ToTable("Comments");

		// Configuraciones de los campos de la tabla Comments
		builder.HasKey(c => c.Id);
		builder.Property(c => c.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");

		builder.Property(c => c.LessonId).IsRequired().HasColumnName("lesson_id");
		builder.HasIndex(c => c.LessonId);
		// Relación con la tabla de lecciones
		builder.HasOne(c => c.Lesson)
			.WithMany()
			.HasForeignKey(c => c.LessonId)
			.OnDelete(DeleteBehavior.Restrict);

		builder.Property(c => c.UserId).IsRequired().HasColumnName("user_id");
		builder.HasIndex(c => c.UserId);
		// Relación con la tabla de usuarios (autor del comentario)
		builder.HasOne(c => c.User)
			.WithMany()
			.HasForeignKey(c => c.UserId)
			.OnDelete(DeleteBehavior.Restrict);

		builder.Property(c => c.ParentId).HasColumnName("parent_id");
		builder.HasIndex(c => c.ParentId);
		// Relación auto-referenciada (comentario padre)
		builder.HasOne(c => c.Parent)
			.WithMany(c => c.Replies)
			.HasForeignKey(c => c.ParentId)
			.OnDelete(DeleteBehavior.Restrict);

		builder.Property(c => c.Body).IsRequired().HasColumnName("body");

		builder.Property(c => c.LikesCount).IsRequired().HasColumnName("likes_count").HasDefaultValue(0);

		builder.Property(c => c.IsEdited).IsRequired().HasColumnName("is_edited").HasDefaultValue(false);

		builder.Property(c => c.CreatedAt).IsRequired().HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
		builder.Property(c => c.UpdatedAt).IsRequired().HasColumnName("updated_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
		builder.Property(c => c.DeletedAt).HasColumnName("deleted_at");
	}
}
