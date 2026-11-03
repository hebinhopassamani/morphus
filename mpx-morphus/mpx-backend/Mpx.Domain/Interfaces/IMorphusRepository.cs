namespace Mpx.Domain.Interfaces;

public interface IMorphusRepository<TEntity> where TEntity : class
{
  Guid? CorporationId { get; set; }

  Task<TEntity?> GetByIdAsync(Guid id);
  Task<TEntity?> GetById(Guid id);
  Task<IEnumerable<TEntity>> GetAllAsync();

  Task AddAsync(TEntity entity);
  Task<TEntity> Create(TEntity entity);
  Task<List<TEntity>> CreateList(List<TEntity> entities);

  void Update(TEntity entity);
  TEntity Update(TEntity entity, bool updateCorporationId);
  Task<TEntity> UpdateNotNull(TEntity entity, bool updateCorporationId = true);
  Task<E> UpdateNotNull<E>(E entity, bool updateCorporationId = true, params object?[]? keyValues) where E : class;

  void Delete(TEntity entity);
  Task<bool> Delete(params object?[]? keyValues);

  void ClearNavigationProperties(TEntity entity);
}
