using MimeKit;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Hosting;
using Morphus.Domain.IRepositories;
using Morphus.Domain.Entities.Models;
using Morphus.Domain.ITransaction;
using Morphus.Application.MorphusService;
using Microsoft.AspNetCore.Http;

namespace Morphus.Application.Services.MailSerrvice;

public class EmailService : MorphusService<Email>, IEmailService
{
    private readonly string senderName;
    private readonly string senderEmail;
    private readonly IMorphusTransaction transaction;
    private readonly IWebHostEnvironment environment;
    private readonly IEmailRepository emailRepository;
    private readonly IConfiguration consuguration;
    private readonly MimeMessage emmailMessage = new();
    private Email mpsEmail = new();

    public EmailService(IConfiguration mpsConfiguration,
                        IWebHostEnvironment mpsEnvironment,
                        IMorphusTransaction mpsTransaction,
                        IEmailRepository mpsEmailReposiory,
                        IHttpContextAccessor mpsHttpContext) : base(mpsHttpContext)
    {
        transaction = mpsTransaction;
        environment = mpsEnvironment;
        consuguration = mpsConfiguration;
        emailRepository = mpsEmailReposiory;

        mpsEmail.MailSent = false;

        senderName = consuguration["SmtpSettings:SenderName"] ?? "laupaconsultoria@gmail.com";
        senderEmail = consuguration["SmtpSettings:SenderEmail"] ?? "laupaconsultoria@gmail.com";

        MailFrom(senderEmail, senderName);
    }

    public EmailService NewEmail()
    {
        mpsEmail = new Email();

        return this;
    }

    public EmailService MailTo(string? email, string? name = null)
    {
        if (String.IsNullOrEmpty(email))
            throw new Exception("Nenhuma e-mail informaod");

        if (String.IsNullOrEmpty(name))
        {
            mpsEmail.AddMailTo(email);
            emmailMessage.To.Add(MailboxAddress.Parse(email));
        }
        else
        {
            mpsEmail.AddMailTo(email, name);
            emmailMessage.To.Add(new MailboxAddress(name, email));
        }

        return this;
    }

    public EmailService MailFrom(string? email, string? name = null)
    {
        if (String.IsNullOrEmpty(email))
            throw new Exception("Nenhuma e-mail informaod");

        if (String.IsNullOrEmpty(name))
        {
            mpsEmail.AddMailFrom(email);
            emmailMessage.From.Add(MailboxAddress.Parse(email));
        }
        else
        {
            mpsEmail.AddMailFrom(email, name);
            emmailMessage.From.Add(new MailboxAddress(name, email));
        }

        return this;
    }

    public EmailService MailCc(string? email, string? name = null)
    {
        if (String.IsNullOrEmpty(email))
            throw new Exception("Nenhuma e-mail informaod");

        if (String.IsNullOrEmpty(name))
        {
            mpsEmail.AddMailCc(email);
            emmailMessage.Cc.Add(MailboxAddress.Parse(email));
        }
        else
        {
            mpsEmail.AddMailCc(email, name);
            emmailMessage.Cc.Add(new MailboxAddress(name, email));
        }

        return this;
    }

    public EmailService MailBcc(string? email, string? name = null)
    {
        if (String.IsNullOrEmpty(email))
            throw new Exception("Nenhuma e-mail informaod");

        if (String.IsNullOrEmpty(name))
        {
            mpsEmail.AddMailBcc(email);
            emmailMessage.Bcc.Add(MailboxAddress.Parse(email));
        }
        else
        {
            mpsEmail.AddMailBcc(email, name);
            emmailMessage.Bcc.Add(new MailboxAddress(name, email));
        }

        return this;
    }

    public EmailService Subject(string? subject)
    {
        mpsEmail.Subject = subject ?? "Mensagem Sem Assunto";
        emmailMessage.Subject = subject ?? "Mensagem Sem Assunto";

        return this;
    }

    public EmailService SetTextBody(string? body)
    {
        var bodyBuilder = new BodyBuilder
        {
            TextBody = body
        };

        mpsEmail.TextBody = body;
        mpsEmail.IsHtmlBody = false;
        emmailMessage.Body = bodyBuilder.ToMessageBody();

        return this;
    }

    public EmailService SetHtmlBody(string? body)
    {
        var bodyBuilder = new BodyBuilder
        {
            HtmlBody = body
        };

        mpsEmail.HtmlBody = body;
        mpsEmail.IsHtmlBody = true;
        emmailMessage.Body = bodyBuilder.ToMessageBody();

        return this;
    }

    public EmailService LoadHtmlFilte(string path)
    {
        var contentFile = File.ReadAllText(environment.WebRootPath + path);

        SetHtmlBody(contentFile);

        return this;
    }

    public EmailService LoadTextFilte(string path)
    {
        var contentFile = File.ReadAllText(environment.WebRootPath + path);

        SetTextBody(contentFile);

        return this;
    }

    public EmailService ReplaceHtmlFile(string oldValue, string? newValue)
    {
        mpsEmail.HtmlBody = mpsEmail.HtmlBody is not null ? mpsEmail.HtmlBody?.Replace(oldValue, newValue) : "";

        return this;
    }

    public EmailService ReplaceTextFile(string oldValue, string? newValue)
    {
        mpsEmail.TextBody = mpsEmail.TextBody is not null ? mpsEmail.TextBody?.Replace(oldValue, newValue) : "";

        return this;
    }

    public async Task<Email> SendEmailAsync()
    {
        try
        {
            mpsEmail = await emailRepository.Create(mpsEmail);

            await transaction.Commit();

            using var smtp = new SmtpClient
            {
                CheckCertificateRevocation = false
            };

            var server = consuguration["SmtpSettings:Server"];
            var port = int.Parse(consuguration["SmtpSettings:Port"]!);
            var password = consuguration["SmtpSettings:Password"];

            await smtp.ConnectAsync(server!, port, SecureSocketOptions.StartTls);
            await smtp.AuthenticateAsync(senderEmail, password!);
            await smtp.SendAsync(emmailMessage);
            await smtp.DisconnectAsync(true);

            mpsEmail.MailSent = true;

            await emailRepository.UpdateNotNull(mpsEmail);

            await transaction.Commit();

            return mpsEmail;
        }
        catch (Exception)
        {
            mpsEmail.MailSent = false;
            return mpsEmail;
        }
    }

    public async Task<Email> Create(Email entity)
    {
        entity = await emailRepository.Create(entity);

        await transaction.Commit();

        return entity;
    }

    public EmailService LoadEmail(Email email)
    {
        Subject(email.Subject);

        if (email.IsHtmlBody)
        {
            SetHtmlBody(email.HtmlBody);
        }
        else
        {
            SetHtmlBody(email.TextBody);
        }

        foreach (var mailTo in email.EmaislTo)
        {
            if (String.IsNullOrEmpty(mailTo.Mail))
                throw new Exception("Nenhuma e-mail informaod");

            if (String.IsNullOrEmpty(mailTo.Name))
            {
                mpsEmail.AddMailTo(mailTo.Mail);
                emmailMessage.To.Add(MailboxAddress.Parse(mailTo.Mail));
            }
            else
            {
                mpsEmail.AddMailTo(mailTo.Mail, mailTo.Name);
                emmailMessage.To.Add(new MailboxAddress(mailTo.Name, mailTo.Mail));
            }
        }

        foreach (var mailFrom in email.EmailsFrom)
        {
            if (String.IsNullOrEmpty(mailFrom.Mail))
                throw new Exception("Nenhuma e-mailFrom informaod");

            if (String.IsNullOrEmpty(mailFrom.Name))
            {
                mpsEmail.AddMailFrom(mailFrom.Mail);
                emmailMessage.From.Add(MailboxAddress.Parse(mailFrom.Mail));
            }
            else
            {
                mpsEmail.AddMailFrom(mailFrom.Mail, mailFrom.Name);
                emmailMessage.From.Add(new MailboxAddress(mailFrom.Name, mailFrom.Mail));
            }
        }

        foreach (var mailCc in email.EmailsCc)
        {
            if (String.IsNullOrEmpty(mailCc.Mail))
                throw new Exception("Nenhuma e-mailCc informaod");

            if (String.IsNullOrEmpty(mailCc.Name))
            {
                mpsEmail.AddMailCc(mailCc.Mail);
                emmailMessage.Cc.Add(MailboxAddress.Parse(mailCc.Mail));
            }
            else
            {
                mpsEmail.AddMailCc(mailCc.Mail, mailCc.Name);
                emmailMessage.Cc.Add(new MailboxAddress(mailCc.Name, mailCc.Mail));
            }
        }

        foreach (var mailBcc in email.EmailsBcc)
        {
            if (String.IsNullOrEmpty(mailBcc.Mail))
                throw new Exception("Nenhuma e-mailBcc informaod");

            if (String.IsNullOrEmpty(mailBcc.Name))
            {
                mpsEmail.AddMailBcc(mailBcc.Mail);
                emmailMessage.Bcc.Add(MailboxAddress.Parse(mailBcc.Mail));
            }
            else
            {
                mpsEmail.AddMailBcc(mailBcc.Mail, mailBcc.Name);
                emmailMessage.Bcc.Add(new MailboxAddress(mailBcc.Name, mailBcc.Mail));
            }
        }

        return this;
    }
}
