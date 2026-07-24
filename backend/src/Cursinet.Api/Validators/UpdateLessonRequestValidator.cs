using Cursinet.Application.Common.Models;
using FluentValidation;

namespace Cursinet.Api.Validators;

public class UpdateLessonRequestValidator : AbstractValidator<UpdateLessonRequest>
{
    public UpdateLessonRequestValidator()
    {
        When(x => x.Title is not null, () =>
        {
            RuleFor(x => x.Title!)
                .NotEmpty().WithMessage("Title cannot be empty")
                .MaximumLength(200).WithMessage("Title must not exceed 200 characters");
        });

        When(x => x.Type is not null, () =>
        {
            RuleFor(x => x.Type!.Value)
                .IsInEnum().WithMessage("Invalid lesson type");
        });

        When(x => x.VideoDurationSeconds.HasValue, () =>
        {
            RuleFor(x => x.VideoDurationSeconds!)
                .GreaterThanOrEqualTo(0).WithMessage("Video duration must be greater than or equal to 0");
        });
    }
}
