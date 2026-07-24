using Cursinet.Domain.Entities;

namespace Cursinet.Domain.Entities;

public class EmailVerificationLogs
{
	public Guid Id {get; set;} // ID de la tabla

	public Guid UserId {get; set;} // ID del dueño del usuario
	public User User {get; set;} =  null!; // Referencia a la tabla usuario

	public DateTime VerifiedAt {get; set;} // Momento de verificación

	public string? IpAddress {get; set;} // Ip de donde se origió la solicitud

	public DateTime CreatedAt {get; set;} // Tiempo de creación
}
