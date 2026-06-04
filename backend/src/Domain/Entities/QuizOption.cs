using Cursinet.Domain.Entities;

namespace Cursinet.Domain.Entities;

// Creación del modelo QuizOption para tabla en la bd
// Opciones de respuesta para cada pregunta.
public class QuizOption
{
	public Guid Id {get; set;} // Identificador único

	public Guid QuestionId {get; set;} // Pregunta asociada
	public QuizQuestion Question {get; set;} = null!; // Navegación a pregunta

	public string Text {get; set;} = string.Empty; // Texto de la opción

	public bool IsCorrect {get; set;} // Es la opción correcta

	public int SortOrder {get; set;} // Orden dentro de la pregunta

	public DateTime CreatedAt {get; set;} // Fecha de creación

	public DateTime UpdatedAt {get; set;} // Fecha de actualización
}
