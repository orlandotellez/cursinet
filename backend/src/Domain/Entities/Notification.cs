namespace Cursinet.Domain.Entities;

// Creación del modelo Notification para tabla en la bd
// Notificaciones push/in-app para los usuarios
public class Notification
{
	public Guid Id {get; set;} // Identificador único

	public Guid UserId {get; set;} // Destinatario
	public User User {get; set;} = null!; // Navegación a usuario

	public string Type {get; set;} = null!; // Tipo de notificación

	public string Title {get; set;} = null!; // Título

	public string Body {get; set;} = null!; // Cuerpo del mensaje

	public string? ImageUrl {get; set;} // URL de imagen asociada

	public string? ActionUrl {get; set;} // URL de acción (deep link)

	public bool IsRead {get; set;} // Leída o no

	public DateTime CreatedAt {get; set;} // Fecha de creación
}
