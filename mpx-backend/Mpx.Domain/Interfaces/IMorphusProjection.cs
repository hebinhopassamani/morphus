using System.Linq.Expressions;

namespace Mpx.Domain.Interfaces;

public interface IMorphusProjection<TEntity, TDto>
    where TEntity : class
{
    Expression<Func<TEntity, TDto>> BuildProjection();
}
