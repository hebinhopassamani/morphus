namespace Mpx.Application.MorphusHandler;

public interface IMorphusHandler<T>
{
  Guid? CorporationId { get; set; }
  Guid? UserId { get; }
  string? GetHeaderValue(string chave);
}
