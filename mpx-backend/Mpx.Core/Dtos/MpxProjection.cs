using System.Linq.Expressions;
using System.Reflection;

namespace Mpx.Core.Dtos;

public class MpxProjection<TEntity, TDto>
    where TEntity : class
    where TDto : class
{
  private readonly ParameterExpression _parameter;
  private readonly NewExpression _newExpression;
  private readonly List<MemberBinding> _bindings;

  public MpxProjection(LambdaExpression baseProjection)
  {
    if (baseProjection.Body is not MemberInitExpression memberInit)
    {
      throw new ArgumentException("Base projection must be a MemberInitExpression (new Dto { ... }).", nameof(baseProjection));
    }

    _parameter = baseProjection.Parameters[0];
    _newExpression = typeof(TDto) == memberInit.NewExpression.Type
        ? memberInit.NewExpression
        : Expression.New(typeof(TDto));
    _bindings = [.. memberInit.Bindings];
  }

  public MpxProjection<TEntity, TDto> With<TProperty>(
      Expression<Func<TDto, TProperty>> dtoProperty,
      Expression<Func<TEntity, TProperty>> entitySelector)
  {
    if (dtoProperty.Body is not MemberExpression memberExpr || memberExpr.Member is not PropertyInfo propInfo)
    {
      throw new ArgumentException("Select a valid DTO property.", nameof(dtoProperty));
    }

    return WithProperty(propInfo, entitySelector);
  }

  public MpxProjection<TEntity, TDto> WithProperty(PropertyInfo propInfo, LambdaExpression entitySelector)
  {
    var replacedBody = new ParameterReplacer(entitySelector.Parameters[0], _parameter)
        .Visit(entitySelector.Body)!;

    _bindings.RemoveAll(b => b.Member.Name == propInfo.Name);
    _bindings.Add(Expression.Bind(propInfo, replacedBody));

    return this;
  }

  public MpxProjection<TEntity, TDto> And(Expression<Func<TEntity, TDto>> extraProjection)
  {
    if (extraProjection.Body is not MemberInitExpression extraInit)
    {
      throw new ArgumentException("Extra projection must be a MemberInitExpression (new Dto { ... }).", nameof(extraProjection));
    }

    var replacer = new ParameterReplacer(extraProjection.Parameters[0], _parameter);

    foreach (var binding in extraInit.Bindings.OfType<MemberAssignment>())
    {
      var replacedExpr = replacer.Visit(binding.Expression)!;
      _bindings.RemoveAll(b => b.Member.Name == binding.Member.Name);
      _bindings.Add(Expression.Bind(binding.Member, replacedExpr));
    }

    return this;
  }

  public Expression<Func<TEntity, TDto>> Build() =>
      Expression.Lambda<Func<TEntity, TDto>>(
          Expression.MemberInit(_newExpression, _bindings),
          _parameter);

  public static implicit operator Expression<Func<TEntity, TDto>>(MpxProjection<TEntity, TDto> projection) =>
      projection.Build();

  private sealed class ParameterReplacer(ParameterExpression source, ParameterExpression target) : ExpressionVisitor
  {
    protected override Expression VisitParameter(ParameterExpression node) =>
        node == source ? target : base.VisitParameter(node);
  }
}
