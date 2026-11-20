# Morphus Backend — Design Patterns & Coding Standards (`mpx-backend.designpatterns`)

> [!IMPORTANT]
> **Lei Suprema de Padronização do Backend Morphus (`mpx-backend`)**:
> Este documento define a arquitetura oficial em 6 camadas (`Mpx.slnx`), o isolamento absoluto do motor genérico em `Mpx.Core`, a estrutura de pastas, a regra estrita de 1 classe/interface/enum por arquivo com nome idêntico ao tipo (`PascalCase.cs`), o padrão de nomenclatura `Mpx*` / `IMpx*` e a organização de DTOs por entidade. Nenhuma classe, interface, repositório, handler, validator ou controller deve ser criado fora destas diretrizes.

---

## 1. Arquitetura da Solution (`Mpx.slnx`) e as 6 Camadas

O arquivo oficial da Solution na raiz de `mpx-backend/` chama-se **`Mpx.slnx`**. Não criar pastas ou arquivos soltos de protótipo/rascunho (`.http`, `.morphus-studio`, diagramas soltos ou `.gitkeep` em pastas já populadas).

### 1.1. Pirâmide de Dependências e o Papel do `Mpx.Core`

O projeto **`Mpx.Core`** é a base universal do motor Morphus: **ele não depende de nenhum outro projeto `Mpx.*`, e todos os outros 5 projetos enxergam o `Mpx.Core`**.

```text
                  ┌──────────────────────┐
                  │       Mpx.Core       │  ◄── Motor Puro do Morphus (100% Genérico <T>)
                  │ (Todo mundo vê ele!) │      Zero entidades ou regras de negócio específicas!
                  └──────────▲───────────┘
                             │
       ┌──────────────┬──────┴───────┬──────────────┬──────────────┐
       │              │              │              │              │
  Mpx.Domain   Mpx.Infrastructure  Mpx.Application  Mpx.Api  Mpx.CrossCutting
```

### 1.2. Responsabilidade e Estrutura de Pastas de Cada Projeto

```text
mpx-backend/
 ├── Mpx.slnx
 ├── Dockerfile
 │
 ├── Mpx.Core/                         ➔ Motor Genérico Puro (<T>) e Utilitários Base
 │    ├── Controllers/                 ➔ IMpxController.cs, MpxController.cs
 │    ├── Dtos/                        ➔ IMpxProjection.cs, MpxProjection.cs, MpxDto.cs, MpxRelatedDto.cs, MpxDeleteDependencySummary.cs
 │    ├── Entities/                    ➔ MpxEntity.cs, MpxRelatedEntity.cs
 │    ├── Filters/                     ➔ MpxFilter.cs, MpxFilterParameter.cs
 │    ├── Handlers/                    ➔ IMpxHandler.cs, MpxHandler.cs
 │    ├── Interfaces/                  ➔ IMpxRepository.cs, IMpxTenant.cs, IMpxTransaction.cs, IUnitOfWork.cs
 │    ├── Security/                    ➔ MpxKey.cs, MpxSecurity.cs
 │    └── Validators/                  ➔ IMpxValidator.cs, MpxValidator.cs, MpxDocumentValidator.cs
 │
 ├── Mpx.Domain/                       ➔ Entidades de Negócio, Contratos de Repositório e Modelos de Segurança
 │    ├── Entities/                    ➔ Agrupadas em subpastas por domínio (mantendo namespace Mpx.Domain.Entities):
 │    │    ├── Mail/                   ➔ Email.cs, EmailBcc.cs, EmailCc.cs, EmailFrom.cs, EmailTo.cs
 │    │    ├── Morphus/                ➔ Application.cs, Corporation.cs, Workspace.cs, Menu.cs, Category.cs...
 │    │    ├── Security/               ➔ User.cs, Role.cs, Claim.cs, Module.cs, SubModule.cs, UserStatus.cs...
 │    │    ├── Website/                ➔ Feature.cs, FeatureHighlight.cs, ModuleCategory.cs, ShowcaseModule.cs
 │    │    └── Workflow/               ➔ WorkflowType.cs, Station.cs, StationType.cs, WorkflowTypeConfig.cs, Workflow.cs...
 │    ├── Interfaces/                  ➔ Exclusivamente contratos de repositórios de entidades (IUserRepository.cs, ICorporationRepository.cs...)
 │    └── Security/                    ➔ MpxAccountSeed.cs, MpxSession.cs e classes individuais de Request/Response de Segurança
 │
 ├── Mpx.Application/                  ➔ Casos de Uso, DTOs por Entidade, Handlers e Validators
 │    ├── Dtos/
 │    │    ├── Application/            ➔ ApplicationReflectedDto.cs, ApplicationDto.cs, etc.
 │    │    ├── Corporation/            ➔ CorporationReflectedDto.cs, CorporationDto.cs
 │    │    ├── User/                   ➔ UserReflectedDto.cs, UserDto.cs
 │    │    └── <Entity>/               ➔ 1 subpasta por entidade / contexto, 1 classe por arquivo
 │    ├── EmailTemplates/              ➔ Templates HTML transacionais
 │    ├── Handlers/                    ➔ Handlers de negócio herdando de MpxHandler<T>
 │    └── Validators/
 │         ├── Corporation/            ➔ ICorporationValidator.cs, CorporationValidator.cs
 │         └── Workspace/              ➔ IWorkspaceValidator.cs, WorkspaceValidator.cs
 │
 ├── Mpx.Infrastructure/               ➔ Persistência EF Core, PostgreSQL e Multi-Tenant
 │    ├── Data/                        ➔ NENHUM arquivo solto diretamente na raiz de Data/
 │    │    ├── Core/                   ➔ MpxDbContext.cs, MpxDbContextFactory.cs, MpxTransaction.cs, MpxRepository.cs
 │    │    ├── EntitiesConfiguration/  ➔ Configurações Fluent API (*Configuration.cs)
 │    │    ├── Migrations/             ➔ Migrations do EF Core e MpxDbContextModelSnapshot.cs
 │    │    └── Repositories/           ➔ Exclusivamente repositórios das entidades (*Repository.cs)
 │    ├── Interfaces/                  ➔ ITenantProvider.cs
 │    └── MultiTenant/                 ➔ TenantProvider.cs, DesignTimeTenantProvider.cs
 │
 ├── Mpx.CrossCutting/                 ➔ Injeção de Dependência, Políticas JWT/Claims e Bootstrap de Banco
 │    └── DependencyInjection.cs
 │
 └── Mpx.Api/                          ➔ Camada de Entrada HTTP / REST Controllers
      ├── Controllers/                 ➔ Controllers de negócio herdando de MpxController<T>
      └── Program.cs
```

---

## 2. Premissa Inegociável: 1 Arquivo = 1 Única Classe / Interface / Enum

- **PROIBIDO declarar duas ou mais `class`, `interface`, `enum` ou `record` dentro do mesmo arquivo `.cs`.**
- **PROIBIDO declarar classes ou `records` auxiliares de Request/Response no rodapé de Controllers, Handlers ou Factories.** Todo objeto de transporte ou modelo deve possuir seu próprio arquivo `.cs` individual.
- **Nome do Arquivo = Nome Exato do Tipo**:
  - Diferente do Frontend (onde usamos sufixos `.component.ts`, `.enum.ts`), no Backend C# **o nome do arquivo é 100% idêntico ao nome da classe, interface ou enum em `PascalCase.cs`**:
    - `public class MpxFilter` ➔ `MpxFilter.cs`
    - `public class MpxFilterParameter` ➔ `MpxFilterParameter.cs`
    - `public class UserReflectedDto` ➔ `UserReflectedDto.cs`
    - `public class UserDto` ➔ `UserDto.cs`
    - `public interface IMpxValidator<T>` ➔ `IMpxValidator.cs`

---

## 3. Padrões de Nomenclatura (`Mpx*`, `IMpx*` e Entidades de Negócio)

### 3.1. Classes e Interfaces do Motor (`Mpx*` e `IMpx*`)
- Toda classe pertencente ao motor/framework Morphus (em `Mpx.Core` e `Mpx.Infrastructure/Data/Core`) começa obrigatoriamente com o prefixo **`Mpx`**:
  - `MpxEntity`, `MpxRelatedEntity`
  - `MpxDto<TEntity, TDto>`, `MpxRelatedDto`, `MpxProjection<TEntity, TDto>`, `MpxDeleteDependencySummary<T>`
  - `MpxHandler<T>`, `MpxValidator<T>`, `MpxDocumentValidator`, `MpxController<T>`
  - `MpxKey`, `MpxSecurity`, `MpxFilter`, `MpxFilterParameter`
  - `MpxDbContext`, `MpxDbContextFactory`, `MpxTransaction`, `MpxRepository<TEntity>`
- **Interfaces no Backend são sempre contratos reais** e começam obrigatoriamente com **`I`** tanto no nome da interface quanto no nome do arquivo:
  - Contratos do motor: `IMpxController<T>`, `IMpxHandler<T>`, `IMpxValidator<T>`, `IMpxRepository<TEntity>`, `IMpxProjection<TEntity, TDto>`, `IMpxTenant`, `IMpxTransaction`.
  - Contratos de negócio: `IUserRepository`, `ICorporationRepository`, `ICorporationValidator`, `IWorkspaceValidator`.

### 3.2. Entidades de Negócio (Nomes Limpos, Sem Prefixo `Mpx`)
- Entidades de negócio em `Mpx.Domain/Entities/` representam tabelas reais do domínio e **NÃO** levam prefixo `Mpx` ou `Morphus`, mantendo paridade 1:1 com as entidades do Frontend:
  - `Application.cs`, `Corporation.cs`, `Workspace.cs`, `User.cs`, `Role.cs`, `Claim.cs`, `Module.cs`, `SubModule.cs`, `Menu.cs`, `Category.cs`, `Email.cs`, etc.
- **Resolução do Conflito de Namespace `Application` no C#**:
  - Como o projeto da camada de aplicação se chama `Mpx.Application`, nos arquivos dentro de `Mpx.Application` ou `Mpx.Api` que referenciam a entidade `Application`, declarar o alias abaixo da linha do `namespace`:
    ```csharp
    namespace Mpx.Application.Handlers;

    using Application = Mpx.Domain.Entities.Application;
    ```

### 3.3. Geração de Chaves Únicas (`MpxKey`)
- Toda geração de chave única de 12 caracteres (`Key`) no ecossistema é responsabilidade central do **`Mpx.Core.Security.MpxKey`** (`MpxKey.Generate()`), consumida por `MpxEntity`, `MpxDbContext` e `MpxAccountSeed`.

---

## 4. Organização de DTOs (`Mpx.Application/Dtos/<Entity>/`)

1. **Separação em Subpastas por Entidade**:
   - Dentro de `Mpx.Application/Dtos/`, nenhum arquivo `.cs` fica solto na raiz da pasta `Dtos/`.
   - Cada entidade ou contexto possui sua própria subpasta (`Dtos/User/`, `Dtos/Corporation/`, `Dtos/Application/`, `Dtos/Workspace/`, `Dtos/Role/`, `Dtos/Claim/`, `Dtos/UserRole/`, etc.) mantendo o namespace unificado `namespace Mpx.Application.Dtos;`.
2. **Separação Estrita entre `*ReflectedDto.cs` e `*Dto.cs` (1 Classe por Arquivo)**:
   - **`<Entity>ReflectedDto.cs`**: Herda de `MpxDto<TEntity, TEntityReflectedDto>`. Contém apenas as propriedades escalares 1:1 da tabela e o `BaseProjection`. É usado também como tipo das propriedades filhas/navegações em outros DTOs para evitar ciclos de referência.
   - **`<Entity>Dto.cs`**: Herda de `<Entity>ReflectedDto` e implementa `IMpxProjection<TEntity, TEntityDto>`. Contém as propriedades de navegação (`Corporation`, `Roles`, `Claims`, `Workspaces`, etc.) e os métodos fluentes `.WithCorporation()`, `.WithRoles()`, `.WithClaims()` baseados em `Include<TDto, TProp>(...)`.

---

## 5. Higiene de Código e `using` Directives

1. **Zero `using` Não Utilizados (`IDE0005`)**:
   - Nenhum arquivo `.cs` pode manter diretivas `using` que não sejam efetivamente utilizadas no corpo do arquivo (ex.: nunca deixar `using Microsoft.EntityFrameworkCore;` em arquivos que não executam métodos do EF Core).
2. **Namespaces `File-Scoped` (`namespace Mpx...;`)**:
   - Utilizar sempre a sintaxe moderna de `namespace` com ponto e vírgula em linha única no topo do arquivo (`namespace Mpx.Core.Entities;`), economizando um nível inteiro de indentação em todas as classes.
3. **Compilação Limpa Obrigatória**:
   - Qualquer alteração no `mpx-backend` só é considerada concluída quando `dotnet build Mpx.slnx` compilar com **0 Erros e 0 Avisos (0 Warnings)**.
