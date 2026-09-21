namespace Morphus.Domain.IMorphusRepository;

public interface IMorphusRepository<T>
{
  Guid? BusinessId { get; set; }
  string? GetHeaderValue(string chave);

  Task<T?> GetById(Guid Id);
  Task<T> Create(T entity);
  Task<T> UpdateNotNull(T entity, bool updateBusinessId = true);
  Task<List<T>> CreateList(List<T> entities);
  T Update(T entity, bool updateBusinessId = true);
  Task<bool> Delete(params object?[]? keyValues);
}
