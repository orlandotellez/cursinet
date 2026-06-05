using Cursinet.Domain.Entities;

namespace Cursinet.Domain.Entities;

// Creación del modelo QuizAttempt para tabla en la bd
// Intento de un estudiante en un quiz.
public class QuizAttempt
{
	public Guid Id {get; set;} // Identificador único

	public Guid QuizId {get; set;} // Quiz intentado
	public Quiz Quiz {get; set;} = null!; // Navegación a quiz

	public Guid UserId {get; set;} // Estudiante
	public User User {get; set;} = null!; // Navegación a usuario

	public decimal? Score {get; set;} // Puntaje obtenido

	public bool IsPassed {get; set;} // Aprobó o no

	public int? TimeSpentSeconds {get; set;} // Tiempo tomado

	public DateTime? StartedAt {get; set;} // Inicio del intento

	public DateTime? CompletedAt {get; set;} // Fin del intento

	public DateTime CreatedAt {get; set;} // Fecha de creación
}
