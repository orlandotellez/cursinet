using Microsoft.EntityFrameworkCore;
using Cursinet.Application.Common.Interfaces;
using Cursinet.Domain.Entities;

namespace Cursinet.Infrastructure.Persistence.Repositories;

public class CertificateRepository : ICertificateRepository
{
    private readonly ApplicationDbContext _context;

    public CertificateRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<Certificate>> GetByUserAsync(Guid userId)
    {
        return await _context.Set<Certificate>()
            .Where(c => c.UserId == userId)
            .OrderByDescending(c => c.IssuedAt)
            .ToListAsync();
    }

    public async Task<Certificate?> GetByUserAndCourseAsync(Guid userId, Guid courseId)
    {
        return await _context.Set<Certificate>()
            .FirstOrDefaultAsync(c => c.UserId == userId && c.CourseId == courseId);
    }

    public async Task<Certificate> CreateAsync(Certificate certificate)
    {
        await _context.Set<Certificate>().AddAsync(certificate);
        await _context.SaveChangesAsync();
        return certificate;
    }
}
