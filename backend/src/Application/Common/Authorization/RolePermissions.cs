using Cursinet.Domain.Enums;

namespace Cursinet.Application.Common.Authorization;

/// Mapeo estático de roles a permisos.
/// Centraliza qué puede hacer cada rol en el sistema.
public static class RolePermissions
{
    private static readonly Dictionary<UserRole, string[]> Map = new()
    {
        [UserRole.Admin] = Permissions.All,

        [UserRole.Instructor] =
        [
            Permissions.CourseCreate,
            Permissions.CourseRead,
            Permissions.CourseUpdate,
            Permissions.CourseDelete,
            Permissions.CoursePublish,
            Permissions.UserRead,
            Permissions.CategoryRead,
        ],

        [UserRole.Moderator] =
        [
            Permissions.CourseRead,
            Permissions.UserRead,
            Permissions.UserUpdate,
            Permissions.CategoryRead,
            Permissions.AdminPanel,
        ],

        [UserRole.Student] =
        [
            Permissions.CourseRead,
        ],
    };

    public static string[] GetForRole(UserRole role)
        => Map.GetValueOrDefault(role, []);
}
