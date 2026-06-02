using Cursinet.Application.Common.Models;
using Cursinet.Domain.Enums;

namespace Cursinet.Application.Common.Interfaces;

public interface ICourseService
{
    Task<List<CourseResponse>> GetAllAsync(CourseFilter? filter = null);
    Task<CourseResponse> GetByIdAsync(Guid id);
    Task<CourseResponse> GetBySlugAsync(string slug);
    Task<CourseResponse> CreateAsync(CreateCourseRequest request, Guid userId);
    Task<CourseResponse> UpdateAsync(Guid id, UpdateCourseRequest request, Guid userId, UserRole currentUserRole);
    Task DeleteAsync(Guid id, Guid userId, UserRole currentUserRole);
    Task<CourseResponse> PublishAsync(Guid id, Guid userId, UserRole currentUserRole);
}
