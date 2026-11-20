namespace Mpx.Core.Handlers;

public interface IMpxHandler<T>
{
  Guid? CorporationId { get; set; }
  Guid? UserId { get; }
  string? GetHeaderValue(string key);
}
