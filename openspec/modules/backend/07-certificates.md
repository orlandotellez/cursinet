# Certificates ⏳ Planned

Sistema de certificados PDF — aún no implementado.

## Status

**⏳ Planned / Future feature.** No hay código de certificados en el backend actual.

## Diseño Propuesto

Dark premium certificate with:
- Cursinet logo and branding (top)
- "CERTIFICADO DE FINALIZACIÓN" heading
- Student full name (large, serif-like font)
- "Ha completado satisfactoriamente el curso:" label
- Course title (bold)
- Date of completion
- Instructor name + signature line
- Certificate number: CUR-{YEAR}-{6-char-alphanumeric}
- QR code → cursinet.dev/verificar/{certificateNumber}
- Decorative border / geometric pattern

## Stack Propuesto

- **QuestPDF** (C# library) for PDF generation
- **Hangfire** or similar for background job after course completion
- PDF stored in file storage (S3 or local)
- Public URL stored in Certificates table

## API Propuesta

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /certificates/{number} | Public verification page |
| GET | /certificates/verify/{number} | Verify authenticity |
| POST | /certificates/generate/{enrollmentId} | Trigger generation |
