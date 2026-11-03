using Microsoft.AspNetCore.Http;
using Mpx.Application.MorphusValidator;
using Mpx.Domain.Entities;
using Mpx.Domain.Interfaces;

namespace Mpx.Application.Validators;

public class WorkspaceValidator(
    IWorkspaceRepository workspaceRepository,
    IHttpContextAccessor httpContext)
    : MorphusValidator<Workspace>(httpContext), IWorkspaceValidator
{
  public Task ValidateWorkspace(Workspace workspace)
  {
    if (string.IsNullOrWhiteSpace(workspace.Name))
      AddErrorMessage("O nome do workspace é obrigatório.");

    if (string.IsNullOrWhiteSpace(workspace.Key) || workspace.Key.Trim().Length != 12)
      AddErrorMessage("A chave de identificação (Key) do workspace deve possuir exatamente 12 caracteres.");

    if (string.IsNullOrWhiteSpace(workspace.Icon))
      workspace.Icon = "layout-grid";

    return Task.CompletedTask;
  }

  public async Task ValidateDeleteWorkspace(Guid id)
  {
    var existing = await workspaceRepository.GetByIdAsync(id);
    if (existing is null)
    {
      AddErrorMessage("O workspace informado não foi encontrado.");
      return;
    }

    if (existing.System)
    {
      AddErrorMessage("Não é permitido excluir o workspace padrão do sistema.");
    }
  }
}
