using Cursinet.Domain.Enums;

namespace Cursinet.Domain.Entities;

public class Course
{
	public Guid Id {get; set;}

	public Guid InstructorId {get; set;}
	public User Instructor {get; set;} = null!;

	public Guid CategoryId {get; set;}
	public Category Category {get; set;} = null!;

	public string Title {get; set;} = string.Empty;

	public string Slug {get; set;} = string.Empty;

	public string? ShortDescription {get; set;}

	public string? Description {get; set;}

	public string? ThumbnailUrl {get; set;}

	public string? PreviewVideoUrl {get; set;}

	public CourseLevel Level {get; set;}

	public string Language {get; set;} = "es";

	public int DurationMinutes {get; set;}

	public int StudentsCount {get; set;}

	public decimal AverageRating {get; set;}

	public int ReviewsCount {get; set;}

	public decimal Price {get; set;}

	public decimal? OriginalPrice {get; set;}

	public bool IsFree {get; set;}

	public bool IsPublished {get; set;}

	public bool IsFeatured {get; set;}

	public string[]? Requirements {get; set;}

	public string[]? LearningObjectives {get; set;}

	public string? SearchVector {get; set;}

	public DateTime? PublishedAt {get; set;}

	public DateTime CreatedAt {get; set;}

	public DateTime UpdatedAt {get; set;}

	public DateTime? DeletedAt {get; set;}

	public Guid? DeletedByUserId {get; set;}
	public User? DeletedByUser {get; set;}
}
