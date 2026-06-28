using Cursinet.Application.Common.Models;
using FluentValidation;

namespace Cursinet.Api.Validators;

public class EnrollmentRequestValidator : AbstractValidator<EnrollmentRequest>
{
    public EnrollmentRequestValidator()
    {
        RuleFor(x => x.CourseId)
            .NotEmpty().WithMessage("Course ID is required");
    }
}
