using Cursinet.Api.Controllers;
using FluentValidation;

namespace Cursinet.Api.Validators;

public class CreateCommentRequestValidator : AbstractValidator<CreateCommentRequest>
{
    public CreateCommentRequestValidator()
    {
        RuleFor(x => x.Body)
            .NotEmpty().WithMessage("Comment body is required")
            .MaximumLength(5000).WithMessage("Comment must not exceed 5000 characters");
    }
}
