using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Morphus.Mail;
using MyBackgroundWorker;

HostApplicationBuilder builder = Host.CreateApplicationBuilder(args);

builder.Services.AddDbContext<MorphusContext>(options => options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddTransient<IEmailService, EmailService>();
builder.Services.AddHostedService<Worker>();

IHost host = builder.Build();
host.Run();
