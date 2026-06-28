using Cursinet.Api.Controllers;
using FluentValidation;

namespace Cursinet.Api.Validators;

public class AddBookmarkRequestValidator : AbstractValidator<AddBookmarkRequest>
{
    public AddBookmarkRequestValidator()
    {
        RuleFor(x => x.CourseId)
            .NotEmpty().WithMessage("Course ID is required");
    }
}
