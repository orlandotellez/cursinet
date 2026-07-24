namespace Cursinet.Domain.Enums;


// Creación de enum para estado de pagos
public enum PaymentStatus
{
    Pending, // Pago iniciado, pendiente de confirmación
    Completed, // Pago confirmado y completado
    Failed, // Pago rechazado o fallido
    Refunded // Pago reembolsado
}
