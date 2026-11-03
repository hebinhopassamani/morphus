using System.Linq.Expressions;

namespace Mpx.Domain.Dtos;

public abstract class MorphusDto
{
    public Guid Id { get; set; }
    public string Key { get; set; } = string.Empty;
    public bool System { get; set; }
    public bool Inactive { get; set; }
    public Guid? CorporationId { get; set; }
}

/// <summary>
/// Classe Pai Genérica de todos os DTOs do Morphus.
/// Fornece a propriedade herdada .Projection e o motor de encadeamento fluente retornando o próprio DTO (this).
/// </summary>
public abstract class MorphusDto<TEntity, TDto> : MorphusDto
    where TEntity : class
    where TDto : MorphusDto<TEntity, TDto>, new()
{
    private MorphusProjection<TEntity, TDto>? _projection;

    /// <summary>
    /// Expressão base de projeção escalar definida pela classe filha.
    /// </summary>
    protected abstract Expression<Func<TEntity, TDto>> BaseProjection { get; }

    /// <summary>
    /// Inicia a projeção herdada da classe pai, retornando a própria instância de TDto (ex.: UserReflectedDto.Projection ou UserDto.Projection.WithRoles()).
    /// </summary>
    public static TDto Projection => new();

    /// <summary>
    /// Adiciona uma navegação na árvore de expressão (Expression Tree) para o SELECT do EF Core.
    /// </summary>
    protected void Include<TProperty>(
        Expression<Func<TDto, TProperty>> dtoProperty,
        Expression<Func<TEntity, TProperty>> entitySelector)
    {
        _projection ??= new MorphusProjection<TEntity, TDto>(BaseProjection);
        _projection.With(dtoProperty, entitySelector);
    }

    public Expression<Func<TEntity, TDto>> BuildProjection() =>
        _projection is null ? BaseProjection : _projection.Build();

    public static implicit operator Expression<Func<TEntity, TDto>>(MorphusDto<TEntity, TDto> dto) =>
        dto.BuildProjection();
}
