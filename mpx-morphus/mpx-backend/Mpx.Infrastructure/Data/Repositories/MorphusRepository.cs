using System.Reflection;
using Microsoft.EntityFrameworkCore;
using Mpx.Domain.Filters;
using Mpx.Domain.Interfaces;
using Npgsql;

namespace Mpx.Infrastructure.Data.Repositories;

public class MorphusRepository<TEntity>(MorphusDbContext context) : IMorphusRepository<TEntity> where TEntity : class
{
  protected readonly MorphusDbContext _context = context;
  protected readonly DbSet<TEntity> _dbSet = context.Set<TEntity>();
  private Guid? _corporationId;

  public Guid? CorporationId
  {
    get
    {
      if (_corporationId is not null && _corporationId != Guid.Empty)
        return _corporationId;

      try
      {
        return _context.CurrentCorporationId;
      }
      catch
      {
        return null;
      }
    }
    set { _corporationId = value; }
  }

  public virtual async Task<TEntity?> GetByIdAsync(Guid id)
  {
    return await _dbSet.FindAsync(id);
  }

  public virtual async Task<TEntity?> GetById(Guid id)
  {
    return await GetByIdAsync(id);
  }

  public async Task<IEnumerable<TEntity>> GetAllAsync()
  {
    return await _dbSet.ToListAsync();
  }

  public async Task AddAsync(TEntity entity)
  {
    StampCorporationId(entity);
    await _dbSet.AddAsync(entity);
  }

  public async Task<TEntity> Create(TEntity entity)
  {
    await AddAsync(entity);
    return entity;
  }

  public async Task<List<TEntity>> CreateList(List<TEntity> entities)
  {
    foreach (var entity in entities)
    {
      StampCorporationId(entity);
    }

    await _dbSet.AddRangeAsync(entities);
    return entities;
  }

  public void Update(TEntity entity)
  {
    Update(entity, updateCorporationId: true);
  }

  public TEntity Update(TEntity entity, bool updateCorporationId)
  {
    if (updateCorporationId && typeof(IMorphusTenant).IsAssignableFrom(typeof(TEntity)))
    {
      StampCorporationId(entity);
    }

    _context.Entry(entity).State = EntityState.Modified;
    return entity;
  }

  public async Task<TEntity> UpdateNotNull(TEntity entity, bool updateCorporationId = true)
  {
    return await UpdateNotNull<TEntity>(entity, updateCorporationId);
  }

  public async Task<E> UpdateNotNull<E>(E entity, bool updateCorporationId = true, params object?[]? keyValues) where E : class
  {
    if (keyValues is null || keyValues.Length == 0)
    {
      var pkProperties = _context.Model.FindEntityType(typeof(E))?.FindPrimaryKey()?.Properties;
      if (pkProperties is not null && pkProperties.Count > 0)
      {
        keyValues = pkProperties
            .Select(p => p.PropertyInfo?.GetValue(entity))
            .ToArray();
      }
      else
      {
        var fallbackIdProp = typeof(E).GetProperty("Id");
        if (fallbackIdProp is not null)
        {
          keyValues = [fallbackIdProp.GetValue(entity)];
        }
      }
    }

    if (keyValues is not null && keyValues.Length > 0)
    {
      var trackedObject = await _context.Set<E>().FindAsync(keyValues);

      if (trackedObject is not null)
      {
        var tracking = _context.Entry(trackedObject);

        foreach (var trackingProp in tracking.Properties)
        {
          if (trackingProp.Metadata.IsPrimaryKey())
            continue;

          if (trackingProp.Metadata.Name == "CorporationId" && !updateCorporationId)
            continue;

          var entityProperty = typeof(E).GetProperty(trackingProp.Metadata.Name);
          if (entityProperty is not null)
          {
            var entityPropertyValue = entityProperty.GetValue(entity);
            if (entityPropertyValue is not null)
            {
              trackingProp.CurrentValue = entityPropertyValue;
            }
          }
        }
      }
    }

    return entity;
  }

  public void Delete(TEntity entity)
  {
    _dbSet.Remove(entity);
  }

  public async Task<bool> Delete(params object?[]? keyValues)
  {
    var entity = await _dbSet.FindAsync(keyValues);
    if (entity is not null)
    {
      _dbSet.Remove(entity);
      return true;
    }

    return false;
  }

  public List<NpgsqlParameter> BuildParameters(MorphusFilter filter)
  {
    List<NpgsqlParameter> parameters = [];

    foreach (var param in filter.Parameters)
    {
      if (param.Value is not null && param.Label is not null)
      {
        switch (param.DataType)
        {
          case "guid":
            parameters.Add(new NpgsqlParameter(param.Label, Guid.Parse(param.Value.ToString()!)));
            break;
          case "text":
            parameters.Add(new NpgsqlParameter(param.Label, param.Value.ToString()));
            break;
          case "int":
            parameters.Add(new NpgsqlParameter(param.Label, Convert.ToInt32(param.Value.ToString())));
            break;
          case "decimal":
            parameters.Add(new NpgsqlParameter(param.Label, Convert.ToDecimal(param.Value.ToString())));
            break;
          case "boolean":
            parameters.Add(new NpgsqlParameter(param.Label, Convert.ToBoolean(param.Value.ToString())));
            break;
          case "date":
          case "date_time":
            parameters.Add(new NpgsqlParameter(param.Label, Convert.ToDateTime(param.Value.ToString())));
            break;
        }
      }
    }

    return parameters;
  }

  public void ClearNavigationProperties(TEntity entity)
  {
    var entityType = _context.Model.FindEntityType(typeof(TEntity));
    if (entityType is not null)
    {
      var navigationProperties = entityType.GetNavigations()
          .Select(nav => nav.PropertyInfo);

      foreach (var property in navigationProperties)
      {
        property?.SetValue(entity, null);
      }
    }
  }

  private void StampCorporationId(TEntity entity)
  {
    if (!typeof(IMorphusTenant).IsAssignableFrom(typeof(TEntity)))
      return;

    PropertyInfo? propertyInfo = typeof(TEntity).GetProperty("CorporationId");
    if (propertyInfo is not null)
    {
      var existingVal = propertyInfo.GetValue(entity) as Guid?;
      if ((existingVal is null || existingVal == Guid.Empty) && CorporationId is not null && CorporationId != Guid.Empty)
      {
        propertyInfo.SetValue(entity, CorporationId.Value);
      }
    }
  }
}
