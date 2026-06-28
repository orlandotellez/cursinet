using Cursinet.Application.Common.Models;
using FluentValidation;

namespace Cursinet.Api.Validators;

public class UpsertProgressRequestValidator : AbstractValidator<UpsertProgressRequest>
{
    public UpsertProgressRequestValidator()
    {
        RuleFor(x => x.WatchedSeconds)
            .GreaterThanOrEqualTo(0).WithMessage("Watched seconds must be greater than or equal to 0");

        RuleFor(x => x.LastPositionSeconds)
            .GreaterThanOrEqualTo(0).WithMessage("Last position seconds must be greater than or equal to 0");
    }
}
