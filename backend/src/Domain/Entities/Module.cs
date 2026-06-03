using Cursinet.Domain.Entities;

namespace Cursinet.Domain.Entities;

// Creación del modelo Module para tabla en la bd
// Módulos o secciones dentro de un curso. Agrupan lecciones.
public class Module
{
	public Guid Id {get; set;} // Identificador único

	public Guid CourseId {get; set;} // Curso al que pertenece
	public Course Course {get; set;} = null!; // Navegación a curso

	public string Title {get; set;} = string.Empty; // Título del módulo

	public string? Description {get; set;} // Descripción del módulo

	public int SortOrder {get; set;} // Orden dentro del curso

	public bool IsPublished {get; set;} // Módulo publicado

	public DateTime CreatedAt {get; set;} // Fecha de creación

	public DateTime UpdatedAt {get; set;} // Fecha de actualización

	public DateTime? DeletedAt {get; set;} // Soft-delete
}
