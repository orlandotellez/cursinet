namespace Cursinet.Domain.Enums;

/// Catálogo centralizado de todos los permisos del sistema RBAC.
/// Formato: "{recurso}:{acción}" (ej: "courses:create").
public static class Permissions
{
    // Cursos 
    public const string CourseCreate  = "courses:create";
    public const string CourseRead    = "courses:read";
    public const string CourseUpdate  = "courses:update";
    public const string CourseDelete  = "courses:delete";
    public const string CoursePublish = "courses:publish";

    // Usuarios 
    public const string UserRead      = "users:read";
    public const string UserUpdate    = "users:update";
    public const string UserDelete    = "users:delete";

    // Categorías 
    public const string CategoryCreate = "categories:create";
    public const string CategoryRead   = "categories:read";
    public const string CategoryUpdate = "categories:update";
    public const string CategoryDelete = "categories:delete";

    // Enrollment
    public const string EnrollmentCreate = "enrollments:create";
    public const string EnrollmentRead   = "enrollments:read";

    // Modules
    public const string ModuleCreate = "modules:create";
    public const string ModuleRead   = "modules:read";
    public const string ModuleUpdate = "modules:update";
    public const string ModuleDelete = "modules:delete";

    // Lessons
    public const string LessonCreate = "lessons:create";
    public const string LessonRead   = "lessons:read";
    public const string LessonUpdate = "lessons:update";
    public const string LessonDelete = "lessons:delete";

    // Payments
    public const string PaymentCreate = "payments:create";
    public const string PaymentRead   = "payments:read";

    // Admin / Sistema 
    public const string AdminPanel    = "admin:panel";
    public const string SystemConfig  = "system:config";

    /// Todos los permisos del sistema. Útil para registrar policies y para testing.
    public static readonly string[] All =
    [
        CourseCreate, CourseRead, CourseUpdate, CourseDelete, CoursePublish,
        UserRead, UserUpdate, UserDelete,
        CategoryCreate, CategoryRead, CategoryUpdate, CategoryDelete,
        EnrollmentCreate, EnrollmentRead,
        ModuleCreate, ModuleRead, ModuleUpdate, ModuleDelete,
        LessonCreate, LessonRead, LessonUpdate, LessonDelete,
        PaymentCreate, PaymentRead,
        AdminPanel, SystemConfig,
    ];
}
