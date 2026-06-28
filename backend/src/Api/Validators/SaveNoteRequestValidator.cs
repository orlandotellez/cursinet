using Cursinet.Api.Controllers;
using FluentValidation;

namespace Cursinet.Api.Validators;

public class SaveNoteRequestValidator : AbstractValidator<SaveNoteRequest>
{
    public SaveNoteRequestValidator()
    {
        RuleFor(x => x.Content)
            .NotEmpty().WithMessage("Note content is required")
            .MaximumLength(10000).WithMessage("Note must not exceed 10000 characters");
    }
}
