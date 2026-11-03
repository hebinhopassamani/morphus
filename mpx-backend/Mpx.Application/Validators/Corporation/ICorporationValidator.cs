using Mpx.Application.MorphusValidator;
using Mpx.Domain.Entities;

namespace Mpx.Application.Validators;

public interface ICorporationValidator : IMorphusValidator<Corporation>
{
  Task ValidateCorporation(Corporation corporation);
  Task ValidateDeleteCorporation(Guid id);
}
