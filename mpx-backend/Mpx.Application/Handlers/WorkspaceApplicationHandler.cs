using Microsoft.Extensions.Configuration;
using mpx.Domain.Interfaces;
using Mpx.Domain.Entities;
using Mpx.Domain.Interfaces;

namespace Mpx.Application.Handlers;

public class WorkspaceApplicationHandler(
    IWorkspaceApplicationRepository workspaceApplicationRepository,
    IUnitOfWork unitOfWork,
    IConfiguration configuration)
{
  private int GetDefaultTrialDays() =>
      int.TryParse(configuration["TrialSettings:DefaultDays"], out var days) && days > 0 ? days : 14;

  public Task<List<MorphusApplication>> GetEntitiesToRelateAsync(Guid workspaceId) =>
      workspaceApplicationRepository.GetEntitiesToRelateAsync(workspaceId);

  public Task<List<WorkspaceApplication>> GetRelatedEntitiesAsync(Guid workspaceId) =>
      workspaceApplicationRepository.GetRelatedEntitiesAsync(workspaceId);

  public async Task<WorkspaceApplication> AddRelationshipAsync(WorkspaceApplication workspaceApplication)
  {
    var defaultDays = GetDefaultTrialDays();
    var priorTrial = await workspaceApplicationRepository.GetTrialHistoryByApplicationAsync(workspaceApplication.ApplicationId);
    var existing = await workspaceApplicationRepository.GetByKeysAsync(
        workspaceApplication.WorkspaceId,
        workspaceApplication.ApplicationId);

    if (existing is not null)
    {
      existing.Inactive = false;
      existing.TrialStartDate ??= priorTrial?.TrialStartDate ?? workspaceApplication.TrialStartDate ?? DateTime.UtcNow;
      existing.TrialDays ??= priorTrial?.TrialDays ?? workspaceApplication.TrialDays ?? defaultDays;
      existing.TrialUsed = true;
      existing.SharedWithWorkspaceId = workspaceApplication.SharedWithWorkspaceId;
      workspaceApplicationRepository.Update(existing);
      await unitOfWork.SaveChangesAsync();
      return existing;
    }

    workspaceApplication.TrialStartDate = priorTrial?.TrialStartDate ?? workspaceApplication.TrialStartDate ?? DateTime.UtcNow;
    workspaceApplication.TrialDays = priorTrial?.TrialDays ?? workspaceApplication.TrialDays ?? defaultDays;
    workspaceApplication.TrialUsed = true;

    await workspaceApplicationRepository.AddRelationshipAsync(workspaceApplication);
    await unitOfWork.SaveChangesAsync();
    return workspaceApplication;
  }

  public async Task<List<WorkspaceApplication>> AddRelationshipsAsync(List<WorkspaceApplication> items)
  {
    var defaultDays = GetDefaultTrialDays();
    var added = new List<WorkspaceApplication>();
    foreach (var item in items)
    {
      var priorTrial = await workspaceApplicationRepository.GetTrialHistoryByApplicationAsync(item.ApplicationId);
      var existing = await workspaceApplicationRepository.GetByKeysAsync(item.WorkspaceId, item.ApplicationId);
      if (existing is null)
      {
        item.TrialStartDate = priorTrial?.TrialStartDate ?? item.TrialStartDate ?? DateTime.UtcNow;
        item.TrialDays = priorTrial?.TrialDays ?? item.TrialDays ?? defaultDays;
        item.TrialUsed = true;
        await workspaceApplicationRepository.AddRelationshipAsync(item);
        added.Add(item);
      }
      else if (existing.Inactive)
      {
        existing.Inactive = false;
        existing.TrialStartDate ??= priorTrial?.TrialStartDate ?? DateTime.UtcNow;
        existing.TrialDays ??= priorTrial?.TrialDays ?? defaultDays;
        existing.TrialUsed = true;
        existing.SharedWithWorkspaceId = item.SharedWithWorkspaceId;
        workspaceApplicationRepository.Update(existing);
        added.Add(existing);
      }
    }
    if (added.Count > 0)
      await unitOfWork.SaveChangesAsync();

    return added;
  }

  public async Task<WorkspaceApplication> StartTrialAsync(WorkspaceApplication request)
  {
    var defaultDays = GetDefaultTrialDays();
    var priorTrial = await workspaceApplicationRepository.GetTrialHistoryByApplicationAsync(request.ApplicationId);

    var existing = await workspaceApplicationRepository.GetByKeysAsync(
        request.WorkspaceId,
        request.ApplicationId);

    if (existing is not null)
    {
      existing.Inactive = false;
      existing.TrialStartDate ??= priorTrial?.TrialStartDate ?? DateTime.UtcNow;
      existing.TrialDays = request.TrialDays is > 0 ? request.TrialDays : (existing.TrialDays ?? priorTrial?.TrialDays ?? defaultDays);
      existing.TrialUsed = true;
      existing.SharedWithWorkspaceId = request.SharedWithWorkspaceId;
      workspaceApplicationRepository.Update(existing);
      await unitOfWork.SaveChangesAsync();
      return existing;
    }

    request.Inactive = false;
    request.TrialStartDate = priorTrial?.TrialStartDate ?? DateTime.UtcNow;
    request.TrialDays = request.TrialDays is > 0 ? request.TrialDays : (priorTrial?.TrialDays ?? defaultDays);
    request.TrialUsed = true;
    await workspaceApplicationRepository.AddRelationshipAsync(request);
    await unitOfWork.SaveChangesAsync();
    return request;
  }

  public async Task<WorkspaceApplication> RemoveRelationshipAsync(WorkspaceApplication workspaceApplication)
  {
    var existing = await workspaceApplicationRepository.GetByKeysAsync(
        workspaceApplication.WorkspaceId,
        workspaceApplication.ApplicationId)
        ?? throw new KeyNotFoundException("Vínculo entre workspace e aplicação não encontrado.");

    if (existing.System)
      throw new InvalidOperationException("Não é permitido remover uma aplicação nativa do sistema.");

    // Se já utilizou o teste grátis, apenas inativa para preservar o histórico de TrialUsed = true
    if (existing.TrialUsed || existing.TrialStartDate is not null)
    {
      existing.Inactive = true;
      existing.TrialUsed = true;
      workspaceApplicationRepository.Update(existing);
      await unitOfWork.SaveChangesAsync();
      return existing;
    }

    workspaceApplicationRepository.RemoveRelationship(existing);
    await unitOfWork.SaveChangesAsync();
    return existing;
  }

  public async Task<int> RemoveRelationshipsAsync(List<WorkspaceApplication> items)
  {
    var removedCount = 0;
    foreach (var item in items)
    {
      var existing = await workspaceApplicationRepository.GetByKeysAsync(item.WorkspaceId, item.ApplicationId);
      if (existing is not null && !existing.System)
      {
        if (existing.TrialUsed || existing.TrialStartDate is not null)
        {
          existing.Inactive = true;
          existing.TrialUsed = true;
          workspaceApplicationRepository.Update(existing);
        }
        else
        {
          workspaceApplicationRepository.RemoveRelationship(existing);
        }
        removedCount++;
      }
    }
    if (removedCount > 0)
      await unitOfWork.SaveChangesAsync();

    return removedCount;
  }

  public async Task ActivateAsync(WorkspaceApplication workspaceApplication)
  {
    var existing = await workspaceApplicationRepository.GetByKeysAsync(
        workspaceApplication.WorkspaceId,
        workspaceApplication.ApplicationId)
        ?? throw new KeyNotFoundException("Vínculo entre workspace e aplicação não encontrado.");

    existing.Inactive = false;
    workspaceApplicationRepository.Update(existing);
    await unitOfWork.SaveChangesAsync();
  }

  public async Task DeactivateAsync(WorkspaceApplication workspaceApplication)
  {
    var existing = await workspaceApplicationRepository.GetByKeysAsync(
        workspaceApplication.WorkspaceId,
        workspaceApplication.ApplicationId)
        ?? throw new KeyNotFoundException("Vínculo entre workspace e aplicação não encontrado.");

    if (existing.System)
      throw new InvalidOperationException("Não é permitido desativar uma aplicação nativa do sistema.");

    existing.Inactive = true;
    workspaceApplicationRepository.Update(existing);
    await unitOfWork.SaveChangesAsync();
  }
}
