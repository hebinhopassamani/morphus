using System.Linq.Expressions;
using System.Reflection;

namespace Mpx.Domain.Dtos;

/// <summary>
/// Motor Fluente de Projeção de DTOs do Morphus.
/// Combina múltiplos MemberBindings em uma única árvore de expressão (MemberInitExpression)
/// para que o Entity Framework Core gere um único SELECT SQL cirúrgico com os JOINs sob demanda.
/// </summary>
public class MorphusProjection<TEntity, TDto>
    where TEntity : class
    where TDto : class
{
    private readonly ParameterExpression _parameter;
    private readonly NewExpression _newExpression;
    private readonly List<MemberBinding> _bindings;

    public MorphusProjection(Expression<Func<TEntity, TDto>> baseProjection)
    {
        if (baseProjection.Body is not MemberInitExpression memberInit)
        {
            throw new ArgumentException("A projeção base deve ser uma expressão de inicialização (new Dto { ... }).", nameof(baseProjection));
        }

        _parameter = baseProjection.Parameters[0];
        _newExpression = memberInit.NewExpression;
        _bindings = [.. memberInit.Bindings];
    }

    /// <summary>
    /// Adiciona uma propriedade de navegação (ou campo extra) de forma fluente à projeção do DTO.
    /// </summary>
    public MorphusProjection<TEntity, TDto> With<TProperty>(
        Expression<Func<TDto, TProperty>> dtoProperty,
        Expression<Func<TEntity, TProperty>> entitySelector)
    {
        if (dtoProperty.Body is not MemberExpression memberExpr || memberExpr.Member is not PropertyInfo propInfo)
        {
            throw new ArgumentException("Selecione uma propriedade válida do DTO.", nameof(dtoProperty));
        }

        var replacedBody = new ParameterReplacer(entitySelector.Parameters[0], _parameter)
            .Visit(entitySelector.Body)!;

        // Remove binding anterior caso a mesma propriedade seja sobrescrita e adiciona o novo
        _bindings.RemoveAll(b => b.Member.Name == propInfo.Name);
        _bindings.Add(Expression.Bind(propInfo, replacedBody));

        return this;
    }

    /// <summary>
    /// Mescla outro bloco new Dto { ... } dentro da projeção atual.
    /// </summary>
    public MorphusProjection<TEntity, TDto> And(Expression<Func<TEntity, TDto>> extraProjection)
    {
        if (extraProjection.Body is not MemberInitExpression extraInit)
        {
            throw new ArgumentException("A projeção extra deve ser uma expressão de inicialização (new Dto { ... }).", nameof(extraProjection));
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

    public static implicit operator Expression<Func<TEntity, TDto>>(MorphusProjection<TEntity, TDto> projection) =>
        projection.Build();

    private sealed class ParameterReplacer(ParameterExpression source, ParameterExpression target) : ExpressionVisitor
    {
        protected override Expression VisitParameter(ParameterExpression node) =>
            node == source ? target : base.VisitParameter(node);
    }
}
