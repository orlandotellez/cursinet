using Cursinet.Domain.Enums;

namespace Cursinet.Domain.Entities;

public class UserTwoFactor
{
	public Guid Id {get; set;} // Id de la tabla

	public Guid UserId {get; set;} // ID del dueño del usuario
	public User User {get; set;} =  null!; // Referencia a la tabla usuario

	public string Secret {get; set;} = null!; // Secreto TOTP

	public string[]? BackUpCodes {get; set;} // Código de respaldo

	public bool IsEnabled {get; set;} // Estado

	public DateTime CreatedAt {get; set;} // Tiempo de Creación

	public DateTime UpdatedAt {get; set;} // Tiempo de Actualización
}
