using Cursinet.Domain.Entities;

namespace Cursinet.Application.Common.Interfaces;

public interface ICategoryService
{
    Task<IEnumerable<Category>> GetAllAsync();
}
