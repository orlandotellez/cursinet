using Cursinet.Domain.Enums;
 
namespace Cursinet.Domain.Entities;

// Creación del modelo Session para tabla en la bd
public class Session
{
	public Guid Id {get; set;} // Id de la tabla

	public DateTime ExpiresAt {get; set;} // Expiración del token

	public string Token {get; set;} = string.Empty; // Token de la sesión

	public DateTime CreatedAt {get; set;} // Fecha de creación

	public DateTime UpdatedAt {get; set;} // Fecha de actualización

	public string? IpAddress {get; set;} // Ip desde donde se creó

	public string? UserAgent {get; set;} // User-Agent del usuario

	public Guid UserId {get; set;} // Id de usuario

	public User User {get; set;} = null!; // Referencia a la tabla de usuarios
}
