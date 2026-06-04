using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Cursinet.Domain.Entities;

namespace Cursinet.Infrastructure.Persistence.Configurations;

public class ReviewConfiguration : IEntityTypeConfiguration<Review>
{
    public void Configure(EntityTypeBuilder<Review> builder)
    {
        builder.ToTable("Reviews");

        builder.HasKey(r => r.Id);
        builder.Property(r => r.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");

        builder.Property(r => r.Rating).IsRequired().HasColumnName("rating");
        builder.Property(r => r.Comment).HasColumnName("comment").HasMaxLength(2000);
        builder.Property(r => r.CreatedAt).IsRequired().HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
        builder.Property(r => r.UpdatedAt).IsRequired().HasColumnName("updated_at").HasDefaultValueSql("CURRENT_TIMESTAMP");

        // Relación con Course
        builder.Property(r => r.CourseId).IsRequired().HasColumnName("course_id");
        builder.HasOne(r => r.Course)
            .WithMany()
            .HasForeignKey(r => r.CourseId)
            .OnDelete(DeleteBehavior.Cascade);

        // Relación con User
        builder.Property(r => r.UserId).IsRequired().HasColumnName("user_id");
        builder.HasOne(r => r.User)
            .WithMany()
            .HasForeignKey(r => r.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // Índice único: un review por user por course
        builder.HasIndex(r => new { r.UserId, r.CourseId }).IsUnique();
    }
}
