using Cursinet.Domain.Entities;

namespace Cursinet.Domain.Entities;

// Creación del modelo Tag para tabla en la bd
// Etiquetas para categorización transversal de cursos
public class Tag
{
	public Guid Id {get; set;} // Identificador único

	public string Name {get; set;} = string.Empty; // Nombre visible

	public string Slug {get; set;} = string.Empty; // Slug para URLs

	public DateTime CreatedAt {get; set;} // Fecha de creación

	public DateTime UpdatedAt {get; set;} // Fecha de actualización
}
