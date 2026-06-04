using Cursinet.Domain.Entities;

namespace Cursinet.Domain.Entities;

// Creación del modelo QuizAttemptAnswer para tabla en la bd
// Respuestas individuales de cada intento.
public class QuizAttemptAnswer
{
	public Guid Id {get; set;} // Identificador único

	public Guid AttemptId {get; set;} // Intento asociado
	public QuizAttempt Attempt {get; set;} = null!; // Navegación a intento

	public Guid QuestionId {get; set;} // Pregunta respondida
	public QuizQuestion Question {get; set;} = null!; // Navegación a pregunta

	public Guid? SelectedOptionId {get; set;} // Opción seleccionada
	public QuizOption? SelectedOption {get; set;} // Navegación a opción

	public string? CodeAnswer {get; set;} // Respuesta de código (type=code)

	public bool IsCorrect {get; set;} // Respuesta correcta

	public DateTime CreatedAt {get; set;} // Fecha de creación
}
