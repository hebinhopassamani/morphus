using Mpx.Core.Validators;
using Mpx.Domain.Entities;

namespace Mpx.Application.Validators;

public interface ICorporationValidator : IMpxValidator<Corporation>
{
  Task ValidateCorporation(Corporation corporation);
  Task ValidateDeleteCorporation(Guid id);
}
