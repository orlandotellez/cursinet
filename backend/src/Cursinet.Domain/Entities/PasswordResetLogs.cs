using Cursinet.Domain.Enums;

namespace Cursinet.Domain.Entities;

public class PasswordResetLogs
{
	public Guid Id {get; set;} // ID de la tabla

	public Guid UserId {get; set;} // ID del dueño del usuario
	public User User {get; set;} =  null!; // Referencia a la tabla usuario

	public string? IpAddress {get; set;} // IP de la solicitud

	public string? UserAgent {get; set;} // User-Agent del navegador

	public DateTime CreatedAt {get; set;} // Tiempo de creación
}
