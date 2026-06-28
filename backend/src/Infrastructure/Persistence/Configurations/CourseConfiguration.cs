using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Cursinet.Domain.Entities;
using NpgsqlTypes;

namespace Cursinet.Infrastructure.Persistence.Configurations;

public class CourseConfiguration : IEntityTypeConfiguration<Course>
{
	public void Configure(EntityTypeBuilder<Course> builder)
	{

		builder.ToTable("Courses");

		builder.HasKey(c => c.Id);
		builder.Property(c => c.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");

		builder.Property(c => c.InstructorId).IsRequired().HasColumnName("instructor_id");
		builder.HasIndex(c => c.InstructorId);

		builder.HasOne(c => c.Instructor)
			.WithMany()
			.HasForeignKey(c => c.InstructorId)
			.OnDelete(DeleteBehavior.Restrict);

		builder.Property(c => c.CategoryId).IsRequired().HasColumnName("category_id");
		builder.HasIndex(c => c.CategoryId);

		builder.HasOne(c => c.Category)
			.WithMany()
			.HasForeignKey(c => c.CategoryId)
			.OnDelete(DeleteBehavior.Restrict);

		builder.Property(c => c.Title).IsRequired().HasColumnName("title").HasMaxLength(255);

		builder.Property(c => c.Slug).IsRequired().HasColumnName("slug").HasMaxLength(255);
		builder.HasIndex(c => c.Slug).IsUnique();

		builder.Property(c => c.ShortDescription).HasColumnName("short_description").HasMaxLength(500);

		builder.Property(c => c.Description).HasColumnName("description");

		builder.Property(c => c.ThumbnailUrl).HasColumnName("thumbnail_url");

		builder.Property(c => c.PreviewVideoUrl).HasColumnName("preview_video_url");

		builder.Property(c => c.Level).IsRequired().HasColumnName("level");

		builder.Property(c => c.Language).IsRequired().HasColumnName("language").HasMaxLength(10).HasDefaultValue("es");

		builder.Property(c => c.DurationMinutes).IsRequired().HasColumnName("duration_minutes").HasDefaultValue(0);

		builder.Property(c => c.StudentsCount).IsRequired().HasColumnName("students_count").HasDefaultValue(0);

		builder.Property(c => c.AverageRating).IsRequired().HasColumnName("average_rating").HasDefaultValue(0m).HasColumnType("decimal(3,2)");

		builder.Property(c => c.ReviewsCount).IsRequired().HasColumnName("reviews_count").HasDefaultValue(0);

		builder.Property(c => c.Price).IsRequired().HasColumnName("price").HasDefaultValue(0m).HasColumnType("decimal(10,2)");

		builder.Property(c => c.OriginalPrice).HasColumnName("original_price").HasColumnType("decimal(10,2)");

		builder.Property(c => c.IsFree).IsRequired().HasColumnName("is_free").HasDefaultValue(false);

		builder.Property(c => c.IsPublished).IsRequired().HasColumnName("is_published").HasDefaultValue(false);
		builder.HasIndex(c => c.IsPublished);

		builder.Property(c => c.IsFeatured).IsRequired().HasColumnName("is_featured").HasDefaultValue(false);
		builder.HasIndex(c => c.IsFeatured);

		builder.Property(c => c.Requirements).HasColumnName("requirements");

		builder.Property(c => c.LearningObjectives).HasColumnName("learning_objectives");

		builder.Property(c => c.SearchVector)
			.HasColumnName("search_vector")
			.HasColumnType("tsvector")
#pragma warning disable CS0618 // NpgsqlTsVector.Parse is obsolete — client-side parsing is unreliable but needed here as a ValueConverter
			.HasConversion(
				new ValueConverter<string?, NpgsqlTsVector?>(
					v => v == null ? null : NpgsqlTsVector.Parse(v),
					v => v == null ? null : v.ToString()
				)
			);
#pragma warning restore CS0618

		builder.Property(c => c.PublishedAt).HasColumnName("published_at");

		builder.Property(c => c.CreatedAt).IsRequired().HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
		builder.Property(c => c.UpdatedAt).IsRequired().HasColumnName("updated_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
		builder.Property(c => c.DeletedAt).HasColumnName("deleted_at");

		builder.Property(c => c.DeletedByUserId).HasColumnName("deleted_by_user_id");
		builder.HasIndex(c => c.DeletedByUserId);
		builder.HasOne(c => c.DeletedByUser)
			.WithMany()
			.HasForeignKey(c => c.DeletedByUserId)
			.OnDelete(DeleteBehavior.SetNull);

		builder.HasIndex(c => c.SearchVector).HasDatabaseName("idx_courses_search");
	}
}
