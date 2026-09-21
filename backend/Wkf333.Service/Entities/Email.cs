namespace Morphus.Entities;

public class Email
{
  public Email()
  {
    EmaislTo = [];
    EmailsFrom = [];
    EmailsCc = [];
    EmailsBcc = [];

    MailSent = false;
  }

  public Guid? Id { get; set; }
  public string? Subject { get; set; }
  public string? HtmlBody { get; set; }
  public string? TextBody { get; set; }
  public bool IsHtmlBody { get; set; }
  public bool MailSent { get; set; }

  public List<EmailTo> EmaislTo { get; set; }
  public List<EmailFrom> EmailsFrom { get; set; }
  public List<EmailCc> EmailsCc { get; set; }
  public List<EmailBcc> EmailsBcc { get; set; }

  public void AddMailTo(string mailTo, string? name = null)
  {
    if (!String.IsNullOrEmpty(name))
      EmaislTo.Add(new EmailTo { Mail = mailTo, Name = name });
    else
      EmaislTo.Add(new EmailTo { Mail = mailTo });
  }

  public void AddMailFrom(string mailTo, string? name = null)
  {
    if (!String.IsNullOrEmpty(name))
      EmailsFrom.Add(new EmailFrom { Mail = mailTo, Name = name });
    else
      EmailsFrom.Add(new EmailFrom { Mail = mailTo });
  }

  public void AddMailCc(string mailTo, string? name = null)
  {
    if (!String.IsNullOrEmpty(name))
      EmailsCc.Add(new EmailCc { Mail = mailTo, Name = name });
    else
      EmailsCc.Add(new EmailCc { Mail = mailTo });
  }

  public void AddMailBcc(string mailTo, string? name = null)
  {
    if (!String.IsNullOrEmpty(name))
      EmailsBcc.Add(new EmailBcc { Mail = mailTo, Name = name });
    else
      EmailsBcc.Add(new EmailBcc { Mail = mailTo });
  }
}
