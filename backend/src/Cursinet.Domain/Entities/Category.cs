using Cursinet.Domain.Entities;

namespace Cursinet.Domain.Entities;

// Creación del modelo Category para tabla en la bd
// Taxonomía jerárquica de categorías de cursos
public class Category
{
	public Guid Id {get; set;} // Identificador único

	public string Name {get; set;} = string.Empty; // Nombre visible

	public string Slug {get; set;} = string.Empty; // Slug para URLs

	public string? Description {get; set;} // Descripción de la categoría

	public string? IconName {get; set;} // Icono asociado

	public string? Color {get; set;} // Color distintivo

	public Guid? ParentId {get; set;} // Categoría padre (auto-referencia)
	public Category? Parent {get; set;} // Navegación a categoría padre
	public ICollection<Category>? Children {get; set;} // Navegación a subcategorías

	public int SortOrder {get; set;} // Orden de aparición

	public bool IsActive {get; set;} // Visible o no

	public DateTime CreatedAt {get; set;} // Fecha de creación

	public DateTime UpdatedAt {get; set;} // Fecha de actualización

	public DateTime? DeletedAt {get; set;} // Soft-delete
}
