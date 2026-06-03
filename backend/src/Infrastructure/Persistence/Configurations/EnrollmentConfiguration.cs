using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Cursinet.Domain.Entities;

namespace Cursinet.Infrastructure.Persistence.Configurations;

public class EnrollmentConfiguration : IEntityTypeConfiguration<Enrollment>
{
	public void Configure(EntityTypeBuilder<Enrollment> builder)
	{
		// Nombre que le daremos a la tabla
		builder.ToTable("Enrollments");

		// Configuraciones de los campos de la tabla Enrollments
		builder.HasKey(e => e.Id);
		builder.Property(e => e.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");

		builder.Property(e => e.UserId).IsRequired().HasColumnName("user_id");
		builder.HasIndex(e => e.UserId);
		// Relación con la tabla de usuarios (estudiante)
		builder.HasOne(e => e.User)
			.WithMany()
			.HasForeignKey(e => e.UserId)
			.OnDelete(DeleteBehavior.Restrict);

		builder.Property(e => e.CourseId).IsRequired().HasColumnName("course_id");
		builder.HasIndex(e => e.CourseId);
		// Relación con la tabla de cursos
		builder.HasOne(e => e.Course)
			.WithMany()
			.HasForeignKey(e => e.CourseId)
			.OnDelete(DeleteBehavior.Restrict);

		builder.Property(e => e.PaymentId).HasColumnName("payment_id");
		builder.HasIndex(e => e.PaymentId);
		// Relación con la tabla de pagos
		builder.HasOne(e => e.Payment)
			.WithMany()
			.HasForeignKey(e => e.PaymentId)
			.OnDelete(DeleteBehavior.Restrict);

		// Índice único compuesto (user_id, course_id)
		builder.HasIndex(e => new { e.UserId, e.CourseId }).IsUnique();

		builder.Property(e => e.EnrolledAt).IsRequired().HasColumnName("enrolled_at").HasDefaultValueSql("CURRENT_TIMESTAMP");

		builder.Property(e => e.CompletedAt).HasColumnName("completed_at");

		builder.Property(e => e.ProgressPercentage).IsRequired().HasColumnName("progress_percentage").HasDefaultValue(0m).HasColumnType("decimal(5,2)");

		builder.Property(e => e.LastAccessedAt).HasColumnName("last_accessed_at");

		builder.Property(e => e.CreatedAt).IsRequired().HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
		builder.Property(e => e.UpdatedAt).IsRequired().HasColumnName("updated_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
		builder.Property(e => e.DeletedAt).HasColumnName("deleted_at");
	}
}
