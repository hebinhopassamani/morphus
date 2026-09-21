using Morphus.Application.MorphusValidator;
using Morphus.Domain.Entities.Models;

namespace Morphus.Application.Validators;

public interface IUserValidator : IMorphusValidator<User>
{
  Task ValidateDeleteEntity(Guid id);
}
