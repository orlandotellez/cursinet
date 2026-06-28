using Cursinet.Application.Common.Models;
using FluentValidation;

namespace Cursinet.Api.Validators;

public class UpdateCourseRequestValidator : AbstractValidator<UpdateCourseRequest>
{
    public UpdateCourseRequestValidator()
    {
        When(x => x.Title is not null, () =>
        {
            RuleFor(x => x.Title!)
                .NotEmpty().WithMessage("Title cannot be empty")
                .MaximumLength(200).WithMessage("Title must not exceed 200 characters");
        });

        When(x => x.Price is not null, () =>
        {
            RuleFor(x => x.Price!)
                .GreaterThanOrEqualTo(0).WithMessage("Price must be greater than or equal to 0");
        });

        When(x => x.OriginalPrice is not null, () =>
        {
            RuleFor(x => x.OriginalPrice!)
                .GreaterThanOrEqualTo(0).WithMessage("Original price must be greater than or equal to 0");
        });

        When(x => x.DurationMinutes is not null, () =>
        {
            RuleFor(x => x.DurationMinutes!)
                .GreaterThanOrEqualTo(0).WithMessage("Duration must be greater than or equal to 0");
        });

        When(x => x.Level is not null, () =>
        {
            RuleFor(x => x.Level!.Value)
                .IsInEnum().WithMessage("Invalid course level");
        });

        When(x => x.Language is not null, () =>
        {
            RuleFor(x => x.Language!)
                .NotEmpty().WithMessage("Language cannot be empty")
                .MaximumLength(10).WithMessage("Language code must not exceed 10 characters");
        });

        When(x => x.ShortDescription is not null, () =>
        {
            RuleFor(x => x.ShortDescription!)
                .MaximumLength(500).WithMessage("Short description must not exceed 500 characters");
        });
    }
}
