namespace Morphus.Entities;

public class EmailFrom
{
  public Guid? Id { get; set; }
  public Guid? EmailId { get; set; }
  public string? Mail { get; set; }
  public string? Name { get; set; }

  public Email? Email { get; set; }
}
