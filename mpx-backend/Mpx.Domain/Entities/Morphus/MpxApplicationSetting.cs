using Mpx.Core.Entities;
using Mpx.Core.Interfaces;

namespace Mpx.Domain.Entities;

public class MpxApplicationSetting : MpxEntity, IMpxTenant
{
  public Guid CorporationId { get; set; }
  public Guid ApplicationId { get; set; }
  public required string SettingKey { get; set; }
  public required string Label { get; set; }
  public string ValueType { get; set; } = "string"; // "string" | "boolean" | "number" | "currency" | "endpoint"
  public string Value { get; set; } = string.Empty;
  public string? EndpointUrl { get; set; }
  public string RefreshPolicy { get; set; } = "manual"; // "manual" | "realtime" | "daily"
  public bool IsLockedSystem { get; set; }
  public int Order { get; set; }
  public string? Description { get; set; }

  public virtual MpxCorporation? Corporation { get; set; }
  public virtual MpxApplication? Application { get; set; }
}

