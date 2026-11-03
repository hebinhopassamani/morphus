using System.Linq.Expressions;
using Mpx.Domain.Dtos;

namespace Mpx.Domain.Interfaces;

public interface IMorphusRepository<TEntity> where TEntity : class
{
  Guid? CorporationId { get; set; }

  Task<TEntity?> GetByIdAsync(Guid id);
  Task<TResult?> GetByIdAsync<TResult>(Guid id, Expression<Func<TEntity, TResult>> selector);
  Task<TDto?> GetByIdAsync<TDto>(Guid id, MorphusDto<TEntity, TDto> projection) where TDto : MorphusDto<TEntity, TDto>, new();
  Task<TResult?> GetFirstOrDefaultAsync<TResult>(Expression<Func<TEntity, bool>> predicate, Expression<Func<TEntity, TResult>> selector);
  Task<TDto?> GetFirstOrDefaultAsync<TDto>(Expression<Func<TEntity, bool>> predicate, MorphusDto<TEntity, TDto> projection) where TDto : MorphusDto<TEntity, TDto>, new();
  Task<TEntity?> GetById(Guid id);
  Task<IEnumerable<TEntity>> GetAllAsync();
  Task<List<TResult>> GetAllAsync<TResult>(Expression<Func<TEntity, TResult>> selector, Expression<Func<TEntity, bool>>? predicate = null);
  Task<List<TDto>> GetAllAsync<TDto>(MorphusDto<TEntity, TDto> projection, Expression<Func<TEntity, bool>>? predicate = null) where TDto : MorphusDto<TEntity, TDto>, new();
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
