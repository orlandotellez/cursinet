using Cursinet.Domain.Enums;

namespace Cursinet.Domain.Entities;

// Creación del modelo Course para tabla en la bd
// Tabla principal de cursos. Contiene metadata, pricing, estadísticas y contenido de búsqueda.
public class Course
{
	public Guid Id {get; set;} // Identificador único

	public Guid InstructorId {get; set;} // Instructor del curso
	public User Instructor {get; set;} = null!; // Navegación a usuario instructor

	public Guid CategoryId {get; set;} // Categoría del curso
	public Category Category {get; set;} = null!; // Navegación a categoría

	public string Title {get; set;} = string.Empty; // Título del curso

	public string Slug {get; set;} = string.Empty; // Slug para URL

	public string? ShortDescription {get; set;} // Descripción breve (meta)

	public string? Description {get; set;} // Descripción completa del curso

	public string? ThumbnailUrl {get; set;} // URL de miniatura

	public string? PreviewVideoUrl {get; set;} // Video de preview

	public CourseLevel Level {get; set;} // Nivel del curso

	public string Language {get; set;} = "es"; // Idioma del curso

	public int DurationMinutes {get; set;} // Duración total en minutos

	public int StudentsCount {get; set;} // Contador de estudiantes

	public decimal AverageRating {get; set;} // Rating promedio

	public int ReviewsCount {get; set;} // Cantidad de reseñas

	public decimal Price {get; set;} // Precio actual

	public decimal? OriginalPrice {get; set;} // Precio original (para descuentos)

	public bool IsFree {get; set;} // Curso gratuito

	public bool IsPublished {get; set;} // Curso publicado

	public bool IsFeatured {get; set;} // Curso destacado

	public string[]? Requirements {get; set;} // Array de requisitos

	public string[]? LearningObjectives {get; set;} // Array de objetivos de aprendizaje

	public string? SearchVector {get; set;} // Full-text search vector

	public DateTime? PublishedAt {get; set;} // Fecha de publicación

	public DateTime CreatedAt {get; set;} // Fecha de creación

	public DateTime UpdatedAt {get; set;} // Fecha de actualización

	public DateTime? DeletedAt {get; set;} // Soft-delete
}
