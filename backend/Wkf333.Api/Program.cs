using Morphus.Application.Dtos.Mappings;
using Morphus.CrossCutting.IoC;

var builder = WebApplication.CreateBuilder(args);

AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

builder.Services.AddOpenApi();
builder.Services.AddControllers();
builder.Services.AddW3DbContext(builder.Configuration);
builder.Services.AddInfrastructure();
builder.Services.AddJsonConfigurations();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddW3AddAuthentication(builder.Configuration);
builder.Services.AddAuthorizationBuilder();
builder.Services.AddCors(builder.Configuration);
builder.Services.AddAutoMapper(cfg => { }, typeof(DataToDto));

DependencyInjection.CreateApplicationsAuthorizations(builder);

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
  app.MapOpenApi();
}

app.UseCors("AllowCredentials");
app.UseStaticFiles();
app.UseHttpsRedirection();
app.MapControllers();
app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();
app.Run();
