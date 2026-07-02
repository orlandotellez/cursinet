using Cursinet.Domain.Entities;
using Cursinet.Domain.Enums;

namespace Cursinet.Domain.Entities;

// Creación del modelo Payment para tabla en la bd
// Pagos de cursos individuales (one-time purchases)
public class Payment
{
	public Guid Id {get; set;} // Identificador único

	public Guid UserId {get; set;} // Comprador
	public User User {get; set;} = null!; // Navegación a usuario

	public Guid? CourseId {get; set;} // Curso comprado (nullable si es otro concepto)
	public Course? Course {get; set;} // Navegación a curso

	public string? PayPalOrderId {get; set;} // ID de Order en PayPal (creado por Orders v2 API)

	public string? PayPalCaptureId {get; set;} // ID de Capture en PayPal (asignado tras PAYMENT.CAPTURE.COMPLETED)

	public decimal Amount {get; set;} // Monto pagado

	public string Currency {get; set;} = "USD"; // Moneda

	public PaymentStatus Status {get; set;} // Estado del pago

	public string? Type {get; set;} // Tipo de pago (course_purchase, subscription, etc.)

	public DateTime? PaidAt {get; set;} // Fecha de pago confirmado

	public DateTime? RefundedAt {get; set;} // Fecha de reembolso

	public DateTime CreatedAt {get; set;} // Fecha de creación

	public DateTime UpdatedAt {get; set;} // Fecha de actualización
}
