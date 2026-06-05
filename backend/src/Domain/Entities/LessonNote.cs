namespace Cursinet.Domain.Entities;

// Creación del modelo LessonNote para tabla en la bd
// Notas personales que los estudiantes toman en cada lección
public class LessonNote
{
	public Guid Id {get; set;} // Identificador único

	public Guid UserId {get; set;} // Autor de la nota
	public User User {get; set;} = null!; // Navegación a usuario

	public Guid LessonId {get; set;} // Lección asociada
	public Lesson Lesson {get; set;} = null!; // Navegación a lección

	public string Content {get; set;} = null!; // Contenido de la nota

	public int? VideoTimestampSeconds {get; set;} // Timestamp del video asociado

	public DateTime CreatedAt {get; set;} // Fecha de creación

	public DateTime UpdatedAt {get; set;} // Fecha de actualización
}
