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

    public PaymentService(
        IPaymentRepository paymentRepository,
        ICourseRepository courseRepository,
        IEnrollmentRepository enrollmentRepository)
    {
        _paymentRepository = paymentRepository;
        _courseRepository = courseRepository;
        _enrollmentRepository = enrollmentRepository;
    }

    public async Task<CreatePaymentResponse> CreatePaymentAsync(Guid userId, CreatePaymentRequest request)
    {
        // 1. Validate course exists and is published
        var course = await _courseRepository.GetByIdAsync(request.CourseId);
        if (course == null)
            throw AppExceptions.NotFound("Course not found");

        if (!course.IsPublished)
            throw AppExceptions.BadRequest("Course is not published");

        // 2. Free courses don't need payment
        if (course.IsFree)
            throw AppExceptions.BadRequest("Course is free — enroll directly");

        // 3. Check for duplicate enrollment
        var existing = await _enrollmentRepository.GetByCourseAndUserAsync(request.CourseId, userId);
        if (existing != null)
            throw AppExceptions.Conflict("Already enrolled in this course");

        // 4. Check for existing pending payment for this course+user
        //    (In production, we'd also check Stripe for incomplete PaymentIntents)
        //    For now, we allow creating a new one — duplicates are handled by idempotency

        // 5. Create payment record
        var payment = new Payment
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            CourseId = request.CourseId,
            Amount = course.Price,
            Currency = "USD",
            Status = PaymentStatus.Pending,
            Type = "course_purchase",
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
            ClientSecret = null, // No Stripe in dev mode
        };
    }

    public async Task<PaymentResponse> ConfirmPaymentAsync(Guid userId, ConfirmPaymentRequest request)
    {
        // 1. Get payment
        var payment = await _paymentRepository.GetByIdAsync(request.PaymentId);
        if (payment == null)
            throw AppExceptions.NotFound("Payment not found");

        Guard.AgainstNotOwner(payment.UserId, userId, UserRole.Admin, "payment");

        if (payment.Status != PaymentStatus.Pending)
            throw AppExceptions.BadRequest("Payment is not pending");

        if (payment.CourseId == null)
            throw AppExceptions.BadRequest("Payment has no associated course");

        // 2. Mark payment as completed (dev mode — instant confirm)
        //    In production, we'd verify Stripe PaymentIntent status here
        payment.Status = PaymentStatus.Completed;
        payment.PaidAt = DateTime.UtcNow;
        payment.UpdatedAt = DateTime.UtcNow;

        var updated = await _paymentRepository.UpdateAsync(payment);

        // 3. Create enrollment atomically with the payment reference
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
