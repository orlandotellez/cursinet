using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Cursinet.Domain.Entities;

namespace Cursinet.Infrastructure.Persistence.Configurations;

public class BookmarkConfiguration : IEntityTypeConfiguration<Bookmark>
{
	public void Configure(EntityTypeBuilder<Bookmark> builder)
	{
		// Nombre que le daremos a la tabla
		builder.ToTable("Bookmarks");

		// Configuración de la PK compuesta
		builder.HasKey(b => new { b.UserId, b.CourseId });

		// Configuraciones de los campos de la tabla Bookmarks
		builder.Property(b => b.UserId).IsRequired().HasColumnName("user_id");
		builder.HasIndex(b => b.UserId);
		// Relación con la tabla de usuarios (estudiante)
		builder.HasOne(b => b.User)
			.WithMany()
			.HasForeignKey(b => b.UserId)
			.OnDelete(DeleteBehavior.Restrict);

		builder.Property(b => b.CourseId).IsRequired().HasColumnName("course_id");
		builder.HasIndex(b => b.CourseId);
		// Relación con la tabla de cursos
		builder.HasOne(b => b.Course)
			.WithMany()
			.HasForeignKey(b => b.CourseId)
			.OnDelete(DeleteBehavior.Restrict);

		builder.Property(b => b.CreatedAt).IsRequired().HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
	}
}
