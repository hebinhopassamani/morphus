using Mpx.Core.Validators;
using Mpx.Domain.Entities;

namespace Mpx.Application.Validators;

public interface IWorkspaceValidator : IMpxValidator<Workspace>
{
  Task ValidateWorkspace(Workspace workspace);
  Task ValidateDeleteWorkspace(Guid id);
}
