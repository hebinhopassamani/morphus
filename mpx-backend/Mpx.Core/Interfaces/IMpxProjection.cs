using System.Linq.Expressions;

namespace Mpx.Core.Interfaces;

public interface IMpxProjection<TEntity, TDto>
    where TEntity : class
{
  Expression<Func<TEntity, TDto>> BuildProjection();
}
