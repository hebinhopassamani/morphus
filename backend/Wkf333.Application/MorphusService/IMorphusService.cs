namespace Morphus.Application.MorphusService;

public interface IMorphusService<T>
{
  Guid? BusinessId { get; set; }

  string? GetHeaderValue(string chave);
}
