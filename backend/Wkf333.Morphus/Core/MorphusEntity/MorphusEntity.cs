namespace Morphus.Core.MorphusEntity;

public class MorphusEntity
{
  public Guid? Id { get; set; } = null;

  public bool ItsNew()
  {
    return Id == Guid.Empty || Id is null;
  }
}
