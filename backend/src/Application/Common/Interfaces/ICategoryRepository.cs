using Cursinet.Domain.Entities;

namespace Cursinet.Application.Common.Interfaces;

public interface ICategoryRepository
{
    Task<List<Category>> GetAllAsync();
}
