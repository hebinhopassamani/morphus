using Morphus.Context;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Primitives;
using Morphus.Domain.Filters;
using Morphus.Domain.IMorphusRepository;
using System.Reflection;
using Npgsql;


namespace Morphus.Repository;

public class MorphusRepository<T>(W3DbContext context, IHttpContextAccessor httpContextAccessor) : IMorphusRepository<T> where T : class
{
  protected readonly W3DbContext mpsContext = context;
  protected readonly IHttpContextAccessor mpsHttpContextAccessor = httpContextAccessor;

  private Guid? _businessId;

  public Guid? BusinessId
  {
    get
    {
      if (_businessId is not null && _businessId != Guid.Empty)
        return _businessId;

      if (mpsHttpContextAccessor?.HttpContext?.Request is not null && mpsHttpContextAccessor.HttpContext.Request.Headers is not null && mpsHttpContextAccessor.HttpContext.Request.Headers.Any())
      {
        mpsHttpContextAccessor.HttpContext.Request.Headers.TryGetValue("BusinessId", out StringValues businessId);

        _ = Guid.TryParse(businessId, out Guid guid);

        return guid;
      }

      return null;
    }
    set
    {
      _businessId = value;
    }
  }

  public string? GetHeaderValue(string chave)
  {
    if (mpsHttpContextAccessor?.HttpContext?.Request is not null && mpsHttpContextAccessor.HttpContext.Request.Headers is not null && mpsHttpContextAccessor.HttpContext.Request.Headers.Any())
    {
      mpsHttpContextAccessor.HttpContext.Request.Headers.TryGetValue(chave, out StringValues value);

      return value;
    }

    return null;
  }

  public virtual async Task<T?> GetById(Guid Id)
  {
    return await mpsContext.Set<T>()
                 .AsNoTracking()
                 .Where(e => EF.Property<string>(e, "Id").ToString() == Id.ToString())
                 .FirstOrDefaultAsync();

  }

  public async Task<T> Create(T entity)
  {
    PropertyInfo? propertyInfo = typeof(T).GetProperty("BusinessId");

    if (propertyInfo is not null && BusinessId is not null && BusinessId != Guid.Empty)
    {
      propertyInfo.SetValue(entity, BusinessId);
    }

    await mpsContext.Set<T>().AddAsync(entity);

    return entity;
  }

  public async Task<List<T>> CreateList(List<T> entities)
  {
    foreach (var entity in entities)
    {
      PropertyInfo? propertyInfo = typeof(T).GetProperty("BusinessId");

      if (propertyInfo is not null && BusinessId is not null)
      {
        propertyInfo.SetValue(entity, BusinessId);
      }
    }

    await mpsContext.Set<T>().AddRangeAsync(entities);

    return entities;
  }

  public T Update(T entity, bool updateBusinessId = true)
  {
    if (updateBusinessId)
    {
      PropertyInfo? propertyInfo = typeof(T).GetProperty("BusinessId");

      if (propertyInfo is not null && BusinessId is not null && BusinessId != Guid.Empty)
      {
        propertyInfo.SetValue(entity, BusinessId);
      }
    }

    mpsContext.Set<T>().Update(entity);

    return entity;
  }

  public async Task<T> UpdateNotNull(T entity, bool updateBusinessId = true)
  {
    var propertyInfo = typeof(T).GetProperty("Id");

    if (propertyInfo is not null)
    {
      var id = propertyInfo.GetValue(entity);

      var trackedObject = await mpsContext.Set<T>().FindAsync(id);

      if (trackedObject is not null)
      {
        var tracking = mpsContext.Entry(trackedObject);

        foreach (var trackingProp in tracking.Properties)
        {
          if (trackingProp.Metadata.Name == "BusinessId" && !updateBusinessId)
            continue;

          var entityProperty = typeof(T).GetProperty(trackingProp.Metadata.Name);

          if (entityProperty != null)
          {
            var entityPropertyValue = entityProperty.GetValue(entity);

            if (entityPropertyValue != null)
            {
              trackingProp.CurrentValue = entityPropertyValue;
            }
          }
        }
      }
    }

    return entity;
  }

  public async Task<E> UpdateNotNull<E>(E entity, bool updateBusinessId = true, params object?[]? keyValues) where E : class
  {
    var pkPropertyInfo = typeof(E).GetProperty("Id");

    if (pkPropertyInfo is not null || keyValues is not null)
    {
      keyValues ??= [pkPropertyInfo!.GetValue(entity)];

      var trackedObject = await mpsContext.Set<E>().FindAsync(keyValues);

      if (trackedObject is not null)
      {
        var tracking = mpsContext.Entry(trackedObject);

        foreach (var trackingProp in tracking.Properties)
        {
          if (trackingProp.Metadata.Name == "BusinessId" && !updateBusinessId)
            continue;

          var entityProperty = typeof(E).GetProperty(trackingProp.Metadata.Name);

          if (entityProperty != null)
          {
            var entityPropertyValue = entityProperty.GetValue(entity);

            if (entityPropertyValue != null)
            {
              trackingProp.CurrentValue = entityPropertyValue;
            }
          }
        }
      }
    }

    return entity;
  }

  public async Task<bool> Delete(params object?[]? keyValues)
  {
    var entity = await mpsContext.Set<T>().FindAsync(keyValues);

    if (entity is not null)
    {
      mpsContext.Set<T>().Remove(entity);

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
            parameters.Add(new NpgsqlParameter(param.Label, Convert.ToDateTime(param.Value.ToString())));
            break;
          case "date_time":
            parameters.Add(new NpgsqlParameter(param.Label, Convert.ToDateTime(param.Value.ToString())));
            break;
        }
      }
    }

    return parameters;
  }

  public void ClearNavigationProperties(T entity)
  {
    var entityType = mpsContext.Model.FindEntityType(typeof(T));
    if (entityType != null)
    {
      var navigationProperty = entityType.GetNavigations()
       .Select(nav => nav.PropertyInfo);

      foreach (var property in navigationProperty)
      {
        property?.SetValue(entity, null);
      }
    }
  }

}
