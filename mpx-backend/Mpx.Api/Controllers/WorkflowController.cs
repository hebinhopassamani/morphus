using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using Mpx.Domain.Entities;
using Mpx.Domain.Enums;
using Mpx.Infrastructure.Data.Core;
using Mpx.Infrastructure.Interfaces;

namespace Mpx.Api.Controllers;

[ApiController]
[Route("api/v1/workflow")]
[Authorize]
public class WorkflowController(MpxDbContext dbContext, ITenantProvider tenantProvider) : ControllerBase
{
  [HttpGet("studio")]
  public async Task<IActionResult> GetStudioBootstrapAsync()
  {
    var corpId = tenantProvider.GetCorporationId();

    var triggerTypes = await dbContext.WorkflowTriggerTypes
        .IgnoreQueryFilters()
        .AsNoTracking()
        .Where(t => (t.CorporationId == null || t.CorporationId == corpId) && !t.Inactive)
        .OrderBy(t => t.Order)
        .ToListAsync();

    var stationTypes = await dbContext.WorkflowStationTypes
        .IgnoreQueryFilters()
        .AsNoTracking()
        .Where(t => (t.CorporationId == null || t.CorporationId == corpId) && !t.Inactive)
        .OrderBy(t => t.Order)
        .ToListAsync();

    var routes = await dbContext.Routes
        .IgnoreQueryFilters()
        .AsNoTracking()
        .Where(r => (r.CorporationId == null || r.CorporationId == corpId) && !r.Inactive)
        .OrderBy(r => r.Order)
        .ThenBy(r => r.Path)
        .ToListAsync();

    var errorSeverities = await dbContext.ErrorSeverities
        .IgnoreQueryFilters()
        .AsNoTracking()
        .Where(s => (s.CorporationId == null || s.CorporationId == corpId) && !s.Inactive)
        .OrderBy(s => s.Order)
        .ToListAsync();

    var errorStates = await dbContext.ErrorStates
        .IgnoreQueryFilters()
        .AsNoTracking()
        .Where(s => (s.CorporationId == null || s.CorporationId == corpId) && !s.Inactive)
        .OrderBy(s => s.Order)
        .ToListAsync();

    var errorCodes = await dbContext.ErrorCodes
        .AsNoTracking()
        .Include(c => c.Severity)
        .Where(c => !c.Inactive)
        .OrderBy(c => c.Code)
        .ToListAsync();

    var errors = await dbContext.Errors
        .AsNoTracking()
        .Include(e => e.ErrorCode)
          .ThenInclude(c => c!.Severity)
        .Include(e => e.ErrorState)
        .OrderByDescending(e => e.CreatedAt)
        .Take(50)
        .ToListAsync();

    var entityDefinitions = await dbContext.EntityDefinitions
        .IgnoreQueryFilters()
        .AsNoTracking()
        .Include(e => e.Properties.OrderBy(p => p.Order))
        .Where(e => (e.CorporationId == null || e.CorporationId == corpId) && !e.Inactive)
        .OrderBy(e => e.ModuleName)
        .ThenBy(e => e.Name)
        .Select(e => new
        {
          e.Id,
          e.Key,
          e.Name,
          e.TableName,
          e.Label,
          e.PluralLabel,
          e.ModuleName,
          e.Icon,
          Properties = e.Properties.Select(p => new
          {
            p.Id,
            p.Name,
            p.Label,
            p.DataType,
            p.DefaultControlType,
            p.IsPrimaryKey,
            p.IsForeignKey,
            p.TargetEntityDefinitionId
          }).ToList()
        })
        .ToListAsync();

    var stations = await dbContext.Stations
        .AsNoTracking()
        .Include(s => s.StationType)
        .Where(s => !s.Inactive)
        .OrderBy(s => s.StationType != null ? s.StationType.Order : 99)
        .ThenBy(s => s.Name)
        .ToListAsync();

    var workflowTypes = await dbContext.WorkflowTypes
        .AsNoTracking()
        .Include(w => w.TriggerTypeDefinition)
        .Include(w => w.TriggerRoute)
        .Include(w => w.Contexts.OrderBy(c => c.Order))
          .ThenInclude(c => c.EntityDefinition)
        .Include(w => w.Configs.OrderBy(c => c.Order))
          .ThenInclude(c => c.Station)
            .ThenInclude(s => s!.StationType)
        .Include(w => w.Configs)
          .ThenInclude(c => c.Actions.OrderBy(a => a.Order))
        .Include(w => w.Configs)
          .ThenInclude(c => c.Conditions.OrderBy(cd => cd.Order))
        .Where(w => !w.Inactive)
        .OrderBy(w => w.Name == "SignIn" ? 0 : w.Name == "SignUp" ? 1 : w.Name == "ForgotPassword" ? 2 : 3)
        .ThenBy(w => w.Name)
        .ToListAsync();

    return Ok(new
    {
      triggerTypes,
      stationTypes,
      routes,
      errorSeverities,
      errorStates,
      errorCodes,
      errors,
      entityDefinitions,
      stations,
      workflowTypes
    });
  }

  public record CreateWorkflowTypeDto(
      string Name,
      string? Description,
      Guid? TriggerTypeId,
      Guid? TriggerRouteId,
      string? TriggerEvent,
      Guid? RootEntityDefinitionId);

  [HttpPost("types")]
  public async Task<IActionResult> CreateWorkflowTypeAsync([FromBody] CreateWorkflowTypeDto dto)
  {
    var corpId = tenantProvider.GetCorporationId();

    var triggerType = dto.TriggerTypeId.HasValue
        ? await dbContext.WorkflowTriggerTypes.IgnoreQueryFilters().FirstOrDefaultAsync(t => t.Id == dto.TriggerTypeId.Value)
        : await dbContext.WorkflowTriggerTypes.IgnoreQueryFilters().FirstOrDefaultAsync(t => t.Code == WkfTriggerTypeEnum.HtmlAction);

    var rootEntity = dto.RootEntityDefinitionId.HasValue
        ? await dbContext.EntityDefinitions.IgnoreQueryFilters().FirstOrDefaultAsync(e => e.Id == dto.RootEntityDefinitionId.Value)
        : null;

    var wkfType = new WkfType
    {
      Id = Guid.CreateVersion7(),
      CorporationId = corpId,
      Name = string.IsNullOrWhiteSpace(dto.Name) ? "Novo Fluxo" : dto.Name.Trim(),
      Description = dto.Description,
      TriggerTypeId = triggerType?.Id,
      TriggerRouteId = dto.TriggerRouteId,
      TriggerType = triggerType?.Name ?? "HtmlAction",
      TriggerEvent = string.IsNullOrWhiteSpace(dto.TriggerEvent) ? "OnScreenLoad" : dto.TriggerEvent,
      RootEntityDefinitionId = rootEntity?.Id,
      EntityName = rootEntity?.Name,
      Icon = "workflow",
      Color = "#3b82f6"
    };

    dbContext.WorkflowTypes.Add(wkfType);

    if (rootEntity is not null)
    {
      dbContext.WorkflowTypeContexts.Add(new WkfTypeContext
      {
        Id = Guid.CreateVersion7(),
        CorporationId = corpId,
        WorkflowTypeId = wkfType.Id,
        EntityDefinitionId = rootEntity.Id,
        Alias = rootEntity.Name,
        IsRootEntity = true,
        Order = 1,
        Description = $"Entidade raiz ({rootEntity.Label}) do Contexto / Grupo de Dados."
      });
    }

    // Todo fluxo já nasce obrigatoriamente com a caixinha isolada Error no canto!
    var errorStation = await dbContext.Stations
        .Include(s => s.StationType)
        .FirstOrDefaultAsync(s => s.Code == "Error" || (s.StationType != null && s.StationType.Code == WkfStationTypeEnum.Error));

    if (errorStation is not null)
    {
      dbContext.WorkflowTypeConfigs.Add(new WkfTypeConfig
      {
        Id = Guid.CreateVersion7(),
        CorporationId = corpId,
        WorkflowTypeId = wkfType.Id,
        StationId = errorStation.Id,
        Name = "Error",
        Order = 99,
        PositionX = 1120,
        PositionY = 40,
        IsIsolatedErrorCatcher = true,
        Icon = "octagon-alert",
        Color = "#ef4444",
        Description = "Se alguma etapa do fluxo apresentar algum erro ele vai ser jogado para este local, e aqui dentro você saberá exatamente de onde veio e o motivo do fluxo ter vindo para cá."
      });
    }

    await dbContext.SaveChangesAsync();
    return Ok(new { wkfType.Id, wkfType.Key, wkfType.Name });
  }

  public record UpdateTriggerDto(Guid TriggerTypeId, Guid? TriggerRouteId, string? TriggerEvent);

  [HttpPut("types/{id:guid}/trigger")]
  public async Task<IActionResult> UpdateTriggerAsync(Guid id, [FromBody] UpdateTriggerDto dto)
  {
    var wkf = await dbContext.WorkflowTypes.FirstOrDefaultAsync(w => w.Id == id);
    if (wkf is null)
      return NotFound();

    var triggerType = await dbContext.WorkflowTriggerTypes.IgnoreQueryFilters()
        .FirstOrDefaultAsync(t => t.Id == dto.TriggerTypeId);

    wkf.TriggerTypeId = dto.TriggerTypeId;
    wkf.TriggerRouteId = dto.TriggerRouteId;
    wkf.TriggerType = triggerType?.Name ?? wkf.TriggerType;
    wkf.TriggerEvent = dto.TriggerEvent;

    await dbContext.SaveChangesAsync();
    return Ok(wkf);
  }

  public record AddContextEntityDto(Guid EntityDefinitionId, string Alias, bool IsCollection, bool IsRootEntity);

  [HttpPost("types/{id:guid}/contexts")]
  public async Task<IActionResult> AddContextEntityAsync(Guid id, [FromBody] AddContextEntityDto dto)
  {
    var corpId = tenantProvider.GetCorporationId();
    var entityDef = await dbContext.EntityDefinitions.IgnoreQueryFilters()
        .FirstOrDefaultAsync(e => e.Id == dto.EntityDefinitionId);
    if (entityDef is null)
      return BadRequest("Entidade não encontrada no catálogo .Reflected.");

    var count = await dbContext.WorkflowTypeContexts.CountAsync(c => c.WorkflowTypeId == id);

    var ctx = new WkfTypeContext
    {
      Id = Guid.CreateVersion7(),
      CorporationId = corpId,
      WorkflowTypeId = id,
      EntityDefinitionId = entityDef.Id,
      Alias = string.IsNullOrWhiteSpace(dto.Alias) ? entityDef.Name : dto.Alias.Trim(),
      IsCollection = dto.IsCollection,
      IsRootEntity = dto.IsRootEntity || count == 0,
      Order = count + 1,
      Description = $"Objeto {entityDef.Label} no Contexto / Grupo de Dados."
    };

    dbContext.WorkflowTypeContexts.Add(ctx);
    await dbContext.SaveChangesAsync();
    return Ok(ctx);
  }

  [HttpDelete("contexts/{contextId:guid}")]
  public async Task<IActionResult> RemoveContextEntityAsync(Guid contextId)
  {
    var ctx = await dbContext.WorkflowTypeContexts.FirstOrDefaultAsync(c => c.Id == contextId);
    if (ctx is null)
      return NotFound();

    dbContext.WorkflowTypeContexts.Remove(ctx);
    await dbContext.SaveChangesAsync();
    return NoContent();
  }

  public record AddStationConfigDto(
      Guid StationId,
      string Name,
      double PositionX,
      double PositionY,
      Guid? TargetSubWorkflowTypeId,
      Guid? ReturnInputConfigId,
      Guid? TargetRouteId,
      int? SlaMinutes,
      string? Description);

  [HttpPost("types/{id:guid}/configs")]
  public async Task<IActionResult> AddStationConfigAsync(Guid id, [FromBody] AddStationConfigDto dto)
  {
    var corpId = tenantProvider.GetCorporationId();
    var station = await dbContext.Stations
        .Include(s => s.StationType)
        .FirstOrDefaultAsync(s => s.Id == dto.StationId);
    if (station is null)
      return BadRequest("Estação inválida.");

    var count = await dbContext.WorkflowTypeConfigs.CountAsync(c => c.WorkflowTypeId == id && !c.IsIsolatedErrorCatcher);

    var cfg = new WkfTypeConfig
    {
      Id = Guid.CreateVersion7(),
      CorporationId = corpId,
      WorkflowTypeId = id,
      StationId = station.Id,
      Name = string.IsNullOrWhiteSpace(dto.Name) ? station.Name : dto.Name.Trim(),
      Order = count + 1,
      PositionX = dto.PositionX,
      PositionY = dto.PositionY,
      HasLayout = station.HasLayout,
      TargetSubWorkflowTypeId = dto.TargetSubWorkflowTypeId,
      ReturnInputConfigId = dto.ReturnInputConfigId,
      TargetRouteId = dto.TargetRouteId,
      SlaMinutes = dto.SlaMinutes,
      IsIsolatedErrorCatcher = station.StationType?.IsIsolatedErrorCatcher ?? false,
      Icon = station.Icon,
      Color = station.Color,
      Description = string.IsNullOrWhiteSpace(dto.Description) ? station.Description : dto.Description
    };

    dbContext.WorkflowTypeConfigs.Add(cfg);
    await dbContext.SaveChangesAsync();
    return Ok(cfg);
  }

  public record UpdateConfigPositionDto(double PositionX, double PositionY);

  [HttpPut("configs/{configId:guid}/position")]
  public async Task<IActionResult> UpdateConfigPositionAsync(Guid configId, [FromBody] UpdateConfigPositionDto dto)
  {
    var cfg = await dbContext.WorkflowTypeConfigs.FirstOrDefaultAsync(c => c.Id == configId);
    if (cfg is null)
      return NotFound();

    cfg.PositionX = dto.PositionX;
    cfg.PositionY = dto.PositionY;
    await dbContext.SaveChangesAsync();
    return Ok(new { cfg.Id, cfg.PositionX, cfg.PositionY });
  }

  [HttpDelete("configs/{configId:guid}")]
  public async Task<IActionResult> DeleteStationConfigAsync(Guid configId)
  {
    var cfg = await dbContext.WorkflowTypeConfigs.FirstOrDefaultAsync(c => c.Id == configId);
    if (cfg is null)
      return NotFound();
    if (cfg.IsIsolatedErrorCatcher)
      return BadRequest("A estação Error isolada é obrigatória em todo fluxo e não pode ser removida.");

    var incomingActions = await dbContext.WorkflowTypeConfigActions
        .Where(a => a.WorkflowTypeConfigId == configId || a.NextWorkflowTypeConfigId == configId)
        .ToListAsync();
    dbContext.WorkflowTypeConfigActions.RemoveRange(incomingActions);

    var incomingConditions = await dbContext.WorkflowTypeConfigConditions
        .Where(c => c.WorkflowTypeConfigId == configId || c.NextWorkflowTypeConfigId == configId || c.ElseNextWorkflowTypeConfigId == configId)
        .ToListAsync();
    dbContext.WorkflowTypeConfigConditions.RemoveRange(incomingConditions);

    dbContext.WorkflowTypeConfigs.Remove(cfg);
    await dbContext.SaveChangesAsync();
    return NoContent();
  }

  public record AddConfigActionDto(
      string Name,
      string Label,
      string ControlType,
      string ExecuteWhen,
      Guid? NextWorkflowTypeConfigId,
      bool IsAutomatic);

  [HttpPost("configs/{configId:guid}/actions")]
  public async Task<IActionResult> AddConfigActionAsync(Guid configId, [FromBody] AddConfigActionDto dto)
  {
    var corpId = tenantProvider.GetCorporationId();
    var count = await dbContext.WorkflowTypeConfigActions.CountAsync(a => a.WorkflowTypeConfigId == configId);

    var action = new WkfTypeConfigAction
    {
      Id = Guid.CreateVersion7(),
      CorporationId = corpId,
      WorkflowTypeConfigId = configId,
      NextWorkflowTypeConfigId = dto.NextWorkflowTypeConfigId,
      Name = string.IsNullOrWhiteSpace(dto.Name) ? $"Action_{count + 1}" : dto.Name.Trim(),
      Label = string.IsNullOrWhiteSpace(dto.Label) ? "Avançar" : dto.Label.Trim(),
      ControlType = string.IsNullOrWhiteSpace(dto.ControlType) ? "Button" : dto.ControlType,
      ExecuteWhen = string.IsNullOrWhiteSpace(dto.ExecuteWhen) ? "OnClick" : dto.ExecuteWhen,
      IsAutomatic = dto.IsAutomatic,
      Order = count + 1,
      Icon = "arrow-right",
      Color = "#3b82f6"
    };

    dbContext.WorkflowTypeConfigActions.Add(action);
    await dbContext.SaveChangesAsync();
    return Ok(action);
  }

  public record SimulateWorkflowErrorDto(Guid OriginConfigId, Guid ErrorCodeId, string? CustomExceptionMessage);

  [HttpPost("types/{id:guid}/simulate-error")]
  public async Task<IActionResult> SimulateWorkflowErrorAsync(Guid id, [FromBody] SimulateWorkflowErrorDto dto)
  {
    var corpId = tenantProvider.GetCorporationId();
    var errorCode = await dbContext.ErrorCodes
        .Include(c => c.Severity)
        .FirstOrDefaultAsync(c => c.Id == dto.ErrorCodeId);
    if (errorCode is null)
      return BadRequest("Código de erro não encontrado.");

    var openState = await dbContext.ErrorStates.IgnoreQueryFilters()
        .FirstOrDefaultAsync(s => s.Code == MpxErrorStateEnum.Open);
    if (openState is null)
      return BadRequest("Estado de erro inicial não encontrado.");

    var originConfig = await dbContext.WorkflowTypeConfigs
        .Include(c => c.Station)
        .FirstOrDefaultAsync(c => c.Id == dto.OriginConfigId);

    var contexts = await dbContext.WorkflowTypeContexts
        .Include(c => c.EntityDefinition)
        .Where(c => c.WorkflowTypeId == id)
        .ToListAsync();

    var userSnapshotObj = new
    {
      CapturedAtUtc = DateTime.UtcNow,
      UserName = User.Identity?.Name ?? "arquiteto@morphus.one",
      CorporationId = corpId,
      RolesAtErrorMoment = User.Claims.Where(c => c.Type.EndsWith("role", StringComparison.OrdinalIgnoreCase)).Select(c => c.Value).ToList(),
      ClaimsAtErrorMoment = User.Claims.Select(c => new { c.Type, c.Value }).Take(12).ToList()
    };

    var contextSnapshotObj = new
    {
      CapturedAtUtc = DateTime.UtcNow,
      WorkflowTypeId = id,
      OriginStationName = originConfig?.Name ?? "Estação Desconhecida",
      ContextEntitiesInTransit = contexts.Select(c => new
      {
        c.Alias,
        Entity = c.EntityDefinition?.Name,
        c.IsRootEntity,
        c.IsCollection,
        SamplePayload = new { Id = Guid.CreateVersion7(), Status = "InTransitWhenErrorOccurred", Timestamp = DateTime.UtcNow }
      }).ToList()
    };

    var mpxError = new MpxError
    {
      Id = Guid.CreateVersion7(),
      CorporationId = corpId,
      ErrorCodeId = errorCode.Id,
      ErrorStateId = openState.Id,
      WorkflowTypeId = id,
      OriginConfigId = originConfig?.Id,
      Method = originConfig?.Station?.ProcessHandlerKey ?? $"WorkflowEngine.ExecuteStation({originConfig?.Name ?? "Station"})",
      Message = string.IsNullOrWhiteSpace(dto.CustomExceptionMessage)
          ? $"System.InvalidOperationException: Falha capturada na estação '{originConfig?.Name}' [{errorCode.Code} - {errorCode.Name}]\n   at Mpx.Application.Handlers.WorkflowEngine.ExecuteStepAsync(Guid configId) in WorkflowEngine.cs:line 142"
          : dto.CustomExceptionMessage,
      UserMessage = errorCode.FriendlyMessage,
      UserSnapshot = JsonSerializer.Serialize(userSnapshotObj, new JsonSerializerOptions { WriteIndented = true }),
      ContextSnapshot = JsonSerializer.Serialize(contextSnapshotObj, new JsonSerializerOptions { WriteIndented = true })
    };

    dbContext.Errors.Add(mpxError);
    await dbContext.SaveChangesAsync();

    return Ok(mpxError);
  }
}
