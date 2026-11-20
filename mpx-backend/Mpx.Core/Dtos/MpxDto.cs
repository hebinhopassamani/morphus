using System.Linq.Expressions;
using System.Reflection;

using Mpx.Core.Interfaces;

namespace Mpx.Core.Dtos;

public abstract class MpxDto<TEntity, TDto> : IMpxProjection<TEntity, TDto>
    where TEntity : class
    where TDto : MpxDto<TEntity, TDto>, new()
{
  private readonly List<(PropertyInfo Property, LambdaExpression Selector)> _includes = [];

  public Guid Id { get; set; }
  public string Key { get; set; } = string.Empty;
  public bool System { get; set; }
  public bool Inactive { get; set; }
  public Guid? CorporationId { get; set; }

  protected abstract Expression<Func<TEntity, TDto>> BaseProjection { get; }

  public static TDto Projection => new();

  protected void Include<TProperty>(
      Expression<Func<TDto, TProperty>> dtoProperty,
      Expression<Func<TEntity, TProperty>> entitySelector) =>
      IncludeInternal(dtoProperty, entitySelector);

  protected void Include<TDerivedDto, TProperty>(
      Expression<Func<TDerivedDto, TProperty>> dtoProperty,
      Expression<Func<TEntity, TProperty>> entitySelector)
      where TDerivedDto : TDto =>
      IncludeInternal(dtoProperty, entitySelector);

  private void IncludeInternal(LambdaExpression dtoProperty, LambdaExpression entitySelector)
  {
    if (dtoProperty.Body is not MemberExpression memberExpr || memberExpr.Member is not PropertyInfo propInfo)
    {
      throw new ArgumentException("Select a valid DTO property.", nameof(dtoProperty));
    }

    _includes.RemoveAll(x => x.Property.Name == propInfo.Name);
    _includes.Add((propInfo, entitySelector));
  }

  public Expression<Func<TEntity, TDto>> BuildProjection() =>
      _includes.Count == 0 && GetType() == typeof(TDto)
          ? BaseProjection
          : BuildProjectionFor<TDto>();

  protected Expression<Func<TEntity, TDerivedDto>> BuildProjectionFor<TDerivedDto>()
      where TDerivedDto : TDto, new()
  {
    var projection = new MpxProjection<TEntity, TDerivedDto>(BaseProjection);
    foreach (var (prop, selector) in _includes)
    {
      projection.WithProperty(prop, selector);
    }

    return projection.Build();
  }

  public static implicit operator Expression<Func<TEntity, TDto>>(MpxDto<TEntity, TDto> dto) =>
      dto.BuildProjection();
}
