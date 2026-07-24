using Cursinet.Domain.Entities;
using Cursinet.Domain.Enums;

namespace Cursinet.Domain.Entities;

// Creación del modelo Lesson para tabla en la bd
// Lecciones individuales dentro de un módulo. Pueden ser de distintos tipos (video, texto, quiz, etc.).
public class Lesson
{
	public Guid Id {get; set;} // Identificador único

	public Guid ModuleId {get; set;} // Módulo al que pertenece
	public Module Module {get; set;} = null!; // Navegación a módulo

	public Guid CourseId {get; set;} // Curso (denormalizado para queries)
	public Course Course {get; set;} = null!; // Navegación a curso

	public string Title {get; set;} = string.Empty; // Título de la lección

	public string Slug {get; set;} = string.Empty; // Slug para URLs

	public LessonType Type {get; set;} // Tipo de lección

	public string? VideoUrl {get; set;} // URL del video (si type=VIDEO)

	public int? VideoDurationSeconds {get; set;} // Duración del video en segundos

	public string? ContentMarkdown {get; set;} // Contenido en markdown (text/code)

	public int SortOrder {get; set;} // Orden dentro del módulo

	public bool IsPublished {get; set;} // Lección publicada

	public bool IsPreview {get; set;} // Lección visible sin login

	public string[]? AttachmentUrls {get; set;} // URLs de archivos adjuntos

	public DateTime CreatedAt {get; set;} // Fecha de creación

	public DateTime UpdatedAt {get; set;} // Fecha de actualización

	public DateTime? DeletedAt {get; set;} // Soft-delete
}
