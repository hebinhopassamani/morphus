namespace Mpx.Application.Dtos;

public sealed class VsCodeBridgeOpenRequest
{
  public string? AppPrefix { get; set; }
  public string? FileName { get; set; }
  public string? HtmlContent { get; set; }
}
