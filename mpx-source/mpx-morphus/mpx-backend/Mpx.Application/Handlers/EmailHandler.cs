using Microsoft.Extensions.Configuration;
using MimeKit;
using MailKit.Net.Smtp;
using MailKit.Security;
using System.Reflection;
using Mpx.Domain.Interfaces;
using mpx.Domain.Interfaces;
using Mpx.Domain.Entities;

namespace Mpx.Application.Handlers;

public class EmailHandler
{
  private readonly string _senderName;
  private readonly string _senderEmail;
  private readonly IEmailRepository _emailRepository;
  private readonly IConfiguration _configuration;
  private readonly IUnitOfWork _unitOfWork;
  private MimeMessage _emailMessage = new();
  private Email _email = new();

  // 1. Construtor usando Primary Constructor oculto ou injeção clássica corrigida
  public EmailHandler(IConfiguration configuration,
                      IUnitOfWork unitOfWork,
                      IEmailRepository emailRepository)
  {
    _configuration = configuration;
    _unitOfWork = unitOfWork;
    _emailRepository = emailRepository;

    // Inicializa com dados válidos para satisfazer os membros 'required'
    _email = new Email
    {
      Subject = "Mensagem Sem Assunto",
      HtmlBody = " ",
      MailSent = false
    };

    _senderName = _configuration["SmtpSettings:SenderName"] ?? "laupaconsultoria@gmail.com";
    _senderEmail = _configuration["SmtpSettings:SenderEmail"] ?? "laupaconsultoria@gmail.com";

    var recursosEmbutidos = System.Reflection.Assembly.GetExecutingAssembly().GetManifestResourceNames();

    foreach (var recurso in recursosEmbutidos)
    {
      System.Console.WriteLine($"👉 Recurso encontrado: {recurso}");
    }

    MailFrom(_senderEmail, _senderName);
  }

  public EmailHandler NewEmail(Guid? corporationId = null)
  {
    _email = new Email
    {
      Subject = "Mensagem Sem Assunto",
      HtmlBody = " ",
      MailSent = false,
      CorporationId = corporationId ?? Guid.Empty
    };
    _emailMessage = new MimeMessage();
    MailFrom(_senderEmail, _senderName);
    return this;
  }

  public EmailHandler MailTo(string? email, string? name = null)
  {
    if (string.IsNullOrEmpty(email))
      throw new ArgumentException("Nenhum e-mail informado");

    if (string.IsNullOrEmpty(name))
    {
      _email.AddMailTo(email);
      _emailMessage.To.Add(MailboxAddress.Parse(email));
    }
    else
    {
      _email.AddMailTo(email, name);
      _emailMessage.To.Add(new MailboxAddress(name, email));
    }

    return this;
  }

  public EmailHandler MailFrom(string? email, string? name = null)
  {
    if (string.IsNullOrEmpty(email))
      throw new ArgumentException("Nenhum e-mail informado");

    if (string.IsNullOrEmpty(name))
    {
      _email.AddMailFrom(email);
      _emailMessage.From.Add(MailboxAddress.Parse(email));
    }
    else
    {
      _email.AddMailFrom(email, name);
      _emailMessage.From.Add(new MailboxAddress(name, email));
    }

    return this;
  }

  public EmailHandler MailCc(string? email, string? name = null)
  {
    if (string.IsNullOrEmpty(email))
      throw new ArgumentException("Nenhum e-mail informado");

    if (string.IsNullOrEmpty(name))
    {
      _email.AddMailCc(email);
      _emailMessage.Cc.Add(MailboxAddress.Parse(email));
    }
    else
    {
      _email.AddMailCc(email, name);
      _emailMessage.Cc.Add(new MailboxAddress(name, email));
    }

    return this;
  }

  public EmailHandler MailBcc(string? email, string? name = null)
  {
    if (string.IsNullOrEmpty(email))
      throw new ArgumentException("Nenhum e-mail informado");

    if (string.IsNullOrEmpty(name))
    {
      _email.AddMailBcc(email);
      _emailMessage.Bcc.Add(MailboxAddress.Parse(email));
    }
    else
    {
      _email.AddMailBcc(email, name);
      _emailMessage.Bcc.Add(new MailboxAddress(name, email));
    }

    return this;
  }

  public EmailHandler Subject(string? subject)
  {
    _email.Subject = subject ?? "Mensagem Sem Assunto";
    _emailMessage.Subject = subject ?? "Mensagem Sem Assunto";
    return this;
  }

  public EmailHandler SetTextBody(string? body)
  {
    var bodyBuilder = new BodyBuilder { TextBody = body };
    _email.TextBody = body;
    _email.IsHtmlBody = false;
    _emailMessage.Body = bodyBuilder.ToMessageBody();
    return this;
  }

  public EmailHandler SetHtmlBody(string? body)
  {
    var bodyBuilder = new BodyBuilder { HtmlBody = body };
    _email.HtmlBody = body ?? " ";
    _email.IsHtmlBody = true;
    _emailMessage.Body = bodyBuilder.ToMessageBody();
    return this;
  }

  // 2. ABORDAGEM 1: Lendo arquivos HTML embutidos na DLL (Embedded Resources)
  public EmailHandler LoadHtmlFile(string fileName)
  {
    if (!fileName.EndsWith(".html", System.StringComparison.OrdinalIgnoreCase))
    {
      fileName += ".html";
    }

    // Path.Combine descobre de forma inteligente onde a API está rodando
    // e busca a pasta 'EmailTemplates' que foi copiada para lá automaticamente
    var caminhoBase = System.AppDomain.CurrentDomain.BaseDirectory;
    var caminhoArquivo = Path.Combine(caminhoBase, "EmailTemplates", fileName);

    if (!File.Exists(caminhoArquivo))
    {
      throw new FileNotFoundException(
          $"O template de e-mail '{fileName}' não foi encontrado fisicamente. " +
          $"Verifique se ele existe na pasta 'EmailTemplates' e se a propriedade CopyToOutputDirectory está ativa.");
    }

    // Lê o conteúdo do arquivo texto puro
    var contentFile = File.ReadAllText(caminhoArquivo);

    SetHtmlBody(contentFile);
    return this;
  }


  // Renomeado e protegido contra warnings de nulo no .NET 11
  public EmailHandler SetVariable(string varName, string? value)
  {
    // O '?? ""' garante que se o corpo estiver nulo por algum motivo, ele vire uma string vazia antes do Replace
    var corpoHtmlAtual = _email.HtmlBody ?? "";

    // Executa a substituição da sua variável (ex: "{{Nome}}")
    _email.HtmlBody = corpoHtmlAtual.Replace(varName, value ?? "");

    // Atualiza o corpo da mensagem real do MailKit com o novo texto modificado
    var bodyBuilder = new BodyBuilder { HtmlBody = _email.HtmlBody };
    _emailMessage.Body = bodyBuilder.ToMessageBody();

    return this; // Mantém a sua Interface Fluente impecável
  }


  public async Task<Email> SendEmailAsync()
  {
    try
    {
      var hasCorporation = _email.CorporationId != Guid.Empty;

      if (hasCorporation)
      {
        // Salva o registro no banco antes de enviar (Outbox Pattern)
        await _emailRepository.AddAsync(_email);
        await _unitOfWork.SaveChangesAsync();
      }

      using var smtp = new SmtpClient
      {
        CheckCertificateRevocation = false
      };

      var server = _configuration["SmtpSettings:Server"];
      var port = int.Parse(_configuration["SmtpSettings:Port"] ?? "587");
      var password = _configuration["SmtpSettings:Password"];

      await smtp.ConnectAsync(server!, port, SecureSocketOptions.StartTls);
      await smtp.AuthenticateAsync(_senderEmail, password!);
      await smtp.SendAsync(_emailMessage);
      await smtp.DisconnectAsync(true);

      _email.MailSent = true;

      if (hasCorporation)
      {
        _emailRepository.Update(_email);
        await _unitOfWork.SaveChangesAsync();
      }

      return _email;
    }
    catch (Exception)
    {
      _email.MailSent = false;
      return _email;
    }
  }

  public EmailHandler LoadEmail(Email email)
  {
    Subject(email.Subject);

    if (email.IsHtmlBody)
      SetHtmlBody(email.HtmlBody);
    else
      SetHtmlBody(email.TextBody);

    // Corrigido os loops para usarem os nomes certos das propriedades e coleções virtuais
    foreach (var mailTo in email.EmailTo)
    {
      if (string.IsNullOrEmpty(mailTo.Mail)) continue;
      MailTo(mailTo.Mail, mailTo.Name);
    }

    foreach (var mailFrom in email.EmailFrom)
    {
      if (string.IsNullOrEmpty(mailFrom.Mail)) continue;
      MailFrom(mailFrom.Mail, mailFrom.Name);
    }

    foreach (var mailCc in email.EmailCc)
    {
      if (string.IsNullOrEmpty(mailCc.Mail)) continue;
      MailCc(mailCc.Mail, mailCc.Name);
    }

    foreach (var mailBcc in email.EmailBcc)
    {
      if (string.IsNullOrEmpty(mailBcc.Mail)) continue;
      MailBcc(mailBcc.Mail, mailBcc.Name);
    }

    return this;
  }
}
