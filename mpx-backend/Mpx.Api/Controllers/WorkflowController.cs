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

    var parameterScopes = await dbContext.ParameterScopes
        .IgnoreQueryFilters()
        .AsNoTracking()
        .Where(s => (s.CorporationId == null || s.CorporationId == corpId) && !s.Inactive)
        .OrderBy(s => s.Order)
        .ToListAsync();

    var parameters = await dbContext.Parameters
        .IgnoreQueryFilters()
        .AsNoTracking()
        .Include(p => p.Scope)
        .Where(p => (p.CorporationId == null || p.CorporationId == corpId) && !p.Inactive)
        .OrderBy(p => p.ScopeCode)
        .ThenBy(p => p.Namespace)
        .ToListAsync();

    var effectiveParameters = BuildEffectiveParametersCascade(parameters);

    var componentTypes = await dbContext.ComponentTypes
        .IgnoreQueryFilters()
        .AsNoTracking()
        .Where(c => (c.CorporationId == null || c.CorporationId == corpId) && !c.Inactive)
        .OrderBy(c => c.Order)
        .ToListAsync();

    var screenComponents = await dbContext.ScreenComponents
        .AsNoTracking()
        .Include(sc => sc.ComponentType)
        .Include(sc => sc.Route)
        .Include(sc => sc.WorkflowType)
        .Include(sc => sc.Station)
        .Include(sc => sc.WorkflowConfig)
        .Include(sc => sc.WorkflowAction)
        .Include(sc => sc.EntityProperty)
        .Where(sc => !sc.Inactive)
        .OrderBy(sc => sc.Order)
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
      workflowTypes,
      parameterScopes,
      parameters,
      effectiveParameters,
      componentTypes,
      screenComponents
    });
  }

  private static Dictionary<string, JsonElement> BuildEffectiveParametersCascade(IEnumerable<MpxParameter> orderedParameters)
  {
    var merged = new Dictionary<string, JsonElement>(StringComparer.OrdinalIgnoreCase);
    var sovereignLockedKeys = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

    foreach (var param in orderedParameters.OrderBy(p => (short)p.ScopeCode))
    {
      if (string.IsNullOrWhiteSpace(param.SettingsJson))
        continue;

      try
      {
        using var doc = JsonDocument.Parse(param.SettingsJson);
        if (doc.RootElement.ValueKind != JsonValueKind.Object)
          continue;

        var isSovereignLayer = param.ScopeCode is MpxParameterScopeEnum.SystemDefault or MpxParameterScopeEnum.Corporation;

        foreach (var prop in doc.RootElement.EnumerateObject())
        {
          // Se uma chave de segurança do Jarbass foi travada pela Camada 1 (Corporation), camadas 2..5 (User/Machine) nunca podem rebaixá-la
          if (!isSovereignLayer && sovereignLockedKeys.Contains(prop.Name))
            continue;

          merged[prop.Name] = prop.Value.Clone();

          if (param.ScopeCode == MpxParameterScopeEnum.Corporation && param.IsLockedBySovereign)
          {
            sovereignLockedKeys.Add(prop.Name);
          }
        }
      }
      catch
      {
        // Ignora JSON malformado individual sem derrubar a cascata
      }
    }

    return merged;
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

  public record UpdateMpxParameterDto(string SettingsJson, string? Name, string? Description);

  [HttpPut("parameters/{id:guid}")]
  public async Task<IActionResult> UpdateParameterLayerAsync(Guid id, [FromBody] UpdateMpxParameterDto dto)
  {
    var corpId = tenantProvider.GetCorporationId();
    var param = await dbContext.Parameters
        .IgnoreQueryFilters()
        .FirstOrDefaultAsync(p => p.Id == id && (p.CorporationId == null || p.CorporationId == corpId));

    if (param is null)
      return NotFound("Camada de parâmetro não encontrada.");

    try
    {
      using var doc = JsonDocument.Parse(dto.SettingsJson);
      if (doc.RootElement.ValueKind != JsonValueKind.Object)
        return BadRequest("O conteúdo de SettingsJson deve ser um objeto JSON válido.");
    }
    catch (JsonException ex)
    {
      return BadRequest($"JSON inválido: {ex.Message}");
    }

    param.SettingsJson = dto.SettingsJson;
    if (!string.IsNullOrWhiteSpace(dto.Name))
      param.Name = dto.Name.Trim();
    if (!string.IsNullOrWhiteSpace(dto.Description))
      param.Description = dto.Description.Trim();

    await dbContext.SaveChangesAsync();

    var allParams = await dbContext.Parameters
        .IgnoreQueryFilters()
        .AsNoTracking()
        .Where(p => (p.CorporationId == null || p.CorporationId == corpId) && !p.Inactive)
        .OrderBy(p => p.ScopeCode)
        .ToListAsync();

    return Ok(new
    {
      updatedParameter = param,
      effectiveParameters = BuildEffectiveParametersCascade(allParams)
    });
  }

  [HttpGet("parameters/export-jarbass")]
  public async Task<IActionResult> ExportJarbassPortableEnvironmentAsync()
  {
    var corpId = tenantProvider.GetCorporationId();
    var allParams = await dbContext.Parameters
        .IgnoreQueryFilters()
        .AsNoTracking()
        .Include(p => p.Scope)
        .Where(p => (p.CorporationId == null || p.CorporationId == corpId) && !p.Inactive)
        .OrderBy(p => p.ScopeCode)
        .ToListAsync();

    // REGRA SOBERANA: NUNCA exportar Camada 0 (SystemDefault) nem Camada 1 (Corporation)!
    // Apenas Camadas 2..5 (Workspace, Application, User, Machine) com IsExportable == true saem no pacote portátil!
    var exportableLayers = allParams
        .Where(p => p.ScopeCode >= MpxParameterScopeEnum.Workspace && p.IsExportable)
        .Select(p =>
        {
          JsonElement parsedSettings;
          try
          {
            parsedSettings = JsonDocument.Parse(p.SettingsJson).RootElement.Clone();
          }
          catch
          {
            parsedSettings = JsonDocument.Parse("{}").RootElement.Clone();
          }

          return new
          {
            scopeCode = (short)p.ScopeCode,
            scopeName = p.ScopeCode.ToString(),
            @namespace = p.Namespace,
            name = p.Name,
            machineKey = p.MachineKey,
            settings = parsedSettings
          };
        })
        .ToList();

    var excludedSovereignLayers = allParams
        .Where(p => p.ScopeCode is MpxParameterScopeEnum.SystemDefault or MpxParameterScopeEnum.Corporation)
        .Select(p => new
        {
          scopeCode = (short)p.ScopeCode,
          scopeName = p.ScopeCode.ToString(),
          @namespace = p.Namespace,
          reason = "Camada Soberana Blindada (Bloqueada contra exportação externa pelo Mpx.Jarbass)"
        })
        .ToList();

    var envelope = new
    {
      format = "MPX_JARBASS_PORTABLE_ENV_V1",
      sealSignature = "MPX_JRB_SEAL_V2::AES256GCM+HMACSHA256::PORTABLE_PROFILE",
      exportedAtUtc = DateTime.UtcNow,
      exportedBy = User.Identity?.Name ?? "arquiteto@morphus.one",
      sovereignProtectionApplied = true,
      excludedSovereignLayers,
      portableLayers = exportableLayers
    };

    return Ok(envelope);
  }

  public record ImportJarbassLayerItemDto(short ScopeCode, string? Namespace, string? Name, string? MachineKey, JsonElement Settings);
  public record ImportJarbassPortableDto(List<ImportJarbassLayerItemDto> PortableLayers);

  [HttpPost("parameters/import-jarbass")]
  public async Task<IActionResult> ImportJarbassPortableEnvironmentAsync([FromBody] ImportJarbassPortableDto dto)
  {
    var corpId = tenantProvider.GetCorporationId();
    if (dto.PortableLayers is null || dto.PortableLayers.Count == 0)
      return BadRequest("Nenhuma camada portátil (2..5) encontrada no pacote JSON enviado ao Jarbass.");

    var existingParams = await dbContext.Parameters
        .IgnoreQueryFilters()
        .Where(p => p.CorporationId == corpId && !p.Inactive)
        .ToListAsync();

    var appliedCount = 0;
    var blockedSovereignAttempts = 0;

    foreach (var incoming in dto.PortableLayers)
    {
      var scopeEnum = (MpxParameterScopeEnum)incoming.ScopeCode;

      // Blindagem: Mesmo que alguém edite o JSON na mão tentando injetar ScopeCode 0 (SystemDefault) ou 1 (Corporation), o Jarbass bloqueia!
      if (scopeEnum is MpxParameterScopeEnum.SystemDefault or MpxParameterScopeEnum.Corporation)
      {
        blockedSovereignAttempts++;
        continue;
      }

      var target = existingParams.FirstOrDefault(p => p.ScopeCode == scopeEnum);
      if (target is not null)
      {
        target.SettingsJson = JsonSerializer.Serialize(incoming.Settings, new JsonSerializerOptions { WriteIndented = true });
        if (!string.IsNullOrWhiteSpace(incoming.MachineKey))
          target.MachineKey = incoming.MachineKey;
        appliedCount++;
      }
    }

    await dbContext.SaveChangesAsync();

    var allParams = await dbContext.Parameters
        .IgnoreQueryFilters()
        .AsNoTracking()
        .Include(p => p.Scope)
        .Where(p => (p.CorporationId == null || p.CorporationId == corpId) && !p.Inactive)
        .OrderBy(p => p.ScopeCode)
        .ToListAsync();

    return Ok(new
    {
      message = $"Mpx.Jarbass importou {appliedCount} camada(s) portáteis (Workspace/App/User/Machine) com sucesso!",
      appliedCount,
      blockedSovereignAttempts,
      parameters = allParams,
      effectiveParameters = BuildEffectiveParametersCascade(allParams)
    });
  }

  public record CreateScreenComponentDto(
      Guid ComponentTypeId,
      Guid? ParentComponentId,
      Guid? RouteId,
      Guid? WorkflowTypeId,
      Guid? WorkflowConfigId,
      Guid? WorkflowActionId,
      Guid? EntityPropertyId,
      string Label,
      string? ComponentCode,
      string? TriggerEvent);

  [HttpPost("screen-components")]
  public async Task<IActionResult> CreateScreenComponentAsync([FromBody] CreateScreenComponentDto dto)
  {
    var corpId = tenantProvider.GetCorporationId();

    var compType = await dbContext.ComponentTypes.IgnoreQueryFilters()
        .FirstOrDefaultAsync(c => c.Id == dto.ComponentTypeId);
    if (compType is null)
      return BadRequest("Tipo de componente Mpx* não encontrado.");

    var wkfType = dto.WorkflowTypeId.HasValue
        ? await dbContext.WorkflowTypes.FirstOrDefaultAsync(w => w.Id == dto.WorkflowTypeId.Value)
        : null;

    var wkfConfig = dto.WorkflowConfigId.HasValue
        ? await dbContext.WorkflowTypeConfigs.Include(c => c.Station).FirstOrDefaultAsync(c => c.Id == dto.WorkflowConfigId.Value)
        : null;

    var wkfAction = dto.WorkflowActionId.HasValue
        ? await dbContext.WorkflowTypeConfigActions.FirstOrDefaultAsync(a => a.Id == dto.WorkflowActionId.Value)
        : null;

    var entityProp = dto.EntityPropertyId.HasValue
        ? await dbContext.EntityProperties.IgnoreQueryFilters().Include(p => p.EntityDefinition).FirstOrDefaultAsync(p => p.Id == dto.EntityPropertyId.Value)
        : null;

    var count = await dbContext.ScreenComponents.CountAsync(sc => sc.CorporationId == corpId);
    var code = string.IsNullOrWhiteSpace(dto.ComponentCode)
        ? $"{compType.Name.ToUpperInvariant()}_{count + 1:D2}"
        : dto.ComponentCode.Trim().ToUpperInvariant();

    var embeddedObj = new
    {
      componentCode = code,
      tagName = compType.TagName,
      componentTypeName = compType.Name,
      wrappedInDraggable = compType.Code != MpxComponentTypeEnum.MpxDroppable,
      workflowType = wkfType?.Name ?? "SignIn",
      workflowTypeId = wkfType?.Id,
      stationConfigId = wkfConfig?.Id,
      stationName = wkfConfig?.Name ?? "Tela de Login (SignIn)",
      actionId = wkfAction?.Id,
      actionCode = wkfAction?.Name ?? (compType.SupportsWorkflowAction ? "CustomAction" : null),
      contextBinding = entityProp is not null ? $"{entityProp.EntityDefinition?.Name}.{entityProp.Name}" : null,
      dataType = entityProp?.DataType ?? "Text",
      disableOnClick = true,
      showSpinner = true,
      instantValidation = true,
      embeddedAtUtc = DateTime.UtcNow
    };

    var screenComp = new MpxScreenComponent
    {
      Id = Guid.CreateVersion7(),
      CorporationId = corpId,
      ComponentTypeId = compType.Id,
      ParentComponentId = dto.ParentComponentId,
      RouteId = dto.RouteId,
      WorkflowTypeId = wkfType?.Id,
      StationId = wkfConfig?.StationId,
      WorkflowConfigId = wkfConfig?.Id,
      WorkflowActionId = wkfAction?.Id,
      EntityPropertyId = entityProp?.Id,
      ComponentCode = code,
      Label = string.IsNullOrWhiteSpace(dto.Label) ? compType.Label : dto.Label.Trim(),
      TriggerEvent = string.IsNullOrWhiteSpace(dto.TriggerEvent) ? (compType.Code == MpxComponentTypeEnum.MpxDroppable ? "OnDrop" : "OnClick") : dto.TriggerEvent,
      EmbeddedConfigJson = JsonSerializer.Serialize(embeddedObj, new JsonSerializerOptions { WriteIndented = true }),
      Order = count + 1,
      Description = $"Objeto {compType.Name} encaixado via MpxDraggable ➔ MpxDroppable com configurações embarcadas."
    };

    dbContext.ScreenComponents.Add(screenComp);
    await dbContext.SaveChangesAsync();

    var loaded = await dbContext.ScreenComponents
        .AsNoTracking()
        .Include(sc => sc.ComponentType)
        .Include(sc => sc.WorkflowType)
        .Include(sc => sc.WorkflowConfig)
        .Include(sc => sc.WorkflowAction)
        .Include(sc => sc.EntityProperty)
        .FirstAsync(sc => sc.Id == screenComp.Id);

    return Ok(loaded);
  }
}
