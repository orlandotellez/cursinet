using Cursinet.Api.Authorization;
using Cursinet.Domain.Enums;
using Microsoft.AspNetCore.Mvc;

namespace Cursinet.Api.Controllers;

[ApiController]
[Route("api/v1/test")]
public class TestController : ControllerBase
{
    /// Endpoints de prueba para verificar el RBAC.
    /// Cada endpoint requiere un permiso específico y devuelve 200 si el usuario lo tiene.

    [HttpGet("courses/create")]
    [RequirePermission(Permissions.CourseCreate)]
    public IActionResult TestCourseCreate()
        => Ok(new { permission = Permissions.CourseCreate, granted = true });

    [HttpGet("courses/read")]
    [RequirePermission(Permissions.CourseRead)]
    public IActionResult TestCourseRead()
        => Ok(new { permission = Permissions.CourseRead, granted = true });

    [HttpGet("courses/update")]
    [RequirePermission(Permissions.CourseUpdate)]
    public IActionResult TestCourseUpdate()
        => Ok(new { permission = Permissions.CourseUpdate, granted = true });

    [HttpGet("courses/delete")]
    [RequirePermission(Permissions.CourseDelete)]
    public IActionResult TestCourseDelete()
        => Ok(new { permission = Permissions.CourseDelete, granted = true });

    [HttpGet("courses/publish")]
    [RequirePermission(Permissions.CoursePublish)]
    public IActionResult TestCoursePublish()
        => Ok(new { permission = Permissions.CoursePublish, granted = true });

    [HttpGet("users/read")]
    [RequirePermission(Permissions.UserRead)]
    public IActionResult TestUserRead()
        => Ok(new { permission = Permissions.UserRead, granted = true });

    [HttpGet("users/update")]
    [RequirePermission(Permissions.UserUpdate)]
    public IActionResult TestUserUpdate()
        => Ok(new { permission = Permissions.UserUpdate, granted = true });

    [HttpGet("users/delete")]
    [RequirePermission(Permissions.UserDelete)]
    public IActionResult TestUserDelete()
        => Ok(new { permission = Permissions.UserDelete, granted = true });

    [HttpGet("categories/create")]
    [RequirePermission(Permissions.CategoryCreate)]
    public IActionResult TestCategoryCreate()
        => Ok(new { permission = Permissions.CategoryCreate, granted = true });

    [HttpGet("categories/read")]
    [RequirePermission(Permissions.CategoryRead)]
    public IActionResult TestCategoryRead()
        => Ok(new { permission = Permissions.CategoryRead, granted = true });

    [HttpGet("categories/update")]
    [RequirePermission(Permissions.CategoryUpdate)]
    public IActionResult TestCategoryUpdate()
        => Ok(new { permission = Permissions.CategoryUpdate, granted = true });

    [HttpGet("categories/delete")]
    [RequirePermission(Permissions.CategoryDelete)]
    public IActionResult TestCategoryDelete()
        => Ok(new { permission = Permissions.CategoryDelete, granted = true });

    [HttpGet("admin/panel")]
    [RequirePermission(Permissions.AdminPanel)]
    public IActionResult TestAdminPanel()
        => Ok(new { permission = Permissions.AdminPanel, granted = true });

    [HttpGet("system/config")]
    [RequirePermission(Permissions.SystemConfig)]
    public IActionResult TestSystemConfig()
        => Ok(new { permission = Permissions.SystemConfig, granted = true });
}
