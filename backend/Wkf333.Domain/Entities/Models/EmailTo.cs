using Morphus.Core.MorphusEntity;

namespace Morphus.Domain.Entities.Models;

public class EmailTo(string mail, string? name) : MorphusEntity
{
  public string Mail { get; set; } = mail;
  public string? Name { get; set; } = name;
  public Guid? EmailId { get; set; }

  public Email? Email { get; set; }
}
