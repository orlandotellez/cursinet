using Cursinet.Application.Common.Helpers;
using Cursinet.Application.Common.Interfaces;
using Cursinet.Application.Common.Mapping;
using Cursinet.Application.Common.Models;
using Cursinet.Domain.Entities;
using Cursinet.Domain.Enums;
using Cursinet.Domain.Exceptions;

namespace Cursinet.Application.Features.Modules;

public class ModuleService : IModuleService
{
    private readonly IModuleRepository _moduleRepository;
    private readonly ILessonRepository _lessonRepository;
    private readonly ICourseRepository _courseRepository;
    private readonly IUserRepository _userRepository;
    private readonly ILessonProgressRepository _lessonProgressRepository;

    public ModuleService(
        IModuleRepository moduleRepository,
        ILessonRepository lessonRepository,
        ICourseRepository courseRepository,
        IUserRepository userRepository,
        ILessonProgressRepository lessonProgressRepository)
    {
        _moduleRepository = moduleRepository;
        _lessonRepository = lessonRepository;
        _courseRepository = courseRepository;
        _userRepository = userRepository;
        _lessonProgressRepository = lessonProgressRepository;
    }

    public async Task<List<ModuleResponse>> GetAllAsync(Guid courseId, Guid? currentUserId, UserRole? role)
    {
        var course = await _courseRepository.GetByIdAsync(courseId);
        if (course == null)
            throw AppExceptions.NotFound("Course not found");

        var isOwner = currentUserId.HasValue && course.InstructorId == currentUserId.Value;
        var isAdmin = role == UserRole.Admin;

        var modules = await _moduleRepository.GetByCourseAsync(courseId);

        if (!isOwner && !isAdmin)
        {
            modules = modules.Where(m => m.IsPublished).ToList();

            foreach (var module in modules)
            {
                module.Lessons = module.Lessons?
                    .Where(l => l.IsPublished && l.DeletedAt == null)
                    .ToList() ?? [];
            }
        }

        return modules.Select(m => m.MapToDto()).ToList();
    }

    public async Task<ModuleResponse> GetByIdAsync(Guid id, Guid? currentUserId, UserRole? role)
    {
        var module = await _moduleRepository.GetByIdAsync(id);
        if (module == null)
            throw AppExceptions.NotFound("Module not found");

        var course = await _courseRepository.GetByIdAsync(module.CourseId);
        if (course == null)
            throw AppExceptions.NotFound("Course not found");

        var isOwner = currentUserId.HasValue && course.InstructorId == currentUserId.Value;
        var isAdmin = role == UserRole.Admin;

        if (!isOwner && !isAdmin)
        {
            module.Lessons = module.Lessons?
                .Where(l => l.IsPublished && l.DeletedAt == null)
                .ToList() ?? [];
        }

        return module.MapToDto();
    }

    public async Task<CurriculumResponse> GetCurriculumAsync(Guid courseId, Guid? currentUserId, UserRole? role)
    {
        var course = await _courseRepository.GetByIdAsync(courseId);
        if (course == null)
            throw AppExceptions.NotFound("Course not found");

        var isOwner = currentUserId.HasValue && course.InstructorId == currentUserId.Value;
        var isAdmin = role == UserRole.Admin;

        var modules = await _moduleRepository.GetByCourseAsync(courseId);

        var curriculumModules = isOwner || isAdmin
            ? modules.Select(m => m.MapToCurriculumDto(includeUnpublished: true)).ToList()
            : modules
                .Where(m => m.IsPublished)
                .Select(m => m.MapToCurriculumDto(includeUnpublished: false))
                .ToList();

        // Inyectar progreso del alumno si está autenticado
        if (currentUserId.HasValue)
        {
            var progress = await _lessonProgressRepository.GetByUserAndCourseAsync(currentUserId.Value, courseId);
            var completedIds = progress
                .Where(p => p.IsCompleted)
                .Select(p => p.LessonId)
                .ToHashSet();

            foreach (var mod in curriculumModules)
            {
                foreach (var lesson in mod.Lessons)
                {
                    if (completedIds.Contains(lesson.Id))
                        lesson.IsCompleted = true;
                }
            }
        }

        return new CurriculumResponse
        {
            CourseId = courseId,
            Modules = curriculumModules,
        };
    }

    public async Task<ModuleResponse> CreateAsync(Guid courseId, CreateModuleRequest request, Guid userId, UserRole role)
    {

        var course = await _courseRepository.GetByIdAsync(courseId);
        if (course == null)
            throw AppExceptions.NotFound("Course not found");

        Guard.AgainstNotOwner(course.InstructorId, userId, role, "course");

        var existingModules = await _moduleRepository.GetByCourseAsync(courseId);
        var maxSortOrder = existingModules.Any() ? existingModules.Max(m => m.SortOrder) : 0;

        var module = new Module
        {
            Id = Guid.NewGuid(),
            CourseId = courseId,
            Title = request.Title,
            Description = request.Description,
            SortOrder = maxSortOrder + 1,
            IsPublished = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        var created = await _moduleRepository.CreateAsync(module);
        return created.MapToDto();
    }

    public async Task<ModuleResponse> UpdateAsync(Guid id, UpdateModuleRequest request, Guid userId, UserRole role)
    {
        var module = await _moduleRepository.GetByIdAsync(id);
        if (module == null)
            throw AppExceptions.NotFound("Module not found");

        var course = await _courseRepository.GetByIdAsync(module.CourseId);
        if (course == null)
            throw AppExceptions.NotFound("Course not found");

        Guard.AgainstNotOwner(course.InstructorId, userId, role, "course");

        if (request.Title != null) module.Title = request.Title;
        if (request.Description != null) module.Description = request.Description;
        if (request.IsPublished.HasValue) module.IsPublished = request.IsPublished.Value;

        module.UpdatedAt = DateTime.UtcNow;

        var updated = await _moduleRepository.UpdateAsync(module);
        return updated.MapToDto();
    }

    public async Task DeleteAsync(Guid id, Guid userId, UserRole role)
    {
        var module = await _moduleRepository.GetByIdAsync(id);
        if (module == null)
            throw AppExceptions.NotFound("Module not found");

        var course = await _courseRepository.GetByIdAsync(module.CourseId);
        if (course == null)
            throw AppExceptions.NotFound("Course not found");

        Guard.AgainstNotOwner(course.InstructorId, userId, role, "course");

        await _moduleRepository.SoftDeleteAsync(id);
    }

    public async Task ReorderAsync(Guid courseId, ReorderRequest request, Guid userId, UserRole role)
    {
        var course = await _courseRepository.GetByIdAsync(courseId);
        if (course == null)
            throw AppExceptions.NotFound("Course not found");

        Guard.AgainstNotOwner(course.InstructorId, userId, role, "course");

        await _moduleRepository.UpdateSortOrderAsync(
            request.Items.Select(i => (i.Id, i.SortOrder)).ToList());
    }
}
