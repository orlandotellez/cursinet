using Cursinet.Application.Common.Models;
using FluentValidation;

namespace Cursinet.Api.Validators;

public class UpdateModuleRequestValidator : AbstractValidator<UpdateModuleRequest>
{
    public UpdateModuleRequestValidator()
    {
        When(x => x.Title is not null, () =>
        {
            RuleFor(x => x.Title!)
                .NotEmpty().WithMessage("Title cannot be empty")
                .MaximumLength(200).WithMessage("Title must not exceed 200 characters");
        });
    }
}
