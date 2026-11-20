namespace Mpx.Core.Filters;

public class MpxFilter
{
  public string? WhereClause { get; set; }
  public List<MpxFilterParameter> Parameters { get; set; } = [];
  public int? PageSize { get; set; }
  public int? PageIndex { get; set; }
}
