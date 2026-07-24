namespace Cursinet.Domain.Entities;

// Creación del modelo Bookmark para tabla en la bd
// Marcadores de cursos guardados por el estudiante (PK compuesta)
public class Bookmark
{
	public Guid UserId {get; set;} // Estudiante
	public User User {get; set;} = null!; // Navegación a usuario

	public Guid CourseId {get; set;} // Curso guardado
	public Course Course {get; set;} = null!; // Navegación a curso

	public DateTime CreatedAt {get; set;} // Fecha de creación
}
