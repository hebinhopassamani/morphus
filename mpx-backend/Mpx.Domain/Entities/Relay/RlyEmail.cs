using Mpx.Core.Entities;
using Mpx.Core.Interfaces;

namespace Mpx.Domain.Entities;

public class RlyEmail : MpxEntity, IMpxTenant
{
  public string? Subject { get; set; }
  public string? HtmlBody { get; set; }
  public string? TextBody { get; set; }
  public bool IsHtmlBody { get; set; }
  public bool MailSent { get; set; }
  public Guid CorporationId { get; set; }

  public virtual MpxCorporation? Corporation { get; set; }
  public virtual ICollection<RlyEmailTo> EmailTo { get; set; } = [];
  public virtual ICollection<RlyEmailFrom> EmailFrom { get; set; } = [];
  public virtual ICollection<RlyEmailCc> EmailCc { get; set; } = [];
  public virtual ICollection<RlyEmailBcc> EmailBcc { get; set; } = [];

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

