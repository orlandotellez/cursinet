using Cursinet.Api.Controllers;
using FluentValidation;

namespace Cursinet.Api.Validators;

public class UpdateReviewRequestValidator : AbstractValidator<UpdateReviewRequest>
{
    public UpdateReviewRequestValidator()
    {
        RuleFor(x => x.Rating)
            .InclusiveBetween(1, 5).WithMessage("Rating must be between 1 and 5");

        When(x => x.Comment is not null, () =>
        {
            RuleFor(x => x.Comment!)
                .NotEmpty().WithMessage("Comment cannot be empty when provided")
                .MaximumLength(2000).WithMessage("Comment must not exceed 2000 characters");
        });
    }
}
