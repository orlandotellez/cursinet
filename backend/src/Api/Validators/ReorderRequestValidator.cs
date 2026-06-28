using Cursinet.Application.Common.Models;
using FluentValidation;

namespace Cursinet.Api.Validators;

public class ReorderRequestValidator : AbstractValidator<ReorderRequest>
{
    public ReorderRequestValidator()
    {
        RuleFor(x => x.Items)
            .NotEmpty().WithMessage("Reorder items list is required");

        RuleForEach(x => x.Items)
            .ChildRules(item =>
            {
                item.RuleFor(x => x.Id)
                    .NotEmpty().WithMessage("Item ID is required");

                item.RuleFor(x => x.SortOrder)
                    .GreaterThanOrEqualTo(0).WithMessage("Sort order must be greater than or equal to 0");
            });
    }
}
