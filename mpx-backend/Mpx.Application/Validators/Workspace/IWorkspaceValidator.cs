using Mpx.Application.MorphusValidator;
using Mpx.Domain.Entities;

namespace Mpx.Application.Validators;

public interface IWorkspaceValidator : IMorphusValidator<Workspace>
{
  Task ValidateWorkspace(Workspace workspace);
  Task ValidateDeleteWorkspace(Guid id);
}
