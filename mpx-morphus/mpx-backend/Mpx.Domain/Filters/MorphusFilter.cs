namespace Mpx.Domain.Filters;

public class MorphusFilter
{
  public string? WhereClause { get; set; }
  public List<FilterParameter> Parameters { get; set; } = [];
  public int? PageSize { get; set; }
  public int? PageIndex { get; set; }
}
