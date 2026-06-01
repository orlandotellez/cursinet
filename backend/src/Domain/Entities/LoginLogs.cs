using Cursinet.Domain.Entities;

namespace Cursinet.Domain.Entities;

public class LoginLogs
{
	public Guid Id {get; set;} // ID de la tabla

	public Guid? UserId {get; set;} // Usuario (puede ser null si falló)
	public User? User {get; set;} // Referencia a la tabla usuario

	public string? Email {get; set;} // Email intentado

	public bool Success {get; set;} // Login exitoso o no

	public string? ProviderId {get; set;} // Proveedor usado

	public string? IpAddress {get; set;} // IP del intento

	public string? UserAgent {get; set;} // Navegador/cliente

	public string? FailureReason {get; set;} // Motivo del fallo

	public DateTime CreatedAt {get; set;} // Tiempo de creación
}
