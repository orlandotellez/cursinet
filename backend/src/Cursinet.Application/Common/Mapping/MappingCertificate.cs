using Cursinet.Application.Common.Models;
using Cursinet.Domain.Entities;

namespace Cursinet.Application.Common.Mapping;

public static class MappingCertificate
{
    public static CertificateResponse MapToDto(this Certificate certificate)
    {
        return new CertificateResponse
        {
            Id = certificate.Id,
            CourseId = certificate.CourseId,
            StudentName = certificate.StudentName,
            CourseName = certificate.CourseName,
            InstructorName = certificate.InstructorName,
            IssuedAt = certificate.IssuedAt,
            CertificateNumber = certificate.CertificateNumber,
        };
    }
}
