namespace Morphus.Domain.Filters;

public class MorphusFilterRow
{
  public MorphusFilterColumn? Column { get; set; }
  public MorphusFilterOperator? Operator { get; set; }
  public string? Value { get; set; }
  public string? AndOr { get; set; }
}
