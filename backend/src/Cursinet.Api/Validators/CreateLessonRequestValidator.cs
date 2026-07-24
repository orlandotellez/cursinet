using Cursinet.Application.Common.Models;
using FluentValidation;

namespace Cursinet.Api.Validators;

public class CreateLessonRequestValidator : AbstractValidator<CreateLessonRequest>
{
    public CreateLessonRequestValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Title is required")
            .MaximumLength(200).WithMessage("Title must not exceed 200 characters");

        RuleFor(x => x.Type)
            .IsInEnum().WithMessage("Invalid lesson type");

        When(x => x.VideoDurationSeconds.HasValue, () =>
        {
            RuleFor(x => x.VideoDurationSeconds!)
                .GreaterThanOrEqualTo(0).WithMessage("Video duration must be greater than or equal to 0");
        });
    }
}
