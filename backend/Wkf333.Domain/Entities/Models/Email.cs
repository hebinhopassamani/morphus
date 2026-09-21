using Morphus.Core.MorphusEntity;

namespace Morphus.Domain.Entities.Models;

public class Email : MorphusEntity
{
    public Email()
    {
        EmaislTo = [];
        EmailsFrom = [];
        EmailsCc = [];
        EmailsBcc = [];
    }

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
        EmaislTo.Add(new EmailTo(mailTo, name));
    }

    public void AddMailFrom(string mailTo, string? name = null)
    {
        EmailsFrom.Add(new EmailFrom(mailTo, name));
    }

    public void AddMailCc(string mailTo, string? name = null)
    {
        EmailsCc.Add(new EmailCc(mailTo, name));
    }

    public void AddMailBcc(string mailTo, string? name = null)
    {
        EmailsBcc.Add(new EmailBcc(mailTo, name));
    }
}
