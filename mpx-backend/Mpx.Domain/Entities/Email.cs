using Mpx.Domain.Interfaces;

namespace Mpx.Domain.Entities;

public class Email : MorphusEntity, IMorphusTenant
{
  public string? Subject { get; set; }
  public string? HtmlBody { get; set; }
  public string? TextBody { get; set; }
  public bool IsHtmlBody { get; set; }
  public bool MailSent { get; set; }
  public Guid CorporationId { get; set; }

  public virtual Corporation? Corporation { get; set; }
  public virtual ICollection<EmailTo> EmailTo { get; set; } = [];
  public virtual ICollection<EmailFrom> EmailFrom { get; set; } = [];
  public virtual ICollection<EmailCc> EmailCc { get; set; } = [];
  public virtual ICollection<EmailBcc> EmailBcc { get; set; } = [];

  public void AddMailTo(string mailTo, string? name = null)
  {
    EmailTo.Add(new EmailTo
    {
      Mail = mailTo,
      Name = name,
      CorporationId = CorporationId,
      Email = this
    });
  }

  public void AddMailFrom(string mailTo, string? name = null)
  {
    EmailFrom.Add(new EmailFrom
    {
      Mail = mailTo,
      Name = name,
      CorporationId = CorporationId,
      Email = this
    });
  }

  public void AddMailCc(string mailTo, string? name = null)
  {
    EmailCc.Add(new EmailCc
    {
      Mail = mailTo,
      Name = name,
      CorporationId = CorporationId,
      Email = this
    });
  }

  public void AddMailBcc(string mailTo, string? name = null)
  {
    EmailBcc.Add(new EmailBcc
    {
      Mail = mailTo,
      Name = name,
      CorporationId = CorporationId,
      Email = this
    });
  }
}
