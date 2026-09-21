using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;

namespace Morphus.CrossCutting.IoC;

/// <summary>
/// Essa classe se voce descomentar a primeira linha do addScope, 
/// toda vez que uma policy e requisitada ela é chamada, entao vc pode
/// criar uma nova poicy caso a posicy requisitada nao exista e passar
/// essa nova policy, e assim atender aos requisitos de authorization
/// </summary> <summary>
/// 
/// </summary>
public class CustomAuthorizationPolicyProvider(
    IOptions<AuthorizationOptions> options,
    IServiceProvider serviceProvider) : DefaultAuthorizationPolicyProvider(options)
{
  // Use IServiceProvider para resolver serviços com escopo (como DbContext) 
  // dentro de um serviço singleton (o PolicyProvider é um singleton)
  private readonly IServiceProvider _serviceProvider = serviceProvider;

  // Este é o método chave para resolver políticas dinamicamente
  public override async Task<AuthorizationPolicy?> GetPolicyAsync(string policyName)
  {
    // Tenta obter a política padrão/estática primeiro
    var policy = await base.GetPolicyAsync(policyName);
    if (policy != null)
    {
      return policy;
    }

    // Lógica para criar a política dinamicamente
    // Exemplo: buscar requisitos de permissão em um DB
    if (policyName.StartsWith("PermissionRequirement:"))
    {
      // Extrai a permissão do nome da política
      var permission = policyName.Substring("PermissionRequirement:".Length);

      // Em um cenário real, você buscaria os requisitos no banco de dados aqui
      // Para simplificar, vamos criar uma política básica
      var policyBuilder = new AuthorizationPolicyBuilder();
      policyBuilder.RequireClaim("Permission", permission);
      return policyBuilder.Build();
    }

    return null;
  }
}
