using Cursinet.Domain.Enums;

namespace Cursinet.Domain.Entities;

// Creación del modelo Subscription para tabla en la bd
// Suscripciones de los usuarios (plan mensual, anual, lifetime)
public class Subscription
{
	public Guid Id {get; set;} // Identificador único

	public Guid UserId {get; set;} // Suscriptor
	public User User {get; set;} = null!; // Navegación a usuario

	public string? StripeSubscriptionId {get; set;} // ID de Subscription en Stripe

	public SubscriptionPlan Plan {get; set;} // Plan contratado

	public string Status {get; set;} = null!; // Estado (active, past_due, canceled, etc.)

	public DateTime? CurrentPeriodStart {get; set;} // Inicio del período actual

	public DateTime? CurrentPeriodEnd {get; set;} // Fin del período actual

	public bool CancelAtPeriodEnd {get; set;} // Cancelar al final del período

	public DateTime CreatedAt {get; set;} // Fecha de creación

	public DateTime UpdatedAt {get; set;} // Fecha de actualización
}
