using Cursinet.Application.Common.Helpers;
using Cursinet.Application.Common.Interfaces;
using Cursinet.Application.Common.Mapping;
using Cursinet.Application.Common.Models;
using Cursinet.Domain.Entities;
using Cursinet.Domain.Enums;
using Cursinet.Domain.Exceptions;

namespace Cursinet.Application.Features.Payments;

public class PaymentService : IPaymentService
{
    private readonly IPaymentRepository _paymentRepository;
    private readonly ICourseRepository _courseRepository;
    private readonly IEnrollmentRepository _enrollmentRepository;
    private readonly IPaymentProvider _paymentProvider;

    public PaymentService(
        IPaymentRepository paymentRepository,
        ICourseRepository courseRepository,
        IEnrollmentRepository enrollmentRepository,
        IPaymentProvider paymentProvider)
    {
        _paymentRepository = paymentRepository;
        _courseRepository = courseRepository;
        _enrollmentRepository = enrollmentRepository;
        _paymentProvider = paymentProvider;
    }

    public async Task<CreatePaymentResponse> CreatePaymentAsync(
        Guid userId,
        CreatePaymentRequest request,
        CancellationToken cancellationToken = default)
    {
        // 1. Validamos que el curso exista y esté publicado
        var course = await _courseRepository.GetByIdAsync(request.CourseId);
        if (course == null)
            throw AppExceptions.NotFound("Course not found");

        if (!course.IsPublished)
            throw AppExceptions.BadRequest("Course is not published");

        // 2. Los cursos gratuitos no necesitan pago
        if (course.IsFree)
            throw AppExceptions.BadRequest("Course is free — enroll directly");

        // 3. Verificamos que no haya inscripción duplicada
        var existing = await _enrollmentRepository.GetByCourseAndUserAsync(request.CourseId, userId);
        if (existing != null)
            throw AppExceptions.Conflict("Already enrolled in this course");

        // 4. Creamos la orden en el proveedor upstream. PayPal devuelve el order id que le pasamos
        // al SDK del frontend; MockPaymentProvider devuelve un id sintético para tests.
        var providerResult = await _paymentProvider.CreateOrderAsync(
            new ProviderOrderRequest(
                UserId: userId,
                CourseId: request.CourseId,
                Amount: course.Price,
                Currency: "USD",
                Description: $"Course: {course.Title}",
                ReturnUrl: request.ReturnUrl,
                CancelUrl: request.CancelUrl),
            cancellationToken);

        var payment = new Payment
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            CourseId = request.CourseId,
            Amount = course.Price,
            Currency = "USD",
            Status = PaymentStatus.Pending,
            Type = "course_purchase",
            PayPalOrderId = providerResult.ProviderOrderId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        var created = await _paymentRepository.CreateAsync(payment);

        return new CreatePaymentResponse
        {
            PaymentId = created.Id,
            Amount = created.Amount,
            Currency = created.Currency,
            Status = created.Status.ToString(),
            PayPalOrderId = providerResult.ProviderOrderId,
            ApprovalUrl = providerResult.ApprovalUrl,
        };
    }

    public async Task<PaymentResponse> ConfirmPaymentAsync(
        Guid userId,
        ConfirmPaymentRequest request,
        CancellationToken cancellationToken = default)
    {
        // 1. Obtenemos el pago
        var payment = await _paymentRepository.GetByIdAsync(request.PaymentId);
        if (payment == null)
            throw AppExceptions.NotFound("Payment not found");

        Guard.AgainstNotOwner(payment.UserId, userId, UserRole.Admin, "payment");

        if (payment.Status != PaymentStatus.Pending)
            throw AppExceptions.BadRequest("Payment is not pending");

        if (payment.CourseId == null)
            throw AppExceptions.BadRequest("Payment has no associated course");

        // 2. Capturamos en el proveedor upstream cuando tenemos un order id. El webhook handler es
        // la fuente de verdad definitiva, así que este path es la confirmación optimista pre-webhook;
        // el guard de status del capture dentro del provider rechaza DECLINED/FAILED incluso si
        // PayPal devuelve un capture id con status no-COMPLETED.
        ProviderCaptureResult capture;
        if (!string.IsNullOrEmpty(payment.PayPalOrderId))
        {
            capture = await _paymentProvider.CaptureOrderAsync(payment.PayPalOrderId, cancellationToken);
        }
        else
        {
            // Path de desarrollo / mock sin order id upstream (datos viejos o filas pre-provider).
            capture = new ProviderCaptureResult(
                ProviderCaptureId: $"MOCK-{Guid.NewGuid():N}",
                Status: "COMPLETED",
                Amount: payment.Amount,
                Currency: payment.Currency);
        }

        payment.Status = PaymentStatus.Completed;
        payment.PaidAt = DateTime.UtcNow;
        payment.PayPalCaptureId = capture.ProviderCaptureId;
        payment.UpdatedAt = DateTime.UtcNow;

        var updated = await _paymentRepository.UpdateAsync(payment);

        // 3. Creación idempotente de enrollment — si el webhook ya lo creó, esto es un no-op.
        var alreadyEnrolled = await _enrollmentRepository.GetByCourseAndUserAsync(payment.CourseId.Value, userId);
        if (alreadyEnrolled == null)
        {
            var enrollment = new Enrollment
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                CourseId = payment.CourseId.Value,
                PaymentId = payment.Id,
                EnrolledAt = DateTime.UtcNow,
                ProgressPercentage = 0,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            };

            await _enrollmentRepository.CreateAsync(enrollment, payment.CourseId.Value);
        }

        return updated.MapToDto();
    }

    public async Task<List<PaymentResponse>> GetMyPaymentsAsync(Guid userId)
    {
        var payments = await _paymentRepository.GetByUserAsync(userId);
        return payments.Select(p => p.MapToDto()).ToList();
    }

    public async Task<PaymentResponse?> GetPaymentAsync(Guid userId, Guid paymentId)
    {
        var payment = await _paymentRepository.GetByIdAsync(paymentId);
        if (payment == null)
            return null;

        Guard.AgainstNotOwner(payment.UserId, userId, UserRole.Admin, "payment");

        return payment.MapToDto();
    }
}
