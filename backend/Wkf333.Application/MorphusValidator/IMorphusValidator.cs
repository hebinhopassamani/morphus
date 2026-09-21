namespace Morphus.Application.MorphusValidator;

public interface IMorphusValidator<T>
{
  Guid? BusinessId { get; set; }
  void AddErrorMessage(string message);
  bool IsValid();

  string ErrorMessage { get; }
}
