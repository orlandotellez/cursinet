using Cursinet.Domain.Entities;

namespace Cursinet.Domain.Entities;

// Creación del modelo LessonProgress para tabla en la bd
// Progreso individual de cada lección por estudiante.
public class LessonProgress
{
	public Guid Id {get; set;} // Identificador único

	public Guid UserId {get; set;} // Estudiante
	public User User {get; set;} = null!; // Navegación a usuario

	public Guid LessonId {get; set;} // Lección
	public Lesson Lesson {get; set;} = null!; // Navegación a lección

	public bool IsCompleted {get; set;} // Lección completada

	public int WatchedSeconds {get; set;} // Segundos vistos (video)

	public int LastPositionSeconds {get; set;} // Posición donde quedó

	public DateTime UpdatedAt {get; set;} // Fecha de actualización

	public DateTime CreatedAt {get; set;} // Fecha de creación
}
