namespace Cursinet.Application.Common.Models;

public class ModuleResponse
{
    public Guid Id { get; init; }
    public Guid CourseId { get; init; }
    public string Title { get; init; } = string.Empty;
    public string? Description { get; init; }
    public int SortOrder { get; init; }
    public bool IsPublished { get; init; }
    public List<LessonSummary>? Lessons { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
}

public class CurriculumResponse
{
    public Guid CourseId { get; init; }
    public List<CurriculumModule> Modules { get; init; } = [];
}

public class CurriculumModule
{
    public Guid Id { get; init; }
    public string Title { get; init; } = string.Empty;
    public int SortOrder { get; init; }
    public List<LessonSummary> Lessons { get; init; } = [];
}
