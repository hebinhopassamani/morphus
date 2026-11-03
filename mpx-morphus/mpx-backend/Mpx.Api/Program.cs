using Mpx.CrossCutting;

var builder = WebApplication.CreateBuilder(args);

builder.AddMorphusDependecyInjection();

builder.Services.AddOpenApi();
builder.Services.AddControllers();

var app = builder.Build();

app.ApplyMorphusMigrations();

// 1. O CORS DEVE SER O PRIMEIRO DE TUDO (Garante que limpe o Preflight/OPTIONS)
app.UseCors("MorphusCorsPolicy");

// 2. MIDDLEWARE GLOBAL DE TRATAMENTO DE VALIDAÇÕES E REGRAS DE NEGÓCIO
app.Use(async (context, next) =>
{
  try
  {
    await next();
  }
  catch (ArgumentException ex)
  {
    context.Response.StatusCode = StatusCodes.Status400BadRequest;
    await context.Response.WriteAsJsonAsync(new { message = ex.Message });
  }
  catch (InvalidOperationException ex)
  {
    context.Response.StatusCode = StatusCodes.Status400BadRequest;
    await context.Response.WriteAsJsonAsync(new { message = ex.Message });
  }
});

if (app.Environment.IsDevelopment())
{
  app.MapOpenApi();
  app.UseHttpsRedirection();
}

// 3. SEGURANÇA NA ORDEM PERFEITA (Autentica primeiro, autoriza depois)
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

