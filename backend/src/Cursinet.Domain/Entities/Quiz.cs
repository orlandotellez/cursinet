using Cursinet.Domain.Entities;

namespace Cursinet.Domain.Entities;

// Creación del modelo Quiz para tabla en la bd
// Evaluación asociada a una lección de tipo QUIZ.
public class Quiz
{
	public Guid Id {get; set;} // Identificador único

	public Guid LessonId {get; set;} // Lección asociada
	public Lesson Lesson {get; set;} = null!; // Navegación a lección

	public string Title {get; set;} = string.Empty; // Título del quiz

	public int PassingScore {get; set;} // Nota mínima para aprobar (0-100)

	public int? MaxAttempts {get; set;} // Intentos máximos permitidos

	public int? TimeLimitMinutes {get; set;} // Límite de tiempo en minutos

	public DateTime CreatedAt {get; set;} // Fecha de creación

	public DateTime UpdatedAt {get; set;} // Fecha de actualización
}
