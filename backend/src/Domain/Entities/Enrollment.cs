using Cursinet.Domain.Entities;

namespace Cursinet.Domain.Entities;

// Creación del modelo Enrollment para tabla en la bd
// Registro de inscripción de un estudiante a un curso.
public class Enrollment
{
	public Guid Id {get; set;} // Identificador único

	public Guid UserId {get; set;} // Estudiante
	public User User {get; set;} = null!; // Navegación a usuario

	public Guid CourseId {get; set;} // Curso
	public Course Course {get; set;} = null!; // Navegación a curso

	public Guid? PaymentId {get; set;} // Pago asociado (si aplica)
	public Payment? Payment {get; set;} // Navegación a pago

	public DateTime EnrolledAt {get; set;} // Fecha de inscripción

	public DateTime? CompletedAt {get; set;} // Fecha de finalización

	public decimal ProgressPercentage {get; set;} // Progreso 0-100%

	public DateTime? LastAccessedAt {get; set;} // Último acceso

	public DateTime CreatedAt {get; set;} // Fecha de creación

	public DateTime UpdatedAt {get; set;} // Fecha de actualización

	public DateTime? DeletedAt {get; set;} // Soft-delete
}
