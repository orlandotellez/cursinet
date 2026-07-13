using System.Globalization;
using Cursinet.Application.Common.Interfaces;
using Cursinet.Domain.Exceptions;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace Cursinet.Application.Features.Certificates;

public class CertificatePdfService : ICertificatePdfService
{
    private readonly ICertificateRepository _certificateRepository;
    private readonly IUserRepository _userRepository;

    private static readonly Color Gold = Color.FromHex("#d4a843");
    private static readonly Color White = Colors.White;
    private static readonly Color Muted = Color.FromHex("#a0a0b8");

    public CertificatePdfService(
        ICertificateRepository certificateRepository,
        IUserRepository userRepository)
    {
        _certificateRepository = certificateRepository;
        _userRepository = userRepository;
    }

    public async Task<byte[]> GenerateCertificatePdfAsync(Guid certificateId, Guid userId)
    {
        var certificate = await _certificateRepository.GetByIdAsync(certificateId)
            ?? throw AppExceptions.NotFound("Certificate not found");

        if (certificate.UserId != userId)
            throw AppExceptions.NotFound("Certificate not found");

        var user = await _userRepository.GetByIdAsync(certificate.UserId)
            ?? throw AppExceptions.NotFound("User not found");

        var studentName = !string.IsNullOrEmpty(certificate.StudentName)
            ? certificate.StudentName
            : user.Name;

        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4.Landscape());
                page.Margin(40);
                page.PageColor(Color.FromHex("#0f0f1a"));

                page.Content().Column(col =>
                {
                    col.Spacing(16);

                    // Header
                    col.Item().AlignCenter()
                        .Text("CURSINET")
                        .FontSize(24).Bold().LetterSpacing(1).FontColor(Gold);

                    // Title
                    col.Item().AlignCenter()
                        .Text("CERTIFICADO DE FINALIZACIÓN")
                        .FontSize(20).Bold().FontColor(White);

                    col.Item().Padding(10);

                    // Student name
                    col.Item().AlignCenter()
                        .Text(studentName.ToUpperInvariant())
                        .FontSize(32).Bold().FontColor(White);

                    col.Item().Padding(8);

                    // Completion text
                    col.Item().AlignCenter()
                        .Text("Ha completado satisfactoriamente el curso:")
                        .FontSize(14).FontColor(Muted);

                    col.Item().Padding(4);

                    // Course name
                    col.Item().AlignCenter()
                        .Text(certificate.CourseName)
                        .FontSize(22).Bold().FontColor(Gold);

                    col.Item().Padding(16);

                    // Date + Instructor
                    col.Item().Row(row =>
                    {
                        row.RelativeItem().Column(c =>
                        {
                            c.Item().Text("Fecha de emisión").FontSize(11).FontColor(Muted);
                            c.Item().Text(certificate.IssuedAt.ToString(
                                "dd 'de' MMMM 'de' yyyy", new CultureInfo("es-ES")))
                                .FontSize(13).FontColor(White);
                        });

                        row.RelativeItem().AlignRight().Column(c =>
                        {
                            c.Item().AlignRight().Text("Instructor").FontSize(11).FontColor(Muted);
                            c.Item().AlignRight().Text(certificate.InstructorName)
                                .FontSize(13).FontColor(White);
                        });
                    });

                    col.Item().Padding(16);

                    // Signature line
                    col.Item().AlignCenter().Column(c =>
                    {
                        c.Item().AlignCenter().LineHorizontal(200).LineColor(Gold);
                        c.Item().AlignCenter().Text(certificate.InstructorName)
                            .FontSize(12).FontColor(White);
                        c.Item().AlignCenter().Text("Instructor")
                            .FontSize(10).FontColor(Muted);
                    });

                    col.Item().Padding(8);

                    // Certificate number
                    col.Item().AlignCenter()
                        .Text($"Nº {certificate.CertificateNumber}")
                        .FontSize(10).FontColor(Muted);
                });
            });
        }).GeneratePdf();
    }
}
