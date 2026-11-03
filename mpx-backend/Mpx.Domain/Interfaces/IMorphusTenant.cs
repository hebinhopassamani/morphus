namespace Mpx.Domain.Interfaces;

/// <summary>
/// Interface de marcação para o isolamento Multi-Tenant do Morphus por Corporação.
/// </summary>
public interface IMorphusTenant
{
  public Guid CorporationId { get; set; }
}
