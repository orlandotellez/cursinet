using Cursinet.Application.Common.Models;
using Cursinet.Domain.Entities;
using Cursinet.Domain.Exceptions;

namespace Cursinet.Application.Common.Mapping;

public static class MappingModule
{
    public static ModuleResponse MapToDto(this Module module)
    {
        if (module == null) throw AppExceptions.UnprocessableEntity(nameof(module));

        return new ModuleResponse
        {
            Id = module.Id,
            CourseId = module.CourseId,
            Title = module.Title,
            Description = module.Description,
            SortOrder = module.SortOrder,
            IsPublished = module.IsPublished,
            Lessons = module.Lessons?
                .Where(l => l.DeletedAt == null)
                .OrderBy(l => l.SortOrder)
                .Select(l => l.MapToSummary())
                .ToList(),
            CreatedAt = module.CreatedAt,
            UpdatedAt = module.UpdatedAt,
        };
    }

    public static CurriculumModule MapToCurriculumDto(this Module module, bool includeUnpublished = false)
    {
        if (module == null) throw AppExceptions.UnprocessableEntity(nameof(module));

        var lessons = module.Lessons?
            .Where(l => l.DeletedAt == null);

        if (!includeUnpublished)
            lessons = lessons?.Where(l => l.IsPublished);

        return new CurriculumModule
        {
            Id = module.Id,
            Title = module.Title,
            SortOrder = module.SortOrder,
            Lessons = lessons?
                .OrderBy(l => l.SortOrder)
                .Select(l => l.MapToSummary())
                .ToList() ?? [],
        };
    }
}
