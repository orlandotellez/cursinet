namespace Cursinet.Domain.Entities;

// Creación del modelo Comment para tabla en la bd
// Comentarios en lecciones con soporte de respuestas anidadas (self-referencing)
public class Comment
{
	public Guid Id {get; set;} // Identificador único

	public Guid LessonId {get; set;} // Lección comentada
	public Lesson Lesson {get; set;} = null!; // Navegación a lección

	public Guid UserId {get; set;} // Autor del comentario
	public User User {get; set;} = null!; // Navegación a usuario

	public Guid? ParentId {get; set;} // Comentario padre (respuesta)
	public Comment? Parent {get; set;} // Navegación a comentario padre

	public ICollection<Comment>? Replies {get; set;} // Respuestas al comentario

	public string Body {get; set;} = null!; // Contenido del comentario

	public int LikesCount {get; set;} // Contador de likes

	public bool IsEdited {get; set;} // Fue editado

	public DateTime CreatedAt {get; set;} // Fecha de creación

	public DateTime UpdatedAt {get; set;} // Fecha de actualización

	public DateTime? DeletedAt {get; set;} // Soft-delete
}
