using Cursinet.Domain.Enums;
namespace Cursinet.Domain.Entities;

// Creación del modelo Account para tabla en la bd
// Tabla para cuentas OAuth vinculadas (Google, Github, etc)
public class Account
{
	public Guid Id {get; set;} // ID de la tabla

	public string AccountId {get; set;} = null!; // ID de la cuenta del proveedor

	public string ProviderId {get; set;} = null!; // Proveedor OAuth (google,github,etc)
	
	public Guid UserId {get; set;} // ID del dueño del usuario
	public User User {get; set;} =  null!; // Referencia a la tabla usuario

	public string? AccessToken {get; set;} // Token de acceso OAuth

	public string? RefreshToken {get; set;} // Token de refresh OAuth

	public string? IdToken {get; set;} // ID Token OAuth

	public DateTime? AccessTokenExpiresAt {get; set;} // Expiración del access token

	public DateTime? RefreshTokenExpiresAt {get; set;} // Expiración del refresh token

	public string? Scope {get; set;} // Permisos otorgados

	public string? Password {get; set;} // Password hasheado (auth por credentials)

	public DateTime CreatedAt {get; set;} // Fecha de registro

	public DateTime UpdatedAt {get; set;} // Fecha de actualización 
} 

