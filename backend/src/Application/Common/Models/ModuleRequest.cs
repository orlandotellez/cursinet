namespace Cursinet.Application.Common.Models;

public record CreateModuleRequest(string Title, string? Description = null);

public record UpdateModuleRequest(string? Title = null, string? Description = null, bool? IsPublished = null);

public record ReorderItem(Guid Id, int SortOrder);

public record ReorderRequest(List<ReorderItem> Items);
