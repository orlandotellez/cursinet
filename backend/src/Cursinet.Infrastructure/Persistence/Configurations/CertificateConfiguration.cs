using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Cursinet.Domain.Entities;

namespace Cursinet.Infrastructure.Persistence.Configurations;

public class CertificateConfiguration : IEntityTypeConfiguration<Certificate>
{
    public void Configure(EntityTypeBuilder<Certificate> builder)
    {
        builder.ToTable("Certificates");

        builder.HasKey(c => c.Id);
        builder.Property(c => c.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");

        builder.Property(c => c.CourseId).IsRequired().HasColumnName("course_id");
        builder.HasOne(c => c.Course)
            .WithMany()
            .HasForeignKey(c => c.CourseId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Property(c => c.UserId).IsRequired().HasColumnName("user_id");
        builder.HasOne(c => c.User)
            .WithMany()
            .HasForeignKey(c => c.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Property(c => c.IssuedAt).IsRequired().HasColumnName("issued_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
        builder.Property(c => c.CertificateNumber).IsRequired().HasColumnName("certificate_number").HasMaxLength(64);
        builder.HasIndex(c => c.CertificateNumber).IsUnique();
        builder.Property(c => c.StudentName).IsRequired().HasColumnName("student_name").HasMaxLength(255);
        builder.Property(c => c.CourseName).IsRequired().HasColumnName("course_name").HasMaxLength(255);
        builder.Property(c => c.InstructorName).IsRequired().HasColumnName("instructor_name").HasMaxLength(255);
        builder.Property(c => c.CreatedAt).IsRequired().HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");

        // One certificate per user per course
        builder.HasIndex(c => new { c.UserId, c.CourseId }).IsUnique();
    }
}
