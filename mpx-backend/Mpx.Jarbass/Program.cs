using Mpx.CrossCutting;
using Mpx.Jarbass.Security;
using Mpx.Jarbass.Workers;

var builder = Host.CreateApplicationBuilder(args);

builder.Services.AddWindowsService(options =>
{
  options.ServiceName = builder.Configuration["Jarbass:ServiceName"] ?? "Morphus Jarbass";
});

builder.Services.AddMorphusWorkerDependencyInjection(builder.Configuration);
builder.Services.AddSingleton<JarbassTimeGuard>();
builder.Services.AddSingleton<JarbassFileVaultGuardian>();
builder.Services.AddSingleton<JarbassExecutionCoordinator>();

// Registro de Workers Independentes (cada um com seu próprio relógio e escopo isolado)
builder.Services.AddHostedService<JarbassCatalogWorker>();
builder.Services.AddHostedService<JarbassEmailWorker>();
builder.Services.AddHostedService<JarbassWorkflowWorker>();
builder.Services.AddHostedService<JarbassKalupaWorker>();
builder.Services.AddHostedService<JarbassMaintenanceWorker>();

var host = builder.Build();
host.Run();
