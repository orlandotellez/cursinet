using Cursinet.Domain.Entities;

namespace Cursinet.Domain.Entities;

// Creación del modelo QuizQuestion para tabla en la bd
// Preguntas individuales de un quiz.
public class QuizQuestion
{
	public Guid Id {get; set;} // Identificador único

	public Guid QuizId {get; set;} // Quiz al que pertenece
	public Quiz Quiz {get; set;} = null!; // Navegación a quiz

	public string Text {get; set;} = string.Empty; // Enunciado de la pregunta

	public string Type {get; set;} = string.Empty; // Tipo (single_choice, multiple_choice, code)

	public string? Explanation {get; set;} // Explicación de la respuesta correcta

	public int SortOrder {get; set;} // Orden dentro del quiz

	public DateTime CreatedAt {get; set;} // Fecha de creación

	public DateTime UpdatedAt {get; set;} // Fecha de actualización
}
