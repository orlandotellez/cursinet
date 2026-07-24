namespace Cursinet.Domain.Entities;

// Creación de modelo para la tabla verification
public class Verification
{
	public Guid Id {get; set;} // ID de la tabla

	public string Identifier {get; set;} = null!; // Identificador (email, telefono)

	public string Value {get; set;} = null!; // Token de verificación

	public DateTime ExpiresAt {get; set;} // Tiempo de expiración del token

	public DateTime CreatedAt {get; set;} // Tiempo de creación del token

	public DateTime UpdatedAt {get; set;} // Tiempo de actulización del token
}
