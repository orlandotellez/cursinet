using Cursinet.Domain.Entities;

namespace Cursinet.Domain.Entities;

// Creación del modelo CourseTag para tabla en la bd
// Relación muchos-a-muchos entre cursos y tags
public class CourseTag
{
	public Guid CourseId {get; set;} // FK a cursos
	public Course Course {get; set;} = null!; // Navegación a curso

	public Guid TagId {get; set;} // FK a tags
	public Tag Tag {get; set;} = null!; // Navegación a tag
}
