using System.Linq.Expressions;

namespace Mpx.Core.Interfaces;

public interface IMpxRepository<TEntity> where TEntity : class
{
  Guid? CorporationId { get; set; }

  Task<TEntity?> GetByIdAsync(Guid id);
  Task<TResult?> GetByIdAsync<TResult>(Guid id, Expression<Func<TEntity, TResult>> selector);
  Task<TDto?> GetByIdAsync<TDto>(Guid id, IMpxProjection<TEntity, TDto> projection);
  Task<TResult?> GetFirstOrDefaultAsync<TResult>(Expression<Func<TEntity, bool>> predicate, Expression<Func<TEntity, TResult>> selector);
  Task<TDto?> GetFirstOrDefaultAsync<TDto>(Expression<Func<TEntity, bool>> predicate, IMpxProjection<TEntity, TDto> projection);
  Task<TEntity?> GetById(Guid id);
  Task<IEnumerable<TEntity>> GetAllAsync();
  Task<List<TResult>> GetAllAsync<TResult>(Expression<Func<TEntity, TResult>> selector, Expression<Func<TEntity, bool>>? predicate = null);
  Task<List<TDto>> GetAllAsync<TDto>(IMpxProjection<TEntity, TDto> projection, Expression<Func<TEntity, bool>>? predicate = null);
  Task<bool> ExistsAsync(Expression<Func<TEntity, bool>> predicate);

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
