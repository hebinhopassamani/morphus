using System.Text;
using System.Text.Json.Serialization;

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;

using Mpx.Application.Handlers;
using Mpx.Application.Validators;
using Mpx.Core.Interfaces;
using Mpx.Domain.Entities;
using Mpx.Domain.Interfaces;
using Mpx.Domain.Security;
using Mpx.Infrastructure.Data.Core;
using Mpx.Infrastructure.Data.Repositories;
using Mpx.Infrastructure.Interfaces;
using Mpx.Infrastructure.MultiTenant;

using Npgsql;

namespace Mpx.CrossCutting;

public static class DependencyInjection
{
  public static WebApplicationBuilder AddMorphusDependencyInjection(this WebApplicationBuilder builder)
  {
    AddCors(builder);
    AddMpxDbContext(builder.Services, builder.Configuration);
    AddDependencyInjection(builder.Services);
    AddJsonSettings(builder);
    AddMpxJwtAuthentication(builder);
    AddMpxAuthorizationPolicies(builder);

    return builder;
  }

  public static IServiceCollection AddMorphusWorkerDependencyInjection(this IServiceCollection services, IConfiguration configuration)
  {
    AddMpxDbContext(services, configuration);
    AddDependencyInjection(services);

    return services;
  }

  public static void SyncMorphusEntityCatalog(this IServiceProvider services)
  {
    using var scope = services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<MpxDbContext>();
    SeedSystemEntityCatalog(dbContext);
  }

  public static WebApplication ApplyMorphusMigrations(this WebApplication app)
  {
    using var scope = app.Services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<MpxDbContext>();

    if (string.Equals(Environment.GetEnvironmentVariable("RESET_MORPHUS_DB"), "true", StringComparison.OrdinalIgnoreCase))
    {
      dbContext.Database.ExecuteSqlRaw("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
      Console.WriteLine(">>> SCHEMA PUBLIC RECRIADO DO ZERO! <<<");
    }

    dbContext.Database.Migrate();

    dbContext.Database.ExecuteSqlRaw("""
        ALTER TABLE sec_users ADD COLUMN IF NOT EXISTS first_name character varying(20) NULL;
        ALTER TABLE sec_users ADD COLUMN IF NOT EXISTS last_name character varying(20) NULL;
        CREATE TABLE IF NOT EXISTS mpx_corporation_domains (
            id uuid NOT NULL PRIMARY KEY,
            corporation_id uuid NOT NULL REFERENCES mpx_corporations(id) ON DELETE RESTRICT,
            domain_name character varying(150) NOT NULL UNIQUE,
            origin_type character varying(40) NOT NULL DEFAULT 'CustomerOwned',
            verification_status character varying(40) NOT NULL DEFAULT 'PendingVerification',
            verification_token character varying(120) NULL,
            is_primary boolean NOT NULL DEFAULT false,
            key character varying(100) NOT NULL UNIQUE,
            system boolean NOT NULL DEFAULT false,
            inactive boolean NOT NULL DEFAULT false,
            description character varying(120) NULL
        );
        CREATE TABLE IF NOT EXISTS mpx_corporation_domain_records (
            id uuid NOT NULL PRIMARY KEY,
            corporation_id uuid NOT NULL REFERENCES mpx_corporations(id) ON DELETE RESTRICT,
            corporation_domain_id uuid NOT NULL REFERENCES mpx_corporation_domains(id) ON DELETE CASCADE,
            record_type character varying(20) NOT NULL DEFAULT 'CNAME',
            host_name character varying(150) NOT NULL,
            value character varying(500) NOT NULL,
            ttl integer NOT NULL DEFAULT 3600,
            key character varying(100) NOT NULL UNIQUE,
            system boolean NOT NULL DEFAULT false,
            inactive boolean NOT NULL DEFAULT false,
            description character varying(120) NULL
        );
        CREATE TABLE IF NOT EXISTS mpx_application_settings (
            id uuid NOT NULL PRIMARY KEY,
            corporation_id uuid NOT NULL REFERENCES mpx_corporations(id) ON DELETE RESTRICT,
            application_id uuid NOT NULL REFERENCES mpx_applications(id) ON DELETE CASCADE,
            setting_key character varying(80) NOT NULL,
            label character varying(150) NOT NULL,
            value_type character varying(40) NOT NULL DEFAULT 'string',
            value character varying(500) NOT NULL DEFAULT '',
            endpoint_url character varying(300) NULL,
            refresh_policy character varying(40) NOT NULL DEFAULT 'manual',
            is_locked_system boolean NOT NULL DEFAULT false,
            "order" integer NOT NULL DEFAULT 0,
            key character varying(100) NOT NULL UNIQUE,
            system boolean NOT NULL DEFAULT false,
            inactive boolean NOT NULL DEFAULT false,
            description character varying(120) NULL,
            CONSTRAINT uq_mpx_application_settings_app_key UNIQUE (application_id, setting_key)
        );
        ALTER TABLE mpx_workspace_applications ADD COLUMN IF NOT EXISTS trial_start_date timestamp with time zone NULL;
        ALTER TABLE mpx_workspace_applications ADD COLUMN IF NOT EXISTS trial_days integer NULL;
        ALTER TABLE mpx_workspace_applications ADD COLUMN IF NOT EXISTS trial_used boolean NOT NULL DEFAULT false;
        ALTER TABLE mpx_workspace_applications ADD COLUMN IF NOT EXISTS shared_with_workspace_id uuid NULL;
        ALTER TABLE mpx_workspace_applications ADD COLUMN IF NOT EXISTS "default" boolean NOT NULL DEFAULT false;
        ALTER TABLE mpx_applications ADD COLUMN IF NOT EXISTS available_for_trial boolean NOT NULL DEFAULT false;
        ALTER TABLE mpx_applications ADD COLUMN IF NOT EXISTS "default" boolean NOT NULL DEFAULT false;
        ALTER TABLE mpx_applications ADD COLUMN IF NOT EXISTS layout_key character varying(60) NOT NULL DEFAULT 'sidebar-default';
        ALTER TABLE mpx_applications ADD COLUMN IF NOT EXISTS custom_layout_html text NULL;
        ALTER TABLE mpx_applications ADD COLUMN IF NOT EXISTS domain_mode character varying(40) NOT NULL DEFAULT 'MorphusSuggested';
        ALTER TABLE mpx_applications ADD COLUMN IF NOT EXISTS subdomain character varying(80) NULL;
        ALTER TABLE mpx_applications ADD COLUMN IF NOT EXISTS corporation_domain_id uuid NULL REFERENCES mpx_corporation_domains(id) ON DELETE SET NULL;
        ALTER TABLE mpx_applications ADD COLUMN IF NOT EXISTS full_domain character varying(180) NULL;
        ALTER TABLE mpx_application_users ADD COLUMN IF NOT EXISTS workspace_id uuid NULL;
        ALTER TABLE mpx_application_users ADD COLUMN IF NOT EXISTS color character varying(250) NULL;
        ALTER TABLE mpx_application_users ADD COLUMN IF NOT EXISTS favorite boolean NOT NULL DEFAULT false;
        ALTER TABLE mpx_workspace_users ADD COLUMN IF NOT EXISTS color character varying(50) NULL;
        ALTER TABLE mpx_workspace_users ADD COLUMN IF NOT EXISTS favorite boolean NOT NULL DEFAULT false;
        ALTER TABLE mpx_corporation_users ADD COLUMN IF NOT EXISTS color character varying(50) NULL;
        ALTER TABLE mpx_corporation_users ADD COLUMN IF NOT EXISTS favorite boolean NOT NULL DEFAULT false;
        ALTER TABLE mpx_application_sub_modules ADD COLUMN IF NOT EXISTS route_pattern character varying(150) NULL;
        ALTER TABLE mpx_application_sub_modules ADD COLUMN IF NOT EXISTS "default" boolean NOT NULL DEFAULT false;
        ALTER TABLE mpx_application_sub_modules ADD COLUMN IF NOT EXISTS html_content text NULL;
        ALTER TABLE mpx_application_sub_modules ADD COLUMN IF NOT EXISTS custom_html_content text NULL;
        ALTER TABLE mpx_application_sub_modules ADD COLUMN IF NOT EXISTS css_content text NULL;
        ALTER TABLE mpx_application_sub_modules ADD COLUMN IF NOT EXISTS ts_content text NULL;
        ALTER TABLE mpx_application_sub_modules ADD COLUMN IF NOT EXISTS js_content text NULL;
        ALTER TABLE mpx_application_sub_modules ADD COLUMN IF NOT EXISTS is_custom_html boolean NOT NULL DEFAULT false;
        UPDATE mpx_applications SET description = LEFT(description, 120) WHERE description IS NOT NULL AND LENGTH(description) > 120;
        ALTER TABLE mpx_applications ALTER COLUMN description TYPE character varying(120);
        UPDATE mpx_workspaces SET description = LEFT(description, 120) WHERE description IS NOT NULL AND LENGTH(description) > 120;
        ALTER TABLE mpx_workspaces ALTER COLUMN description TYPE character varying(120);
        UPDATE mpx_corporations SET description = LEFT(description, 120) WHERE description IS NOT NULL AND LENGTH(description) > 120;
        ALTER TABLE mpx_corporations ALTER COLUMN description TYPE character varying(120);
        UPDATE mpx_modules SET description = 'Gestão granular de usuários, perfis e permissões isolados por corporação, filial, workspace e aplicação.' WHERE title = 'Acessos e Permissões';
        UPDATE mpx_modules SET description = 'Estrutura hierárquica entre matriz e múltiplas filiais, permitindo alternar de ambiente com apenas um clique.' WHERE title = 'Corporações e Filiais';
        UPDATE mpx_modules SET description = LEFT(description, 120) WHERE LENGTH(description) > 120;
        ALTER TABLE mpx_modules ALTER COLUMN description TYPE character varying(120);
        UPDATE mpx_application_modules SET name = LEFT(name, 20) WHERE LENGTH(name) > 20;
        UPDATE mpx_application_modules SET label = LEFT(label, 20) WHERE LENGTH(label) > 20;
        ALTER TABLE mpx_application_modules ALTER COLUMN name TYPE character varying(20);
        ALTER TABLE mpx_application_modules ALTER COLUMN label TYPE character varying(20);
        UPDATE mpx_application_sub_modules SET name = LEFT(name, 20) WHERE LENGTH(name) > 20;
        UPDATE mpx_application_sub_modules SET label = LEFT(label, 20) WHERE LENGTH(label) > 20;
        ALTER TABLE mpx_application_sub_modules ALTER COLUMN name TYPE character varying(20);
        ALTER TABLE mpx_application_sub_modules ALTER COLUMN label TYPE character varying(20);
        CREATE TABLE IF NOT EXISTS mpx_parameter_scopes (
            id uuid NOT NULL PRIMARY KEY,
            corporation_id uuid NULL REFERENCES mpx_corporations(id) ON DELETE RESTRICT,
            code smallint NOT NULL DEFAULT 0,
            name character varying(80) NOT NULL,
            label character varying(150) NOT NULL,
            is_system_sovereign boolean NOT NULL DEFAULT false,
            is_exportable_to_jarbass boolean NOT NULL DEFAULT false,
            icon character varying(100) NULL,
            color character varying(50) NULL,
            "order" integer NOT NULL DEFAULT 0,
            description text NULL,
            key character varying(100) NOT NULL UNIQUE,
            system boolean NOT NULL DEFAULT false,
            inactive boolean NOT NULL DEFAULT false,
            created_at timestamp with time zone NOT NULL DEFAULT now(),
            updated_at timestamp with time zone NOT NULL DEFAULT now()
        );
        CREATE TABLE IF NOT EXISTS mpx_parameters (
            id uuid NOT NULL PRIMARY KEY,
            corporation_id uuid NULL REFERENCES mpx_corporations(id) ON DELETE RESTRICT,
            scope_id uuid NOT NULL REFERENCES mpx_parameter_scopes(id) ON DELETE RESTRICT,
            scope_code smallint NOT NULL DEFAULT 0,
            workspace_id uuid NULL REFERENCES mpx_workspaces(id) ON DELETE SET NULL,
            application_id uuid NULL REFERENCES mpx_applications(id) ON DELETE SET NULL,
            user_id uuid NULL REFERENCES sec_users(id) ON DELETE SET NULL,
            machine_key character varying(120) NULL,
            namespace character varying(100) NOT NULL,
            name character varying(150) NOT NULL,
            settings_json text NOT NULL,
            is_locked_by_sovereign boolean NOT NULL DEFAULT false,
            is_exportable boolean NOT NULL DEFAULT true,
            description text NULL,
            key character varying(100) NOT NULL UNIQUE,
            system boolean NOT NULL DEFAULT false,
            inactive boolean NOT NULL DEFAULT false,
            created_at timestamp with time zone NOT NULL DEFAULT now(),
            updated_at timestamp with time zone NOT NULL DEFAULT now()
        );
        CREATE TABLE IF NOT EXISTS mpx_component_types (
            id uuid NOT NULL PRIMARY KEY,
            corporation_id uuid NULL REFERENCES mpx_corporations(id) ON DELETE RESTRICT,
            code smallint NOT NULL DEFAULT 2,
            tag_name character varying(80) NOT NULL,
            name character varying(100) NOT NULL,
            label character varying(150) NOT NULL,
            is_container_wrapper boolean NOT NULL DEFAULT false,
            supports_workflow_action boolean NOT NULL DEFAULT false,
            supports_reflected_field boolean NOT NULL DEFAULT false,
            default_parameters_json text NOT NULL,
            icon character varying(100) NULL,
            color character varying(50) NULL,
            "order" integer NOT NULL DEFAULT 0,
            description text NULL,
            key character varying(100) NOT NULL UNIQUE,
            system boolean NOT NULL DEFAULT false,
            inactive boolean NOT NULL DEFAULT false,
            created_at timestamp with time zone NOT NULL DEFAULT now(),
            updated_at timestamp with time zone NOT NULL DEFAULT now()
        );
        CREATE TABLE IF NOT EXISTS mpx_screen_components (
            id uuid NOT NULL PRIMARY KEY,
            corporation_id uuid NOT NULL REFERENCES mpx_corporations(id) ON DELETE RESTRICT,
            component_type_id uuid NOT NULL REFERENCES mpx_component_types(id) ON DELETE RESTRICT,
            route_id uuid NULL REFERENCES mpx_routes(id) ON DELETE SET NULL,
            workflow_type_id uuid NULL REFERENCES wkf_types(id) ON DELETE SET NULL,
            station_id uuid NULL REFERENCES wkf_stations(id) ON DELETE SET NULL,
            workflow_config_id uuid NULL REFERENCES wkf_type_configs(id) ON DELETE SET NULL,
            workflow_action_id uuid NULL REFERENCES wkf_type_config_actions(id) ON DELETE SET NULL,
            entity_property_id uuid NULL REFERENCES mpx_entity_properties(id) ON DELETE SET NULL,
            parent_component_id uuid NULL REFERENCES mpx_screen_components(id) ON DELETE SET NULL,
            component_code character varying(120) NOT NULL,
            label character varying(150) NOT NULL,
            trigger_event character varying(60) NOT NULL DEFAULT 'OnClick',
            embedded_config_json text NOT NULL,
            "order" integer NOT NULL DEFAULT 0,
            description text NULL,
            key character varying(100) NOT NULL UNIQUE,
            system boolean NOT NULL DEFAULT false,
            inactive boolean NOT NULL DEFAULT false,
            created_at timestamp with time zone NOT NULL DEFAULT now(),
            updated_at timestamp with time zone NOT NULL DEFAULT now()
        );
        """);

    if (!dbContext.Features.Any() || !dbContext.ModuleCategories.Any())
    {
      var (features, categories) = MpxAccountSeed.CreateDefaultShowcaseContent();
      if (!dbContext.Features.Any())
      {
        dbContext.Features.AddRange(features);
      }
      if (!dbContext.ModuleCategories.Any())
      {
        dbContext.ModuleCategories.AddRange(categories);
      }
      dbContext.SaveChanges();
      Console.WriteLine(">>> TABELAS SHOWCASE DA HOME (mpx_features / mpx_modules) POPULADAS COM SUCESSO! <<<");
    }

    SeedSystemWorkflowAndErrorFoundations(dbContext);
    SeedSystemEntityCatalog(dbContext);

    if ((string.Equals(Environment.GetEnvironmentVariable("RESET_MORPHUS_DB"), "true", StringComparison.OrdinalIgnoreCase) &&
         string.Equals(Environment.GetEnvironmentVariable("RESET_MORPHUS_DB_EXIT"), "true", StringComparison.OrdinalIgnoreCase)) ||
        string.Equals(Environment.GetEnvironmentVariable("SEED_MORPHUS_DB_EXIT"), "true", StringComparison.OrdinalIgnoreCase))
    {
      Environment.Exit(0);
    }

    return app;
  }

  private static void SeedSystemWorkflowAndErrorFoundations(MpxDbContext dbContext)
  {
    var hasChanges = false;

    if (!dbContext.ErrorSeverities.IgnoreQueryFilters().Any(s => s.CorporationId == null && s.System))
    {
      dbContext.ErrorSeverities.AddRange(
        new MpxErrorSeverity { CorporationId = null, System = true, Code = Mpx.Domain.Enums.MpxErrorSeverityEnum.Low, Label = "0 - Baixa severidade", InvolvesEntireWorkspace = false, InvolvesEntireCorporation = false, Icon = "info", Color = "#3b82f6", Order = 0, Description = "Erro de baixa severidade, sem impacto crítico na operação." },
        new MpxErrorSeverity { CorporationId = null, System = true, Code = Mpx.Domain.Enums.MpxErrorSeverityEnum.Medium, Label = "1 - Média severidade", InvolvesEntireWorkspace = false, InvolvesEntireCorporation = false, Icon = "alert-circle", Color = "#f59e0b", Order = 1, Description = "Erro de média severidade que requer atenção da equipe responsável." },
        new MpxErrorSeverity { CorporationId = null, System = true, Code = Mpx.Domain.Enums.MpxErrorSeverityEnum.High, Label = "2 - Alta severidade", InvolvesEntireWorkspace = false, InvolvesEntireCorporation = false, Icon = "alert-triangle", Color = "#ef4444", Order = 2, Description = "Erro de alta severidade com bloqueio de etapa ou funcionalidade." },
        new MpxErrorSeverity { CorporationId = null, System = true, Code = Mpx.Domain.Enums.MpxErrorSeverityEnum.WorkspaceLevel, Label = "3 - Severidade em nível de Workspace", InvolvesEntireWorkspace = true, InvolvesEntireCorporation = false, Icon = "flame", Color = "#dc2626", Order = 3, Description = "Todos do espaço de trabalho se envolvem neste tipo de severidade em erros." },
        new MpxErrorSeverity { CorporationId = null, System = true, Code = Mpx.Domain.Enums.MpxErrorSeverityEnum.CorporationLevel, Label = "4 - Severidade em nível de Corporação", InvolvesEntireWorkspace = true, InvolvesEntireCorporation = true, Icon = "siren", Color = "#991b1b", Order = 4, Description = "Todos da corporação se envolvem neste tipo de severidade em erros." }
      );
      hasChanges = true;
    }

    if (!dbContext.ErrorStates.IgnoreQueryFilters().Any(s => s.CorporationId == null && s.System))
    {
      dbContext.ErrorStates.AddRange(
        new MpxErrorState { CorporationId = null, System = true, Code = Mpx.Domain.Enums.MpxErrorStateEnum.Open, Label = "Aberto", IsTerminal = false, Icon = "circle-dot", Color = "#ef4444", Order = 0, Description = "Erro recém-capturado aguardando análise na estação Error." },
        new MpxErrorState { CorporationId = null, System = true, Code = Mpx.Domain.Enums.MpxErrorStateEnum.InAnalysis, Label = "Em Análise", IsTerminal = false, Icon = "search", Color = "#f59e0b", Order = 1, Description = "Erro em investigação pela equipe responsável." },
        new MpxErrorState { CorporationId = null, System = true, Code = Mpx.Domain.Enums.MpxErrorStateEnum.RetryScheduled, Label = "Retentativa Agendada", IsTerminal = false, Icon = "rotate-cw", Color = "#3b82f6", Order = 2, Description = "Fluxo programado para reexecutar a estação que originou o erro." },
        new MpxErrorState { CorporationId = null, System = true, Code = Mpx.Domain.Enums.MpxErrorStateEnum.Escalated, Label = "Escalado", IsTerminal = false, Icon = "arrow-up-right", Color = "#8b5cf6", Order = 3, Description = "Erro escalado para fluxo de tratamento ou nível superior." },
        new MpxErrorState { CorporationId = null, System = true, Code = Mpx.Domain.Enums.MpxErrorStateEnum.Resolved, Label = "Resolvido", IsTerminal = true, Icon = "check-circle-2", Color = "#10b981", Order = 4, Description = "Erro solucionado e fluxo liberado." },
        new MpxErrorState { CorporationId = null, System = true, Code = Mpx.Domain.Enums.MpxErrorStateEnum.Ignored, Label = "Ignorado", IsTerminal = true, Icon = "slash", Color = "#64748b", Order = 5, Description = "Erro descartado manualmente após avaliação." }
      );
      hasChanges = true;
    }

    if (!dbContext.WorkflowTriggerTypes.IgnoreQueryFilters().Any(t => t.CorporationId == null && t.System))
    {
      dbContext.WorkflowTriggerTypes.AddRange(
        new WkfTriggerType { CorporationId = null, System = true, Code = Mpx.Domain.Enums.WkfTriggerTypeEnum.HtmlAction, Name = "HtmlAction", Label = "Ações HTML / Eventos de Tela e Formulário", RequiresRoute = true, RequiresSchedule = false, Icon = "mouse-pointer-click", Color = "#3b82f6", Order = 0, Description = "OnScreenLoad (abriu uma MpxRoute), OnClick, OnSubmit, OnChange, OnCheck ou OnSelect." },
        new WkfTriggerType { CorporationId = null, System = true, Code = Mpx.Domain.Enums.WkfTriggerTypeEnum.OnSubWorkflow, Name = "OnSubWorkflow", Label = "Subfluxo (Chamado por Outro Fluxo)", RequiresRoute = false, RequiresSchedule = false, Icon = "git-branch-plus", Color = "#8b5cf6", Order = 1, Description = "Disparado quando uma estação Output de outro fluxo pai chama este fluxo." },
        new WkfTriggerType { CorporationId = null, System = true, Code = Mpx.Domain.Enums.WkfTriggerTypeEnum.OnSchedule, Name = "OnSchedule", Label = "Agendamento / Cron (Mpx.Jarbass)", RequiresRoute = false, RequiresSchedule = true, Icon = "calendar-clock", Color = "#10b981", Order = 2, Description = "Disparado em intervalos ou expressões Cron vigiadas 24/7 pelo Jarbass." },
        new WkfTriggerType { CorporationId = null, System = true, Code = Mpx.Domain.Enums.WkfTriggerTypeEnum.OnWebhook, Name = "OnWebhook", Label = "Chamada HTTP Webhook + Escuta Front-end", RequiresRoute = false, RequiresSchedule = false, Icon = "webhook", Color = "#f59e0b", Order = 3, Description = "Disparado por requisição HTTP na URL do fluxo com suporte a escuta em tempo real." },
        new WkfTriggerType { CorporationId = null, System = true, Code = Mpx.Domain.Enums.WkfTriggerTypeEnum.OnChatMessage, Name = "OnChatMessage", Label = "Mensagem de Chat / Agente de IA", RequiresRoute = false, RequiresSchedule = false, Icon = "message-square-Code", Color = "#06b6d4", Order = 4, Description = "Disparado quando chega uma mensagem de chat para um agente ou canal do Morphus / Kalupa." },
        new WkfTriggerType { CorporationId = null, System = true, Code = Mpx.Domain.Enums.WkfTriggerTypeEnum.OnEmailImap, Name = "OnEmailImap", Label = "Caixa de Entrada de E-mail (IMAP / Jarbass)", RequiresRoute = false, RequiresSchedule = false, Icon = "mail-plus", Color = "#ec4899", Order = 5, Description = "Disparado automaticamente quando cai um e-mail novo na caixa IMAP monitorada." },
        new WkfTriggerType { CorporationId = null, System = true, Code = Mpx.Domain.Enums.WkfTriggerTypeEnum.OnError, Name = "OnError", Label = "Gatilho Automático de Erro (On Error)", RequiresRoute = false, RequiresSchedule = false, Icon = "shield-alert", Color = "#ef4444", Order = 6, Description = "Disparado automaticamente quando outro fluxo falha, roteando o MpxError para a equipe responsável." },
        new WkfTriggerType { CorporationId = null, System = true, Code = Mpx.Domain.Enums.WkfTriggerTypeEnum.OnMorphusEvent, Name = "OnMorphusEvent", Label = "Evento Interno do Morphus / .Reflected / Jarbass", RequiresRoute = false, RequiresSchedule = false, Icon = "sparkles", Color = "#6366f1", Order = 7, Description = "Disparado por eventos internos do Morphus, banco de dados (OnCreate/OnUpdate/OnDelete) ou Jarbass." },
        new WkfTriggerType { CorporationId = null, System = true, Code = Mpx.Domain.Enums.WkfTriggerTypeEnum.OnSseEvent, Name = "OnSseEvent", Label = "Stream Server-Sent Events (SSE)", RequiresRoute = false, RequiresSchedule = false, Icon = "radio", Color = "#14b8a6", Order = 8, Description = "Disparado por eventos recebidos em um stream Server-Sent Events." }
      );
      hasChanges = true;
    }

    if (!dbContext.WorkflowStationTypes.IgnoreQueryFilters().Any(t => t.CorporationId == null && t.System))
    {
      dbContext.WorkflowStationTypes.AddRange(
        new WkfStationType { CorporationId = null, System = true, Code = Mpx.Domain.Enums.WkfStationTypeEnum.Input, Name = "Input", Label = "Porta de Entrada (Input)", IsInputPort = true, Icon = "log-in", Color = "#10b981", Order = 0, Description = "Recebe início, retorno de subfluxo, redirect ou entrada de objetos em qualquer parte do fluxo." },
        new WkfStationType { CorporationId = null, System = true, Code = Mpx.Domain.Enums.WkfStationTypeEnum.Output, Name = "Output", Label = "Porta de Saída (Output)", IsOutputPort = true, Icon = "log-out", Color = "#8b5cf6", Order = 1, Description = "Chama Subfluxo (OnSubWorkflow), devolve para o fluxo pai ou despacha objetos para fora do fluxo." },
        new WkfStationType { CorporationId = null, System = true, Code = Mpx.Domain.Enums.WkfStationTypeEnum.Screen, Name = "Screen", Label = "Tela / Formulário (Screen)", HasLayout = true, Icon = "layout-template", Color = "#3b82f6", Order = 2, Description = "Tela ou formulário visual de interação do usuário." },
        new WkfStationType { CorporationId = null, System = true, Code = Mpx.Domain.Enums.WkfStationTypeEnum.Process, Name = "Process", Label = "Regra de Negócio / Handler (Process)", Icon = "cpu", Color = "#6366f1", Order = 3, Description = "Executa regra de negócio ou Handler nativo da API." },
        new WkfStationType { CorporationId = null, System = true, Code = Mpx.Domain.Enums.WkfStationTypeEnum.CodeExecution, Name = "CodeExecution", Label = "Execução de Código (C# / TypeScript)", Icon = "code-2", Color = "#0ea5e9", Order = 4, Description = "Executa código customizado escolhendo C# ou TypeScript dentro da estação." },
        new WkfStationType { CorporationId = null, System = true, Code = Mpx.Domain.Enums.WkfStationTypeEnum.EditFields, Name = "EditFields", Label = "Alterar / Preencher Campos (EditFields)", Icon = "pen-line", Color = "#14b8a6", Order = 5, Description = "Altera ou preenche campos das entidades do Contexto via .Reflected." },
        new WkfStationType { CorporationId = null, System = true, Code = Mpx.Domain.Enums.WkfStationTypeEnum.RemoveDuplicates, Name = "RemoveDuplicates", Label = "Remover Duplicados (RemoveDuplicates)", Icon = "list-filter", Color = "#06b6d4", Order = 6, Description = "Limpa itens duplicados de uma coleção do Contexto por qualquer campo." },
        new WkfStationType { CorporationId = null, System = true, Code = Mpx.Domain.Enums.WkfStationTypeEnum.DateTime, Name = "DateTime", Label = "Data e Hora (DateTime)", Icon = "clock", Color = "#f59e0b", Order = 7, Description = "Cálculos, somas e formatações de datas e prazos." },
        new WkfStationType { CorporationId = null, System = true, Code = Mpx.Domain.Enums.WkfStationTypeEnum.DataConversion, Name = "DataConversion", Label = "Conversão de Dados (DataConversion)", Icon = "file-symlink", Color = "#d946ef", Order = 8, Description = "Converte ou processa Markdown, HTML, XML, JSON, PDF, Excel, ZIP, Criptografia/Assinatura ou Imagem." },
        new WkfStationType { CorporationId = null, System = true, Code = Mpx.Domain.Enums.WkfStationTypeEnum.SplitOut, Name = "SplitOut", Label = "Desmembrar Coleção (SplitOut)", Icon = "split", Color = "#f97316", Order = 9, Description = "Desmembra uma coleção em itens ou ramos individuais." },
        new WkfStationType { CorporationId = null, System = true, Code = Mpx.Domain.Enums.WkfStationTypeEnum.Aggregate, Name = "Aggregate", Label = "Construtor de DTO (Aggregate)", Icon = "combine", Color = "#84cc16", Order = 10, Description = "Puxa campos de várias entidades do .Reflected e junta em um novo DTO no Contexto." },
        new WkfStationType { CorporationId = null, System = true, Code = Mpx.Domain.Enums.WkfStationTypeEnum.Merge, Name = "Merge", Label = "Unir Caminhos (Merge)", Icon = "git-merge", Color = "#22c55e", Order = 11, Description = "Funde caminhos paralelos de volta em um único caminho." },
        new WkfStationType { CorporationId = null, System = true, Code = Mpx.Domain.Enums.WkfStationTypeEnum.Summarize, Name = "Summarize", Label = "Totalizador (Summarize)", Icon = "sigma", Color = "#eab308", Order = 12, Description = "Totalizador estilo Excel: Sum, Count, Avg, Min, Max." },
        new WkfStationType { CorporationId = null, System = true, Code = Mpx.Domain.Enums.WkfStationTypeEnum.HttpRequest, Name = "HttpRequest", Label = "Requisição HTTP / REST (HttpRequest)", Icon = "globe", Color = "#0284c7", Order = 13, Description = "Chamada HTTP/REST externa ou interna." },
        new WkfStationType { CorporationId = null, System = true, Code = Mpx.Domain.Enums.WkfStationTypeEnum.ExecuteCommand, Name = "ExecuteCommand", Label = "Comando de Máquina (Jarbass)", Icon = "terminal", Color = "#475569", Order = 14, Description = "Executa comando de sistema/máquina via Mpx.Jarbass." },
        new WkfStationType { CorporationId = null, System = true, Code = Mpx.Domain.Enums.WkfStationTypeEnum.Email, Name = "Email", Label = "Disparo de E-mail (Relay)", Icon = "send", Color = "#ec4899", Order = 15, Description = "Dispara e-mail via Relay com dados do Contexto." },
        new WkfStationType { CorporationId = null, System = true, Code = Mpx.Domain.Enums.WkfStationTypeEnum.Redirect, Name = "Redirect", Label = "Redirecionar Rota (Redirect)", Icon = "compass", Color = "#6366f1", Order = 16, Description = "Redireciona a navegação para uma MpxRoute." },
        new WkfStationType { CorporationId = null, System = true, Code = Mpx.Domain.Enums.WkfStationTypeEnum.Error, Name = "Error", Label = "Central Isolada de Erro (Error)", IsIsolatedErrorCatcher = true, Icon = "octagon-alert", Color = "#ef4444", Order = 17, Description = "Se alguma etapa do fluxo apresentar algum erro ele vai ser jogado para este local, e aqui dentro você saberá exatamente de onde veio e o motivo do fluxo ter vindo para cá." }
      );
      hasChanges = true;
    }

    var existingRoutePaths = dbContext.Routes.IgnoreQueryFilters()
        .Where(r => r.CorporationId == null && r.System)
        .Select(r => r.Path)
        .ToHashSet(StringComparer.OrdinalIgnoreCase);

    var systemRoutes = new List<MpxRoute>
    {
      // 1. Morphus Public (Website / Institucional)
      new() { CorporationId = null, System = true, Name = "MorphusHome", Label = "Home Pública Morphus", Path = "/", IsPublic = true, Icon = "home", Color = "#3b82f6", Order = 1, Description = "Página inicial pública do ecossistema Morphus." },
      new() { CorporationId = null, System = true, Name = "MorphusProducts", Label = "Catálogo de Produtos", Path = "/produtos", IsPublic = true, Icon = "package", Color = "#8b5cf6", Order = 2, Description = "Vitrine pública de produtos e aplicações comercializáveis do Morphus." },
      new() { CorporationId = null, System = true, Name = "MorphusContact", Label = "Contato Comercial", Path = "/contato", IsPublic = true, Icon = "mail", Color = "#10b981", Order = 3, Description = "Página pública de contato e atendimento comercial." },
      new() { CorporationId = null, System = true, Name = "MorphusProfile", Label = "Meu Perfil", Path = "/profile", IsPublic = false, Icon = "user", Color = "#06b6d4", Order = 4, Description = "Página de perfil e preferências da conta do usuário logado." },
      new() { CorporationId = null, System = true, Name = "MorphusPrivacy", Label = "Política de Privacidade", Path = "/privacidade", IsPublic = true, Icon = "shield", Color = "#64748b", Order = 5, Description = "Termos de privacidade e proteção de dados (LGPD/GDPR)." },
      new() { CorporationId = null, System = true, Name = "MorphusTerms", Label = "Termos de Uso", Path = "/termos", IsPublic = true, Icon = "file-text", Color = "#64748b", Order = 6, Description = "Termos e condições gerais de uso da plataforma Morphus." },
      new() { CorporationId = null, System = true, Name = "MorphusNotFound", Label = "Página Não Encontrada (404)", Path = "/notfound", IsPublic = true, Icon = "alert-triangle", Color = "#ef4444", Order = 7, Description = "Rota de fallback quando um endereço não existe." },

      // 2. Security (Autenticação, Onboarding e Governança Auth0)
      new() { CorporationId = null, System = true, Name = "SecuritySignIn", Label = "Login (Sign In)", Path = "/security/signin", IsPublic = true, Icon = "log-in", Color = "#3b82f6", Order = 10, Description = "Tela de entrada e autenticação principal do Morphus." },
      new() { CorporationId = null, System = true, Name = "SecuritySignUp", Label = "Criar Conta (Sign Up)", Path = "/security/signup", IsPublic = true, Icon = "user-plus", Color = "#10b981", Order = 11, Description = "Tela de criação de nova conta no Morphus." },
      new() { CorporationId = null, System = true, Name = "SecuritySignOut", Label = "Sair (Sign Out)", Path = "/security/signout", IsPublic = true, Icon = "log-out", Color = "#64748b", Order = 12, Description = "Encerramento de sessão e limpeza de tokens." },
      new() { CorporationId = null, System = true, Name = "SecurityForgotPassword", Label = "Esqueci Minha Senha", Path = "/security/forgot-password", IsPublic = true, Icon = "key-round", Color = "#f59e0b", Order = 13, Description = "Solicitação de código/link de recuperação de senha." },
      new() { CorporationId = null, System = true, Name = "SecurityResetPassword", Label = "Redefinir Senha", Path = "/security/reset-password", IsPublic = true, Icon = "lock", Color = "#f59e0b", Order = 14, Description = "Definição de nova senha após validação do token de recuperação." },
      new() { CorporationId = null, System = true, Name = "SecurityConfirmEmail", Label = "Confirmação de E-mail", Path = "/security/confirm-email", IsPublic = true, Icon = "mail-check", Color = "#06b6d4", Order = 15, Description = "Validação do código de confirmação de e-mail do usuário." },
      new() { CorporationId = null, System = true, Name = "SecurityOnboarding", Label = "Onboarding em 4 Etapas", Path = "/security/onboarding", IsPublic = false, Icon = "rocket", Color = "#8b5cf6", Order = 16, Description = "Fluxo guiado de configuração inicial de Corporação, Workspace e Aplicações." },
      new() { CorporationId = null, System = true, Name = "SecuritySelectCorporation", Label = "Seleção de Corporação", Path = "/security/select-corporation", IsPublic = false, Icon = "building-2", Color = "#6366f1", Order = 17, Description = "Escolha da corporação ativa quando o usuário pertence a múltiplas empresas." },
      new() { CorporationId = null, System = true, Name = "SecurityDashboard", Label = "Dashboard de Segurança", Path = "/security", IsPublic = false, Icon = "shield-check", Color = "#3b82f6", Order = 18, Description = "Painel central de Identidade, Acessos, Perfis e Permissões." },
      new() { CorporationId = null, System = true, Name = "SecurityUserList", Label = "Gestão de Usuários", Path = "/security/user", IsPublic = false, Icon = "users", Color = "#3b82f6", Order = 19, Description = "Listagem e administração de usuários da corporação." },
      new() { CorporationId = null, System = true, Name = "SecurityUserEdit", Label = "Cadastro / Edição de Usuário", Path = "/security/user/:id", IsPublic = false, Icon = "user-check", Color = "#3b82f6", Order = 20, Description = "Formulário de criação e edição de usuário, status, perfis e permissões." },
      new() { CorporationId = null, System = true, Name = "SecurityRoleList", Label = "Perfis de Acesso (Roles)", Path = "/security/role", IsPublic = false, Icon = "badge-check", Color = "#8b5cf6", Order = 21, Description = "Listagem e administração de perfis de acesso (Roles)." },
      new() { CorporationId = null, System = true, Name = "SecurityRoleEdit", Label = "Cadastro / Edição de Perfil (Role)", Path = "/security/role/:id", IsPublic = false, Icon = "badge-check", Color = "#8b5cf6", Order = 22, Description = "Formulário de edição de perfil e vínculo com permissões (RoleClaims)." },
      new() { CorporationId = null, System = true, Name = "SecurityClaimList", Label = "Permissões (Claims)", Path = "/security/claim", IsPublic = false, Icon = "key", Color = "#f59e0b", Order = 23, Description = "Catálogo de permissões granulares (Claims) por módulo e submódulo." },
      new() { CorporationId = null, System = true, Name = "SecurityClaimEdit", Label = "Cadastro / Edição de Permissão (Claim)", Path = "/security/claim/:id", IsPublic = false, Icon = "key", Color = "#f59e0b", Order = 24, Description = "Formulário de criação e edição de permissão." },
      new() { CorporationId = null, System = true, Name = "SecurityModuleList", Label = "Módulos & SubMódulos de Segurança", Path = "/security/module", IsPublic = false, Icon = "boxes", Color = "#10b981", Order = 25, Description = "Listagem de módulos e submódulos controlados pela Security.Api." },
      new() { CorporationId = null, System = true, Name = "SecurityModuleEdit", Label = "Cadastro / Edição de Módulo", Path = "/security/module/:id", IsPublic = false, Icon = "box", Color = "#10b981", Order = 26, Description = "Edição de módulo e seus submódulos vinculados." },
      new() { CorporationId = null, System = true, Name = "SecurityUserRole", Label = "Matriz Usuários x Perfis", Path = "/security/user-role", IsPublic = false, Icon = "user-cog", Color = "#6366f1", Order = 27, Description = "Gerenciamento de vínculos N:N entre usuários, perfis e permissões." },

      // 3. Morphus Core (Portal, Corporações, Workspaces, Aplicações e Configurações)
      new() { CorporationId = null, System = true, Name = "MorphusDashboard", Label = "Portal Morphus (Dashboard)", Path = "/morphus", IsPublic = false, Icon = "layout-grid", Color = "#3b82f6", Order = 30, Description = "Portal central da corporação com visão de workspaces e aplicações." },
      new() { CorporationId = null, System = true, Name = "MorphusAdminDashboard", Label = "Painel Administrativo Morphus", Path = "/morphus/admin/dashboard", IsPublic = false, Icon = "gauge", Color = "#3b82f6", Order = 31, Description = "Dashboard executivo de administração da corporação." },
      new() { CorporationId = null, System = true, Name = "MorphusCorporationList", Label = "Corporações & Filiais", Path = "/morphus/corporation", IsPublic = false, Icon = "building-2", Color = "#6366f1", Order = 32, Description = "Gestão da matriz, filiais e compartilhamento seletivo de dados." },
      new() { CorporationId = null, System = true, Name = "MorphusCorporationEdit", Label = "Cadastro / Edição de Corporação", Path = "/morphus/corporation/:id", IsPublic = false, Icon = "building", Color = "#6366f1", Order = 33, Description = "Configuração detalhada de corporação/filial e seus usuários." },
      new() { CorporationId = null, System = true, Name = "MorphusWorkspaceList", Label = "Espaços de Trabalho (Workspaces)", Path = "/morphus/workspace", IsPublic = false, Icon = "folder-kanban", Color = "#10b981", Order = 34, Description = "Listagem e gestão de espaços de trabalho / setores da corporação." },
      new() { CorporationId = null, System = true, Name = "MorphusWorkspaceEdit", Label = "Cadastro / Edição de Workspace", Path = "/morphus/workspace/:id", IsPublic = false, Icon = "folder-cog", Color = "#10b981", Order = 35, Description = "Edição de workspace, usuários vinculados e aplicações instaladas." },
      new() { CorporationId = null, System = true, Name = "MorphusApplicationList", Label = "Aplicações da Corporação", Path = "/morphus/application", IsPublic = false, Icon = "app-window", Color = "#8b5cf6", Order = 36, Description = "Catálogo de aplicações nativas e customizadas da corporação." },
      new() { CorporationId = null, System = true, Name = "MorphusApplicationEdit", Label = "Cadastro / Edição de Aplicação", Path = "/morphus/application/:id", IsPublic = false, Icon = "app-window", Color = "#8b5cf6", Order = 37, Description = "Edição de aplicação, domínios, módulos, menus e configurações." },
      new() { CorporationId = null, System = true, Name = "MorphusSettings", Label = "Configurações Globais Morphus", Path = "/morphus/settings", IsPublic = false, Icon = "settings", Color = "#64748b", Order = 38, Description = "Parâmetros gerais e preferências da corporação no Morphus." },

      // 4. Workflow (Motor de Fluxos Wkf*)
      new() { CorporationId = null, System = true, Name = "WorkflowDashboard", Label = "Dashboard Morphus Workflow", Path = "/workflow", IsPublic = false, Icon = "workflow", Color = "#10b981", Order = 40, Description = "Visão geral do motor de workflows, estações, plenário e SLAs." },
      new() { CorporationId = null, System = true, Name = "WorkflowStudio", Label = "Estúdio Visual de Fluxos (Canvas)", Path = "/workflow?view=studio", IsPublic = false, Icon = "git-branch-plus", Color = "#3b82f6", Order = 41, Description = "Canvas visual para desenhar Tipos de Fluxo (WkfType) com Play central e Error isolado." },
      new() { CorporationId = null, System = true, Name = "WorkflowStations", Label = "Catálogo de Estações (WkfStation)", Path = "/workflow?view=stations", IsPublic = false, Icon = "boxes", Color = "#6366f1", Order = 42, Description = "Gerenciamento das estações reutilizáveis baseadas nos 18 WkfStationType." },
      new() { CorporationId = null, System = true, Name = "WorkflowCommittee", Label = "Plenário, Quórum & Relator", Path = "/workflow?view=committee", IsPublic = false, Icon = "users", Color = "#8b5cf6", Order = 43, Description = "Configuração de deliberação colegiada, quórum e voto de minerva." },
      new() { CorporationId = null, System = true, Name = "WorkflowConditions", Label = "Condições & Fantasminha", Path = "/workflow?view=conditions", IsPublic = false, Icon = "git-branch", Color = "#f59e0b", Order = 44, Description = "Regras condicionais If, Switch, Loop, WaitUntil e Split/Join." },
      new() { CorporationId = null, System = true, Name = "WorkflowFields", Label = "Contexto, Campos & Validações", Path = "/workflow?view=fields", IsPublic = false, Icon = "sliders-horizontal", Color = "#14b8a6", Order = 45, Description = "Configuração do Contexto / Grupo de Dados (WkfTypeContext) e campos." },
      new() { CorporationId = null, System = true, Name = "WorkflowSla", Label = "SLAs Progressivos & Notificações", Path = "/workflow?view=sla", IsPublic = false, Icon = "clock", Color = "#ef4444", Order = 46, Description = "Alertas de SLA das estações e SLA exclusiva da estação Error (MpxErrorCode)." },

      // 5. Relay (Motor de E-mails Transacionais Rly*)
      new() { CorporationId = null, System = true, Name = "RelayDashboard", Label = "Painel Morphus Relay (E-mails)", Path = "/relay", IsPublic = false, Icon = "send", Color = "#ec4899", Order = 50, Description = "Gestão de envios de e-mail, domínios verificados, templates e logs." },

      // 6. Kalupa (Motor de Estruturação de Conhecimento & Cofre Obsidian)
      new() { CorporationId = null, System = true, Name = "KalupaDashboard", Label = "Painel Kalupa & Estúdio do Cofre", Path = "/kalupa", IsPublic = false, Icon = "sparkles", Color = "#8b5cf6", Order = 60, Description = "Gestão de conhecimento, templates, tags transversais e sincronismo com Mpx.Jarbass." },

      // 7. App Builder (Construtor Visual de Aplicações)
      new() { CorporationId = null, System = true, Name = "AppBuilderPage", Label = "Estúdio App Builder", Path = "/app/:appKey", IsPublic = false, Icon = "blocks", Color = "#3b82f6", Order = 70, Description = "Construtor visual de páginas, formulários e componentes da aplicação." },
      new() { CorporationId = null, System = true, Name = "AppBuilderSettings", Label = "Configurações da Aplicação (App Builder)", Path = "/app/:appKey/settings", IsPublic = false, Icon = "sliders-horizontal", Color = "#6366f1", Order = 71, Description = "Configurações de layout, rotas e fontes de dados da aplicação no App Builder." }
    };

    foreach (var route in systemRoutes)
    {
      if (!existingRoutePaths.Contains(route.Path))
      {
        dbContext.Routes.Add(route);
        existingRoutePaths.Add(route.Path);
        hasChanges = true;
      }
    }

    if (hasChanges)
    {
      dbContext.SaveChanges();
      Console.WriteLine(">>> TABELAS BASE DE WORKFLOW, ROTAS E ERROS (WkfTriggerType, WkfStationType, MpxRoute, MpxErrorSeverity, MpxErrorState) SEMEADAS! <<<");
    }

    var severities = dbContext.ErrorSeverities.IgnoreQueryFilters()
        .Where(s => s.CorporationId == null && s.System)
        .ToDictionary(s => s.Code, s => s.Id);

    if (severities.Count > 0)
    {
      var corpIds = dbContext.Corporations.IgnoreQueryFilters().Select(c => c.Id).ToList();
      var existingCodesByCorp = dbContext.ErrorCodes.IgnoreQueryFilters()
          .Select(c => new { c.CorporationId, c.Code })
          .ToList()
          .GroupBy(c => c.CorporationId)
          .ToDictionary(g => g.Key, g => g.Select(x => x.Code).ToHashSet(StringComparer.OrdinalIgnoreCase));

      var errorCodeChanges = false;
      foreach (var corpId in corpIds)
      {
        if (!existingCodesByCorp.TryGetValue(corpId, out var codes))
        {
          codes = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        }

        void AddCodeIfMissing(string code, string name, string friendly, int sla, Mpx.Domain.Enums.MpxErrorSeverityEnum sev, string icon, string color)
        {
          if (codes.Contains(code) || !severities.TryGetValue(sev, out var sevId))
            return;

          dbContext.ErrorCodes.Add(new MpxErrorCode
          {
            CorporationId = corpId,
            System = true,
            Code = code,
            Name = name,
            FriendlyMessage = friendly,
            Sla = sla,
            SeverityId = sevId,
            Icon = icon,
            Color = color,
            Description = $"{code} - {name}"
          });
          codes.Add(code);
          errorCodeChanges = true;
        }

        AddCodeIfMissing("0101", "Erro fatal de sistema", "Ocorreu uma falha inesperada no sistema. Nossa equipe técnica já foi acionada automaticamente.", 15, Mpx.Domain.Enums.MpxErrorSeverityEnum.CorporationLevel, "siren", "#991b1b");
        AddCodeIfMissing("0150", "Tipos de dados incompatíveis", "Os dados informados não estão no formato esperado para esta etapa do fluxo.", 60, Mpx.Domain.Enums.MpxErrorSeverityEnum.Medium, "file-warning", "#f59e0b");
        AddCodeIfMissing("0201", "Credenciais inválidas ou expiradas", "Não foi possível validar suas credenciais de acesso. Verifique seu e-mail e senha.", 120, Mpx.Domain.Enums.MpxErrorSeverityEnum.Low, "key-round", "#3b82f6");
        AddCodeIfMissing("0203", "Permissão insuficiente para a operação", "Seu perfil atual não possui permissão para executar esta ação.", 60, Mpx.Domain.Enums.MpxErrorSeverityEnum.Medium, "shield-alert", "#f59e0b");
        AddCodeIfMissing("0301", "Violação de regra de negócio no fluxo", "Uma condição obrigatória desta etapa não foi atendida.", 45, Mpx.Domain.Enums.MpxErrorSeverityEnum.High, "alert-triangle", "#ef4444");
        AddCodeIfMissing("0502", "Falha de comunicação ou integração externa", "O serviço externo demorou a responder ou está temporariamente indisponível.", 30, Mpx.Domain.Enums.MpxErrorSeverityEnum.WorkspaceLevel, "wifi-off", "#dc2626");
      }

      if (errorCodeChanges)
      {
        dbContext.SaveChanges();
        Console.WriteLine(">>> CATÁLOGO PADRÃO DE CÓDIGOS DE ERRO (mpx_error_codes: 0101, 0150, 0201, 0203, 0301, 0502) SEMEADO! <<<");
      }
    }

    SeedDefaultLoginWorkflows(dbContext);
    SeedSystemParametersAndScreenComponents(dbContext);
  }

  private static void SeedSystemParametersAndScreenComponents(MpxDbContext dbContext)
  {
    var hasChanges = false;

    if (!dbContext.ParameterScopes.IgnoreQueryFilters().Any(s => s.CorporationId == null && s.System))
    {
      dbContext.ParameterScopes.AddRange(
        new MpxParameterScope
        {
          CorporationId = null,
          System = true,
          Code = Mpx.Domain.Enums.MpxParameterScopeEnum.SystemDefault,
          Name = "SystemDefault",
          Label = "0 - Padrão Soberano de Fábrica (SystemDefault)",
          IsSystemSovereign = true,
          IsExportableToJarbass = false,
          Icon = "shield-lock",
          Color = "#64748b",
          Order = 0,
          Description = "Camada 0 imutável de fábrica do Morphus. Garante fallback seguro e nunca é exportada no JSON portátil do usuário."
        },
        new MpxParameterScope
        {
          CorporationId = null,
          System = true,
          Code = Mpx.Domain.Enums.MpxParameterScopeEnum.Corporation,
          Name = "Corporation",
          Label = "1 - Soberania Corporativa (Corporation)",
          IsSystemSovereign = true,
          IsExportableToJarbass = false,
          Icon = "building-2",
          Color = "#dc2626",
          Order = 1,
          Description = "Camada 1 de governança e segurança da Corporação (ex.: os 5 níveis de segurança do Jarbass). Nunca exportável pelo usuário."
        },
        new MpxParameterScope
        {
          CorporationId = null,
          System = true,
          Code = Mpx.Domain.Enums.MpxParameterScopeEnum.Workspace,
          Name = "Workspace",
          Label = "2 - Espaço de Trabalho (Workspace)",
          IsSystemSovereign = false,
          IsExportableToJarbass = true,
          Icon = "folder-kanban",
          Color = "#8b5cf6",
          Order = 2,
          Description = "Camada 2 do Workspace atual. Parâmetros permitidos podem ser exportados no perfil portátil do usuário."
        },
        new MpxParameterScope
        {
          CorporationId = null,
          System = true,
          Code = Mpx.Domain.Enums.MpxParameterScopeEnum.Application,
          Name = "Application",
          Label = "3 - Aplicação (Application / App)",
          IsSystemSovereign = false,
          IsExportableToJarbass = true,
          Icon = "app-window",
          Color = "#3b82f6",
          Order = 3,
          Description = "Camada 3 por Aplicação (Workflow, Security, Relay, Kalupa). Exportável no JSON portátil."
        },
        new MpxParameterScope
        {
          CorporationId = null,
          System = true,
          Code = Mpx.Domain.Enums.MpxParameterScopeEnum.User,
          Name = "User",
          Label = "4 - Preferências do Usuário (User)",
          IsSystemSovereign = false,
          IsExportableToJarbass = true,
          Icon = "user-check",
          Color = "#10b981",
          Order = 4,
          Description = "Camada 4 pessoal do usuário (fontes, cores, GrabPadding do MpxDraggable, comportamento visual). 100% exportável."
        },
        new MpxParameterScope
        {
          CorporationId = null,
          System = true,
          Code = Mpx.Domain.Enums.MpxParameterScopeEnum.Machine,
          Name = "Machine",
          Label = "5 - Ambiente de Máquina Local (Machine / Jarbass)",
          IsSystemSovereign = false,
          IsExportableToJarbass = true,
          Icon = "cpu",
          Color = "#f59e0b",
          Order = 5,
          Description = "Camada 5 de hardware e ambiente local moldando o Mpx.Jarbass (caminhos .dev/.kalupa, GPU, monitores). 100% portátil para casa ou pós-formatação."
        }
      );
      hasChanges = true;
    }

    if (!dbContext.ComponentTypes.IgnoreQueryFilters().Any(c => c.CorporationId == null && c.System))
    {
      dbContext.ComponentTypes.AddRange(
        new MpxComponentType
        {
          CorporationId = null,
          System = true,
          Code = Mpx.Domain.Enums.MpxComponentTypeEnum.MpxDraggable,
          TagName = "mpx-draggable",
          Name = "MpxDraggable",
          Label = "Envelope de Arraste (MpxDraggable)",
          IsContainerWrapper = true,
          SupportsWorkflowAction = false,
          SupportsReflectedField = false,
          DefaultParametersJson = """{"grabPadding":"8px","elevationTilt":"1.5deg","originGhostOpacity":0.35,"elasticSnapBackMs":180,"occupyFullSlot":true}""",
          Icon = "move",
          Color = "#f59e0b",
          Order = 0,
          Description = "Envelope universal de arraste. Só ele se mexe aplicando o GrabPadding e ElevationTilt do MpxParameter, levando qualquer componente Mpx* (100% width/height) dentro dele."
        },
        new MpxComponentType
        {
          CorporationId = null,
          System = true,
          Code = Mpx.Domain.Enums.MpxComponentTypeEnum.MpxDroppable,
          TagName = "mpx-droppable",
          Name = "MpxDroppable",
          Label = "Berço Magnético de Encaixe (MpxDroppable)",
          IsContainerWrapper = true,
          SupportsWorkflowAction = true,
          SupportsReflectedField = false,
          DefaultParametersJson = """{"magneticGlowColor":"#3b82f6","rejectGlowColor":"#ef4444","landingPulseMs":600,"autoFitChild":true}""",
          Icon = "magnet",
          Color = "#3b82f6",
          Order = 1,
          Description = "Zona magnética de encaixe que valida compatibilidade em 0,01ms, aplica LandingPulse e dispara evento OnDrop vinculado ao WkfType."
        },
        new MpxComponentType
        {
          CorporationId = null,
          System = true,
          Code = Mpx.Domain.Enums.MpxComponentTypeEnum.MpxButton,
          TagName = "mpx-button",
          Name = "MpxButton",
          Label = "Botão Inteligente de Fluxo (MpxButton)",
          IsContainerWrapper = false,
          SupportsWorkflowAction = true,
          SupportsReflectedField = false,
          DefaultParametersJson = """{"disableOnClick":true,"showSpinner":true,"preventDoubleClick":true,"spinnerPosition":"left","validateContextBeforeDispatch":true}""",
          Icon = "mouse-pointer-click",
          Color = "#10b981",
          Order = 2,
          Description = "Botão oficial registrado com Id único que já nasce renderizado com todas as configurações do WkfType e WkfTypeConfigAction embarcadas."
        },
        new MpxComponentType
        {
          CorporationId = null,
          System = true,
          Code = Mpx.Domain.Enums.MpxComponentTypeEnum.MpxInput,
          TagName = "mpx-input",
          Name = "MpxInput",
          Label = "Campo Inteligente .Reflected (MpxInput)",
          IsContainerWrapper = false,
          SupportsWorkflowAction = false,
          SupportsReflectedField = true,
          DefaultParametersJson = """{"highlightInvalid":true,"shakeOnError":true,"instantValidation":true}""",
          Icon = "text-cursor-input",
          Color = "#06b6d4",
          Order = 3,
          Description = "Campo de entrada vinculado diretamente a uma MpxEntityProperty do .Reflected / WkfTypeContext com validação local em 0,1ms."
        },
        new MpxComponentType
        {
          CorporationId = null,
          System = true,
          Code = Mpx.Domain.Enums.MpxComponentTypeEnum.MpxSelect,
          TagName = "mpx-select",
          Name = "MpxSelect",
          Label = "Seletor 1:N .Reflected (MpxSelect)",
          IsContainerWrapper = false,
          SupportsWorkflowAction = true,
          SupportsReflectedField = true,
          DefaultParametersJson = """{"searchable":true,"preloadDomainTable":true}""",
          Icon = "list-filter",
          Color = "#8b5cf6",
          Order = 4,
          Description = "Combo inteligente alimentado automaticamente pelas tabelas de domínio 1:N do catálogo .Reflected."
        },
        new MpxComponentType
        {
          CorporationId = null,
          System = true,
          Code = Mpx.Domain.Enums.MpxComponentTypeEnum.MpxCard,
          TagName = "mpx-card",
          Name = "MpxCard",
          Label = "Card Container (MpxCard)",
          IsContainerWrapper = true,
          SupportsWorkflowAction = false,
          SupportsReflectedField = false,
          DefaultParametersJson = """{"glassmorphism":true,"elevation":2}""",
          Icon = "square-stack",
          Color = "#6366f1",
          Order = 5,
          Description = "Bloco visual de agrupamento com suporte a encaixe 100% width/height dentro de MpxDraggable e MpxDroppable."
        },
        new MpxComponentType
        {
          CorporationId = null,
          System = true,
          Code = Mpx.Domain.Enums.MpxComponentTypeEnum.MpxForm,
          TagName = "mpx-form",
          Name = "MpxForm",
          Label = "Formulário de Estação Screen (MpxForm)",
          IsContainerWrapper = true,
          SupportsWorkflowAction = true,
          SupportsReflectedField = true,
          DefaultParametersJson = """{"autoBindContext":true,"inlineCreateBlinkTop":true}""",
          Icon = "layout-template",
          Color = "#14b8a6",
          Order = 6,
          Description = "Formulário inteligente vinculado a uma estação Screen e ao Grupo de Dados (WkfTypeContext)."
        },
        new MpxComponentType
        {
          CorporationId = null,
          System = true,
          Code = Mpx.Domain.Enums.MpxComponentTypeEnum.MpxGrid,
          TagName = "mpx-grid",
          Name = "MpxGrid",
          Label = "Tabuleiro Auto-Encaixável (MpxGrid)",
          IsContainerWrapper = true,
          SupportsWorkflowAction = false,
          SupportsReflectedField = false,
          DefaultParametersJson = """{"columns":12,"gap":"16px","autoSnap":true}""",
          Icon = "layout-grid",
          Color = "#0ea5e9",
          Order = 7,
          Description = "Tabuleiro base de tela formado por células MpxDroppable que organizam o HTML final sem permitir quebra de layout."
        },
        new MpxComponentType
        {
          CorporationId = null,
          System = true,
          Code = Mpx.Domain.Enums.MpxComponentTypeEnum.MpxTable,
          TagName = "mpx-table",
          Name = "MpxTable",
          Label = "Tabela Dinâmica com Lei de UX (MpxTable)",
          IsContainerWrapper = false,
          SupportsWorkflowAction = true,
          SupportsReflectedField = true,
          DefaultParametersJson = """{"inlineCreateBlinkTop":true,"inlineCreateBlinkDurationMs":1200}""",
          Icon = "table",
          Color = "#ec4899",
          Order = 8,
          Description = "Listagem dinâmica conectada ao .Reflected que aplica automaticamente a piscadinha suave no topo ao salvar cadastros inline."
        }
      );
      hasChanges = true;
    }

    if (hasChanges)
    {
      dbContext.SaveChanges();
      Console.WriteLine(">>> ESCOPOS DE PARÂMETROS (0..5) E CATÁLOGO DE COMPONENTES MPX* (MpxDraggable, MpxDroppable, MpxButton, MpxInput...) SEMEADOS! <<<");
    }

    var scopes = dbContext.ParameterScopes.IgnoreQueryFilters()
        .Where(s => s.CorporationId == null && s.System)
        .ToDictionary(s => s.Code, s => s);

    if (scopes.Count == 0)
      return;

    // Seed Camada 0 (SystemDefault global)
    if (!dbContext.Parameters.IgnoreQueryFilters().Any(p => p.CorporationId == null && p.ScopeCode == Mpx.Domain.Enums.MpxParameterScopeEnum.SystemDefault))
    {
      dbContext.Parameters.Add(new MpxParameter
      {
        Id = Guid.CreateVersion7(),
        CorporationId = null,
        ScopeId = scopes[Mpx.Domain.Enums.MpxParameterScopeEnum.SystemDefault].Id,
        ScopeCode = Mpx.Domain.Enums.MpxParameterScopeEnum.SystemDefault,
        Namespace = "mpx.core",
        Name = "Morphus Factory Defaults (Layer 0)",
        IsLockedBySovereign = true,
        IsExportable = false,
        System = true,
        Description = "Valores padrão de fábrica do Morphus (Camada 0 Imutável). Governam tema, física do MpxDraggable/MpxDroppable, MpxButton, Lei de UX e níveis base do Mpx.Jarbass.",
        SettingsJson = """
{
  "mpx.theme.mode": "dark",
  "mpx.theme.fontFamily": "Inter, system-ui, sans-serif",
  "mpx.theme.fontSize": 14,
  "mpx.theme.borderRadius": "10px",
  "mpx.theme.primaryColor": "#3b82f6",
  "mpx.draggable.grabPadding": "8px",
  "mpx.draggable.elevationTilt": "1.5deg",
  "mpx.draggable.originGhostOpacity": 0.35,
  "mpx.draggable.elasticSnapBackMs": 180,
  "mpx.droppable.magneticGlowColor": "#3b82f6",
  "mpx.droppable.rejectGlowColor": "#ef4444",
  "mpx.droppable.landingPulseMs": 600,
  "mpx.button.disableOnClick": true,
  "mpx.button.showSpinner": true,
  "mpx.button.preventDoubleClick": true,
  "mpx.button.spinnerPosition": "left",
  "mpx.ux.inlineCreateBlinkTop": true,
  "mpx.ux.inlineCreateBlinkDurationMs": 1200,
  "jrb.security.defaultLevel": 2,
  "jrb.security.enforceDualSealV2": true,
  "jrb.security.heartbeatSeconds": 30,
  "jrb.security.rulesByExtension": {
    ".txt": 0,
    ".md": 2,
    ".pdf": 3,
    ".docx": 3,
    ".xlsx": 4,
    ".mpx": 5
  }
}
"""
      });
      dbContext.SaveChanges();
    }

    var corpIds = dbContext.Corporations.IgnoreQueryFilters().Select(c => c.Id).ToList();
    var compTypes = dbContext.ComponentTypes.IgnoreQueryFilters()
        .Where(c => c.CorporationId == null && c.System)
        .ToDictionary(c => c.Code, c => c);

    var signInRoute = dbContext.Routes.IgnoreQueryFilters()
        .FirstOrDefault(r => r.Path == "/security/signin");

    var emailProp = dbContext.EntityProperties.IgnoreQueryFilters()
        .Include(p => p.EntityDefinition)
        .FirstOrDefault(p => p.Name == "Email" && p.EntityDefinition != null && p.EntityDefinition.Name == "SecUser");

    var passProp = dbContext.EntityProperties.IgnoreQueryFilters()
        .Include(p => p.EntityDefinition)
        .FirstOrDefault(p => p.Name == "PasswordHash" && p.EntityDefinition != null && p.EntityDefinition.Name == "SecUser");

    var paramAndCompSeeded = false;

    foreach (var corpId in corpIds)
    {
      var existingScopesForCorp = dbContext.Parameters.IgnoreQueryFilters()
          .Where(p => p.CorporationId == corpId)
          .Select(p => p.ScopeCode)
          .ToHashSet();

      var defaultWorkspace = dbContext.Workspaces.IgnoreQueryFilters().FirstOrDefault(w => w.CorporationId == corpId);
      var workflowApp = dbContext.Applications.IgnoreQueryFilters().FirstOrDefault(a => a.CorporationId == corpId);
      var firstUser = dbContext.Users.IgnoreQueryFilters().FirstOrDefault(u => u.CorporationId == corpId);

      if (!existingScopesForCorp.Contains(Mpx.Domain.Enums.MpxParameterScopeEnum.Corporation))
      {
        dbContext.Parameters.Add(new MpxParameter
        {
          Id = Guid.CreateVersion7(),
          CorporationId = corpId,
          ScopeId = scopes[Mpx.Domain.Enums.MpxParameterScopeEnum.Corporation].Id,
          ScopeCode = Mpx.Domain.Enums.MpxParameterScopeEnum.Corporation,
          Namespace = "jrb.security.policy",
          Name = "Política Soberana da Corporação & Régua Jarbass (0..5)",
          IsLockedBySovereign = true,
          IsExportable = false,
          System = true,
          Description = "Regras corporativas inegociáveis (Camada 1). Moldam os 5 níveis de segurança do Mpx.Jarbass e nunca saem no JSON exportado pelo usuário.",
          SettingsJson = """
{
  "jrb.security.defaultLevel": 3,
  "jrb.security.enforceDualSealV2": true,
  "jrb.security.allowUserDowngrade": false,
  "jrb.security.rulesByExtension": {
    ".txt": 1,
    ".md": 2,
    ".pdf": 3,
    ".docx": 4,
    ".xlsx": 4,
    ".mpx": 5
  }
}
"""
        });
        paramAndCompSeeded = true;
      }

      if (!existingScopesForCorp.Contains(Mpx.Domain.Enums.MpxParameterScopeEnum.Workspace))
      {
        dbContext.Parameters.Add(new MpxParameter
        {
          Id = Guid.CreateVersion7(),
          CorporationId = corpId,
          ScopeId = scopes[Mpx.Domain.Enums.MpxParameterScopeEnum.Workspace].Id,
          ScopeCode = Mpx.Domain.Enums.MpxParameterScopeEnum.Workspace,
          WorkspaceId = defaultWorkspace?.Id,
          Namespace = "mpx.workspace.ui",
          Name = "Parâmetros do Workspace Principal",
          IsLockedBySovereign = false,
          IsExportable = true,
          System = true,
          Description = "Preferências compartilhadas do Workspace (Camada 2). Exportáveis no pacote portátil.",
          SettingsJson = """
{
  "mpx.ux.inlineCreateBlinkTop": true,
  "mpx.ux.inlineCreateBlinkDurationMs": 1200,
  "mpx.droppable.magneticGlowColor": "#3b82f6"
}
"""
        });
        paramAndCompSeeded = true;
      }

      if (!existingScopesForCorp.Contains(Mpx.Domain.Enums.MpxParameterScopeEnum.Application))
      {
        dbContext.Parameters.Add(new MpxParameter
        {
          Id = Guid.CreateVersion7(),
          CorporationId = corpId,
          ScopeId = scopes[Mpx.Domain.Enums.MpxParameterScopeEnum.Application].Id,
          ScopeCode = Mpx.Domain.Enums.MpxParameterScopeEnum.Application,
          ApplicationId = workflowApp?.Id,
          Namespace = "wkf.app.runtime",
          Name = "Parâmetros da Aplicação Morphus Workflow",
          IsLockedBySovereign = false,
          IsExportable = true,
          System = true,
          Description = "Comportamento padrão dos componentes MpxButton e MpxInput na aplicação (Camada 3).",
          SettingsJson = """
{
  "mpx.button.disableOnClick": true,
  "mpx.button.showSpinner": true,
  "mpx.button.preventDoubleClick": true,
  "wkf.runtime.embedConfigsOnRender": true
}
"""
        });
        paramAndCompSeeded = true;
      }

      if (!existingScopesForCorp.Contains(Mpx.Domain.Enums.MpxParameterScopeEnum.User))
      {
        dbContext.Parameters.Add(new MpxParameter
        {
          Id = Guid.CreateVersion7(),
          CorporationId = corpId,
          ScopeId = scopes[Mpx.Domain.Enums.MpxParameterScopeEnum.User].Id,
          ScopeCode = Mpx.Domain.Enums.MpxParameterScopeEnum.User,
          UserId = firstUser?.Id,
          Namespace = "mpx.user.preferences",
          Name = "Preferências Pessoais do Arquiteto (Camada 4)",
          IsLockedBySovereign = false,
          IsExportable = true,
          System = true,
          Description = "Física de arraste (GrabPadding), fontes, cores e estilo pessoal do usuário. Vai no JSON portátil para qualquer lugar.",
          SettingsJson = """
{
  "mpx.theme.fontSize": 14,
  "mpx.theme.borderRadius": "10px",
  "mpx.draggable.grabPadding": "8px",
  "mpx.draggable.elevationTilt": "1.5deg",
  "mpx.draggable.originGhostOpacity": 0.35
}
"""
        });
        paramAndCompSeeded = true;
      }

      if (!existingScopesForCorp.Contains(Mpx.Domain.Enums.MpxParameterScopeEnum.Machine))
      {
        dbContext.Parameters.Add(new MpxParameter
        {
          Id = Guid.CreateVersion7(),
          CorporationId = corpId,
          ScopeId = scopes[Mpx.Domain.Enums.MpxParameterScopeEnum.Machine].Id,
          ScopeCode = Mpx.Domain.Enums.MpxParameterScopeEnum.Machine,
          UserId = firstUser?.Id,
          MachineKey = "MPX-WORKSTATION-NVME-01",
          Namespace = "jrb.machine.env",
          Name = "Ambiente Local da Máquina & Mpx.Jarbass (Camada 5)",
          IsLockedBySovereign = false,
          IsExportable = true,
          System = true,
          Description = "Configurações locais de máquina que moldam o Mpx.Jarbass (caminhos .dev, .bkp, .kalupa e aceleração GPU). 100% portátil pós-formatação ou home-office.",
          SettingsJson = """
{
  "jrb.machine.activeDevRoot": "C:\\.dev\\Projetos\\Morphus",
  "jrb.machine.pausedDevRoot": "D:\\.dev",
  "jrb.machine.kalupaCoreRoot": "C:\\Users\\hebin\\.kalupa\\core",
  "jrb.machine.kalupaVaultRoot": "I:\\Meu Drive\\Base de Conhecimento\\Vault",
  "klp.vault.templatesFolder": "Templates",
  "klp.vault.notesFolder": "Notes",
  "klp.vault.filesFolder": "Files",
  "jrb.machine.gpuHardwareAcceleration": true,
  "mpx.draggable.elasticSnapBackMs": 160
}
"""
        });
        paramAndCompSeeded = true;
      }

      // Seed dos Objetos MpxScreenComponent da tela de Login (/security/signin -> Fluxo SignIn)
      if (!dbContext.ScreenComponents.IgnoreQueryFilters().Any(sc => sc.CorporationId == corpId) && compTypes.Count > 0)
      {
        var signInWkf = dbContext.WorkflowTypes.IgnoreQueryFilters()
            .Include(w => w.Configs)
              .ThenInclude(c => c.Actions)
            .FirstOrDefault(w => w.CorporationId == corpId && w.Name == "SignIn");

        var signInScreenCfg = signInWkf?.Configs.FirstOrDefault(c => c.Name.Contains("Tela de Login") || c.Order == 2);
        var actSubmit = signInScreenCfg?.Actions.FirstOrDefault(a => a.Name == "SubmitSignIn");
        var actSignUp = signInScreenCfg?.Actions.FirstOrDefault(a => a.Name == "GoToSignUp");
        var actForgot = signInScreenCfg?.Actions.FirstOrDefault(a => a.Name == "GoToForgotPassword");

        var dropZoneBoard = new MpxScreenComponent
        {
          Id = Guid.CreateVersion7(),
          CorporationId = corpId,
          ComponentTypeId = compTypes[Mpx.Domain.Enums.MpxComponentTypeEnum.MpxDroppable].Id,
          RouteId = signInRoute?.Id,
          WorkflowTypeId = signInWkf?.Id,
          StationId = signInScreenCfg?.StationId,
          WorkflowConfigId = signInScreenCfg?.Id,
          ComponentCode = "DRP_SIGNIN_MAIN_CARD",
          Label = "Berço Magnético: Card Central de Login (MpxDroppable)",
          TriggerEvent = "OnDrop",
          Order = 1,
          System = true,
          Description = "Zona MpxDroppable principal da tela /security/signin que recebe os componentes MpxDraggable em 100% width/height.",
          EmbeddedConfigJson = """
{
  "componentCode": "DRP_SIGNIN_MAIN_CARD",
  "tagName": "mpx-droppable",
  "routePath": "/security/signin",
  "workflowType": "SignIn",
  "stationName": "Tela de Login (SignIn)",
  "acceptedTags": ["mpx-input", "mpx-button", "mpx-card", "mpx-select"],
  "magneticGlowColor": "var(--mpx-magnetic-glow, #3b82f6)",
  "landingPulseMs": 600
}
"""
        };

        var inpEmail = new MpxScreenComponent
        {
          Id = Guid.CreateVersion7(),
          CorporationId = corpId,
          ComponentTypeId = compTypes[Mpx.Domain.Enums.MpxComponentTypeEnum.MpxInput].Id,
          ParentComponentId = dropZoneBoard.Id,
          RouteId = signInRoute?.Id,
          WorkflowTypeId = signInWkf?.Id,
          StationId = signInScreenCfg?.StationId,
          WorkflowConfigId = signInScreenCfg?.Id,
          EntityPropertyId = emailProp?.Id,
          ComponentCode = "INP_SIGNIN_EMAIL",
          Label = "E-mail Corporativo (SecUser.Email)",
          TriggerEvent = "OnInput",
          Order = 2,
          System = true,
          Description = "MpxInput envelopado em MpxDraggable, vinculado via .Reflected a CurrentUser.Email.",
          EmbeddedConfigJson = """
{
  "componentCode": "INP_SIGNIN_EMAIL",
  "tagName": "mpx-input",
  "wrappedInDraggable": true,
  "contextBinding": "CurrentUser.Email",
  "dataType": "Email",
  "required": true,
  "placeholder": "arquiteto@morphus.one",
  "validationRule": "EMAIL_FORMAT",
  "instantValidation": true
}
"""
        };

        var inpPassword = new MpxScreenComponent
        {
          Id = Guid.CreateVersion7(),
          CorporationId = corpId,
          ComponentTypeId = compTypes[Mpx.Domain.Enums.MpxComponentTypeEnum.MpxInput].Id,
          ParentComponentId = dropZoneBoard.Id,
          RouteId = signInRoute?.Id,
          WorkflowTypeId = signInWkf?.Id,
          StationId = signInScreenCfg?.StationId,
          WorkflowConfigId = signInScreenCfg?.Id,
          EntityPropertyId = passProp?.Id,
          ComponentCode = "INP_SIGNIN_PASSWORD",
          Label = "Senha de Acesso (SecUser.Password)",
          TriggerEvent = "OnInput",
          Order = 3,
          System = true,
          Description = "MpxInput envelopado em MpxDraggable, vinculado ao Contexto CurrentUser.Password com validação minLength=6 embarcada.",
          EmbeddedConfigJson = """
{
  "componentCode": "INP_SIGNIN_PASSWORD",
  "tagName": "mpx-input",
  "wrappedInDraggable": true,
  "contextBinding": "CurrentUser.Password",
  "dataType": "Password",
  "required": true,
  "minLength": 6,
  "placeholder": "••••••••",
  "instantValidation": true
}
"""
        };

        var btnSubmit = new MpxScreenComponent
        {
          Id = Guid.CreateVersion7(),
          CorporationId = corpId,
          ComponentTypeId = compTypes[Mpx.Domain.Enums.MpxComponentTypeEnum.MpxButton].Id,
          ParentComponentId = dropZoneBoard.Id,
          RouteId = signInRoute?.Id,
          WorkflowTypeId = signInWkf?.Id,
          StationId = signInScreenCfg?.StationId,
          WorkflowConfigId = signInScreenCfg?.Id,
          WorkflowActionId = actSubmit?.Id,
          ComponentCode = "BTN_SIGNIN_SUBMIT",
          Label = "Entrar no Ecossistema Morphus",
          TriggerEvent = "OnClick",
          Order = 4,
          System = true,
          Description = "MpxButton principal com Id registrado e configurações do fluxo SignIn embarcadas na renderização (0,01ms no clique).",
          EmbeddedConfigJson = $$"""
{
  "componentCode": "BTN_SIGNIN_SUBMIT",
  "tagName": "mpx-button",
  "wrappedInDraggable": true,
  "workflowType": "SignIn",
  "workflowTypeId": "{{signInWkf?.Id}}",
  "stationConfigId": "{{signInScreenCfg?.Id}}",
  "actionId": "{{actSubmit?.Id}}",
  "actionCode": "SubmitSignIn",
  "nextStationName": "SecurityHandler.Login (Process)",
  "requiredContextFields": ["CurrentUser.Email", "CurrentUser.Password"],
  "disableOnClick": true,
  "showSpinner": true,
  "loadingLabel": "Autenticando no SecurityHandler...",
  "variant": "primary"
}
"""
        };

        var btnGoSignUp = new MpxScreenComponent
        {
          Id = Guid.CreateVersion7(),
          CorporationId = corpId,
          ComponentTypeId = compTypes[Mpx.Domain.Enums.MpxComponentTypeEnum.MpxButton].Id,
          ParentComponentId = dropZoneBoard.Id,
          RouteId = signInRoute?.Id,
          WorkflowTypeId = signInWkf?.Id,
          StationId = signInScreenCfg?.StationId,
          WorkflowConfigId = signInScreenCfg?.Id,
          WorkflowActionId = actSignUp?.Id,
          ComponentCode = "BTN_SIGNIN_GOTO_SIGNUP",
          Label = "Criar Nova Conta (Subfluxo SignUp)",
          TriggerEvent = "OnClick",
          Order = 5,
          System = true,
          Description = "MpxButton que aciona a estação Output para chamar o Subfluxo SignUp e retornar à porta Input do SignIn.",
          EmbeddedConfigJson = $$"""
{
  "componentCode": "BTN_SIGNIN_GOTO_SIGNUP",
  "tagName": "mpx-button",
  "wrappedInDraggable": true,
  "workflowType": "SignIn",
  "workflowTypeId": "{{signInWkf?.Id}}",
  "stationConfigId": "{{signInScreenCfg?.Id}}",
  "actionId": "{{actSignUp?.Id}}",
  "actionCode": "GoToSignUp",
  "nextStationName": "Chamar Subfluxo SignUp (Output ➔ SignUp)",
  "requiredContextFields": [],
  "disableOnClick": true,
  "showSpinner": true,
  "loadingLabel": "Abrindo Subfluxo SignUp...",
  "variant": "emerald"
}
"""
        };

        var btnGoForgot = new MpxScreenComponent
        {
          Id = Guid.CreateVersion7(),
          CorporationId = corpId,
          ComponentTypeId = compTypes[Mpx.Domain.Enums.MpxComponentTypeEnum.MpxButton].Id,
          ParentComponentId = dropZoneBoard.Id,
          RouteId = signInRoute?.Id,
          WorkflowTypeId = signInWkf?.Id,
          StationId = signInScreenCfg?.StationId,
          WorkflowConfigId = signInScreenCfg?.Id,
          WorkflowActionId = actForgot?.Id,
          ComponentCode = "BTN_SIGNIN_GOTO_FORGOT",
          Label = "Esqueci Minha Senha (Subfluxo ForgotPassword)",
          TriggerEvent = "OnClick",
          Order = 6,
          System = true,
          Description = "MpxButton que aciona a estação Output para chamar o Subfluxo ForgotPassword e retornar ao SignIn.",
          EmbeddedConfigJson = $$"""
{
  "componentCode": "BTN_SIGNIN_GOTO_FORGOT",
  "tagName": "mpx-button",
  "wrappedInDraggable": true,
  "workflowType": "SignIn",
  "workflowTypeId": "{{signInWkf?.Id}}",
  "stationConfigId": "{{signInScreenCfg?.Id}}",
  "actionId": "{{actForgot?.Id}}",
  "actionCode": "GoToForgotPassword",
  "nextStationName": "Chamar Subfluxo ForgotPassword (Output ➔ ForgotPassword)",
  "requiredContextFields": ["CurrentUser.Email"],
  "disableOnClick": true,
  "showSpinner": true,
  "loadingLabel": "Iniciando Recuperação via Relay...",
  "variant": "amber"
}
"""
        };

        dbContext.ScreenComponents.AddRange(dropZoneBoard, inpEmail, inpPassword, btnSubmit, btnGoSignUp, btnGoForgot);
        paramAndCompSeeded = true;
      }
    }

    if (paramAndCompSeeded)
    {
      dbContext.SaveChanges();
      Console.WriteLine(">>> CASCATA MPX_PARAMETERS (0..5) E COMPONENTES DE TELA EMBARCADOS (mpx_screen_components) SEMEADOS COM SUCESSO! <<<");
    }
  }

  private static void SeedDefaultLoginWorkflows(MpxDbContext dbContext)
  {
    var stationTypes = dbContext.WorkflowStationTypes.IgnoreQueryFilters()
        .Where(t => t.CorporationId == null && t.System)
        .ToList();
    if (stationTypes.Count == 0)
      return;

    var triggerTypes = dbContext.WorkflowTriggerTypes.IgnoreQueryFilters()
        .Where(t => t.CorporationId == null && t.System)
        .ToDictionary(t => t.Code, t => t);

    var routes = dbContext.Routes.IgnoreQueryFilters()
        .Where(r => r.CorporationId == null && r.System)
        .ToDictionary(r => r.Path, r => r, StringComparer.OrdinalIgnoreCase);

    var secUserEntityDef = dbContext.EntityDefinitions.IgnoreQueryFilters()
        .FirstOrDefault(e => e.Name == "SecUser" || e.TableName == "sec_users");

    var corpIds = dbContext.Corporations.IgnoreQueryFilters().Select(c => c.Id).ToList();
    var anySeeded = false;

    foreach (var corpId in corpIds)
    {
      var existingStations = dbContext.Stations.IgnoreQueryFilters()
          .Where(s => s.CorporationId == corpId)
          .ToDictionary(s => s.Code, s => s, StringComparer.OrdinalIgnoreCase);

      foreach (var st in stationTypes)
      {
        if (!existingStations.ContainsKey(st.Name))
        {
          var station = new WkfStation
          {
            Id = Guid.CreateVersion7(),
            CorporationId = corpId,
            StationTypeId = st.Id,
            Code = st.Name,
            Name = st.Label,
            HasLayout = st.HasLayout,
            Icon = st.Icon,
            Color = st.Color,
            System = true,
            Description = st.Description
          };
          dbContext.Stations.Add(station);
          existingStations[st.Name] = station;
          anySeeded = true;
        }
      }

      if (anySeeded)
      {
        dbContext.SaveChanges();
      }

      var existingFlows = dbContext.WorkflowTypes.IgnoreQueryFilters()
          .Where(w => w.CorporationId == corpId)
          .Select(w => w.Name)
          .ToHashSet(StringComparer.OrdinalIgnoreCase);

      if (existingFlows.Contains("SignIn"))
        continue;

      routes.TryGetValue("/security/signin", out var signInRoute);
      routes.TryGetValue("/security/signup", out var signUpRoute);
      routes.TryGetValue("/security/forgot-password", out var forgotRoute);
      routes.TryGetValue("/morphus", out var portalRoute);
      triggerTypes.TryGetValue(Mpx.Domain.Enums.WkfTriggerTypeEnum.HtmlAction, out var htmlTrigger);
      triggerTypes.TryGetValue(Mpx.Domain.Enums.WkfTriggerTypeEnum.OnSubWorkflow, out var subWkfTrigger);

      // 1. Subfluxo SignUp
      var signUpWkf = new WkfType
      {
        Id = Guid.CreateVersion7(),
        CorporationId = corpId,
        Name = "SignUp",
        EntityName = "SecUser",
        RootEntityDefinitionId = secUserEntityDef?.Id,
        TriggerTypeId = subWkfTrigger?.Id,
        TriggerRouteId = signUpRoute?.Id,
        TriggerType = "OnSubWorkflow",
        TriggerEvent = "OnSubWorkflow",
        Icon = "user-plus",
        Color = "#10b981",
        System = true,
        Description = "Subfluxo de criação de conta (Sign Up) chamado pelo fluxo principal SignIn."
      };
      dbContext.WorkflowTypes.Add(signUpWkf);

      var signUpInput = new WkfTypeConfig
      {
        Id = Guid.CreateVersion7(),
        CorporationId = corpId,
        WorkflowTypeId = signUpWkf.Id,
        StationId = existingStations["Input"].Id,
        Name = "Entrada SignUp",
        Order = 1,
        PositionX = 120,
        PositionY = 220,
        Icon = "log-in",
        Color = "#10b981",
        System = true,
        Description = "Recebe chamada do fluxo pai SignIn."
      };
      var signUpScreen = new WkfTypeConfig
      {
        Id = Guid.CreateVersion7(),
        CorporationId = corpId,
        WorkflowTypeId = signUpWkf.Id,
        StationId = existingStations["Screen"].Id,
        Name = "Tela Criar Conta",
        Order = 2,
        PositionX = 420,
        PositionY = 220,
        HasLayout = true,
        Icon = "layout-template",
        Color = "#3b82f6",
        System = true,
        Description = "Formulário de cadastro de novo usuário."
      };
      var signUpProcess = new WkfTypeConfig
      {
        Id = Guid.CreateVersion7(),
        CorporationId = corpId,
        WorkflowTypeId = signUpWkf.Id,
        StationId = existingStations["Process"].Id,
        Name = "SecurityHandler.CreateAccount",
        Order = 3,
        PositionX = 720,
        PositionY = 220,
        Icon = "cpu",
        Color = "#6366f1",
        System = true,
        Description = "Cria o SecUser e gera token de confirmação de e-mail."
      };
      var signUpEmail = new WkfTypeConfig
      {
        Id = Guid.CreateVersion7(),
        CorporationId = corpId,
        WorkflowTypeId = signUpWkf.Id,
        StationId = existingStations["Email"].Id,
        Name = "Disparar E-mail Boas-Vindas",
        Order = 4,
        PositionX = 1020,
        PositionY = 220,
        Icon = "send",
        Color = "#ec4899",
        System = true,
        Description = "Envia código de confirmação via Relay."
      };
      var signUpOutput = new WkfTypeConfig
      {
        Id = Guid.CreateVersion7(),
        CorporationId = corpId,
        WorkflowTypeId = signUpWkf.Id,
        StationId = existingStations["Output"].Id,
        Name = "Retornar ao SignIn",
        Order = 5,
        PositionX = 1320,
        PositionY = 220,
        Icon = "log-out",
        Color = "#8b5cf6",
        System = true,
        Description = "Devolve o novo SecUser para a porta Input do fluxo SignIn."
      };
      var signUpError = new WkfTypeConfig
      {
        Id = Guid.CreateVersion7(),
        CorporationId = corpId,
        WorkflowTypeId = signUpWkf.Id,
        StationId = existingStations["Error"].Id,
        Name = "Error",
        Order = 99,
        PositionX = 1080,
        PositionY = 40,
        IsIsolatedErrorCatcher = true,
        Icon = "octagon-alert",
        Color = "#ef4444",
        System = true,
        Description = "Se alguma etapa do fluxo apresentar algum erro ele vai ser jogado para este local, e aqui dentro você saberá exatamente de onde veio e o motivo do fluxo ter vindo para cá."
      };
      dbContext.WorkflowTypeConfigs.AddRange(signUpInput, signUpScreen, signUpProcess, signUpEmail, signUpOutput, signUpError);

      // 2. Subfluxo ForgotPassword
      var forgotWkf = new WkfType
      {
        Id = Guid.CreateVersion7(),
        CorporationId = corpId,
        Name = "ForgotPassword",
        EntityName = "SecUser",
        RootEntityDefinitionId = secUserEntityDef?.Id,
        TriggerTypeId = subWkfTrigger?.Id,
        TriggerRouteId = forgotRoute?.Id,
        TriggerType = "OnSubWorkflow",
        TriggerEvent = "OnSubWorkflow",
        Icon = "key-round",
        Color = "#f59e0b",
        System = true,
        Description = "Subfluxo de recuperação de senha chamado pelo fluxo principal SignIn."
      };
      dbContext.WorkflowTypes.Add(forgotWkf);

      var forgotInput = new WkfTypeConfig
      {
        Id = Guid.CreateVersion7(),
        CorporationId = corpId,
        WorkflowTypeId = forgotWkf.Id,
        StationId = existingStations["Input"].Id,
        Name = "Entrada ForgotPassword",
        Order = 1,
        PositionX = 120,
        PositionY = 220,
        Icon = "log-in",
        Color = "#10b981",
        System = true,
        Description = "Recebe chamada do fluxo pai SignIn."
      };
      var forgotScreen = new WkfTypeConfig
      {
        Id = Guid.CreateVersion7(),
        CorporationId = corpId,
        WorkflowTypeId = forgotWkf.Id,
        StationId = existingStations["Screen"].Id,
        Name = "Tela Esqueci a Senha",
        Order = 2,
        PositionX = 420,
        PositionY = 220,
        HasLayout = true,
        Icon = "layout-template",
        Color = "#3b82f6",
        System = true,
        Description = "Solicita e-mail e código de recuperação."
      };
      var forgotEmail = new WkfTypeConfig
      {
        Id = Guid.CreateVersion7(),
        CorporationId = corpId,
        WorkflowTypeId = forgotWkf.Id,
        StationId = existingStations["Email"].Id,
        Name = "Enviar Link/Código Reset",
        Order = 3,
        PositionX = 720,
        PositionY = 220,
        Icon = "send",
        Color = "#ec4899",
        System = true,
        Description = "Dispara e-mail de redefinição de senha via Relay."
      };
      var forgotOutput = new WkfTypeConfig
      {
        Id = Guid.CreateVersion7(),
        CorporationId = corpId,
        WorkflowTypeId = forgotWkf.Id,
        StationId = existingStations["Output"].Id,
        Name = "Voltar para Login",
        Order = 4,
        PositionX = 1020,
        PositionY = 220,
        Icon = "log-out",
        Color = "#8b5cf6",
        System = true,
        Description = "Retorna à porta Input da tela de Login após redefinir."
      };
      var forgotError = new WkfTypeConfig
      {
        Id = Guid.CreateVersion7(),
        CorporationId = corpId,
        WorkflowTypeId = forgotWkf.Id,
        StationId = existingStations["Error"].Id,
        Name = "Error",
        Order = 99,
        PositionX = 1080,
        PositionY = 40,
        IsIsolatedErrorCatcher = true,
        Icon = "octagon-alert",
        Color = "#ef4444",
        System = true,
        Description = "Se alguma etapa do fluxo apresentar algum erro ele vai ser jogado para este local, e aqui dentro você saberá exatamente de onde veio e o motivo do fluxo ter vindo para cá."
      };
      dbContext.WorkflowTypeConfigs.AddRange(forgotInput, forgotScreen, forgotEmail, forgotOutput, forgotError);

      // 3. Fluxo Principal SignIn
      var signInWkf = new WkfType
      {
        Id = Guid.CreateVersion7(),
        CorporationId = corpId,
        Name = "SignIn",
        EntityName = "SecUser",
        RootEntityDefinitionId = secUserEntityDef?.Id,
        TriggerTypeId = htmlTrigger?.Id,
        TriggerRouteId = signInRoute?.Id,
        TriggerType = "HtmlAction",
        TriggerEvent = "OnScreenLoad",
        Icon = "log-in",
        Color = "#3b82f6",
        System = true,
        Description = "Fluxo principal de Autenticação (SignIn), Confirmação de E-mail, Boarding em 4 etapas, Seleção de Corporação e chamadas aos Subfluxos SignUp e ForgotPassword."
      };
      dbContext.WorkflowTypes.Add(signInWkf);

      if (secUserEntityDef is not null)
      {
        dbContext.WorkflowTypeContexts.AddRange(
          new WkfTypeContext { Id = Guid.CreateVersion7(), CorporationId = corpId, WorkflowTypeId = signInWkf.Id, EntityDefinitionId = secUserEntityDef.Id, Alias = "CurrentUser", IsRootEntity = true, Order = 1, System = true, Description = "Usuário em processo de autenticação no Contexto / Grupo de Dados." },
          new WkfTypeContext { Id = Guid.CreateVersion7(), CorporationId = corpId, WorkflowTypeId = signUpWkf.Id, EntityDefinitionId = secUserEntityDef.Id, Alias = "NewUser", IsRootEntity = true, Order = 1, System = true, Description = "Novo usuário sendo cadastrado no subfluxo SignUp." },
          new WkfTypeContext { Id = Guid.CreateVersion7(), CorporationId = corpId, WorkflowTypeId = forgotWkf.Id, EntityDefinitionId = secUserEntityDef.Id, Alias = "RecoveryUser", IsRootEntity = true, Order = 1, System = true, Description = "Usuário solicitando recuperação de senha." }
        );
      }

      var signInInput = new WkfTypeConfig
      {
        Id = Guid.CreateVersion7(),
        CorporationId = corpId,
        WorkflowTypeId = signInWkf.Id,
        StationId = existingStations["Input"].Id,
        Name = "Porta de Entrada Login",
        Order = 1,
        PositionX = 340,
        PositionY = 260,
        Icon = "log-in",
        Color = "#10b981",
        System = true,
        Description = "Recebe o Gatilho Play (/security/signin) e também o retorno dos subfluxos SignUp e ForgotPassword."
      };
      var signInScreen = new WkfTypeConfig
      {
        Id = Guid.CreateVersion7(),
        CorporationId = corpId,
        WorkflowTypeId = signInWkf.Id,
        StationId = existingStations["Screen"].Id,
        Name = "Tela de Login (SignIn)",
        Order = 2,
        PositionX = 640,
        PositionY = 260,
        HasLayout = true,
        Icon = "layout-template",
        Color = "#3b82f6",
        System = true,
        Description = "Tela principal com E-mail, Senha, Entrar, Criar Conta e Esqueci a Senha."
      };
      var callSignUpOutput = new WkfTypeConfig
      {
        Id = Guid.CreateVersion7(),
        CorporationId = corpId,
        WorkflowTypeId = signInWkf.Id,
        StationId = existingStations["Output"].Id,
        Name = "Chamar Subfluxo SignUp",
        Order = 3,
        PositionX = 640,
        PositionY = 80,
        TargetSubWorkflowTypeId = signUpWkf.Id,
        ReturnInputConfigId = signInInput.Id,
        Icon = "log-out",
        Color = "#8b5cf6",
        System = true,
        Description = "Sai para o subfluxo SignUp e retorna na Porta de Entrada Login."
      };
      var callForgotOutput = new WkfTypeConfig
      {
        Id = Guid.CreateVersion7(),
        CorporationId = corpId,
        WorkflowTypeId = signInWkf.Id,
        StationId = existingStations["Output"].Id,
        Name = "Chamar Subfluxo ForgotPassword",
        Order = 4,
        PositionX = 640,
        PositionY = 440,
        TargetSubWorkflowTypeId = forgotWkf.Id,
        ReturnInputConfigId = signInInput.Id,
        Icon = "log-out",
        Color = "#f59e0b",
        System = true,
        Description = "Sai para o subfluxo ForgotPassword e retorna na Porta de Entrada Login."
      };
      var authProcess = new WkfTypeConfig
      {
        Id = Guid.CreateVersion7(),
        CorporationId = corpId,
        WorkflowTypeId = signInWkf.Id,
        StationId = existingStations["Process"].Id,
        Name = "SecurityHandler.Login",
        Order = 5,
        PositionX = 960,
        PositionY = 260,
        Icon = "cpu",
        Color = "#6366f1",
        System = true,
        Description = "Valida credenciais, status da conta, confirmação de e-mail, boarding e corporações na Security.Api."
      };
      var confirmEmailScreen = new WkfTypeConfig
      {
        Id = Guid.CreateVersion7(),
        CorporationId = corpId,
        WorkflowTypeId = signInWkf.Id,
        StationId = existingStations["Screen"].Id,
        Name = "Tela Confirmar E-mail",
        Order = 6,
        PositionX = 1280,
        PositionY = 100,
        HasLayout = true,
        Icon = "mail-check",
        Color = "#06b6d4",
        System = true,
        Description = "Exibida quando EmailConfirmed == false."
      };
      var boardingScreen = new WkfTypeConfig
      {
        Id = Guid.CreateVersion7(),
        CorporationId = corpId,
        WorkflowTypeId = signInWkf.Id,
        StationId = existingStations["Screen"].Id,
        Name = "Onboarding (4 Etapas)",
        Order = 7,
        PositionX = 1280,
        PositionY = 260,
        HasLayout = true,
        Icon = "rocket",
        Color = "#8b5cf6",
        System = true,
        Description = "Configuração inicial de Corporação, Workspace e Aplicações quando OnboardingCompleted == false."
      };
      var selectCorpScreen = new WkfTypeConfig
      {
        Id = Guid.CreateVersion7(),
        CorporationId = corpId,
        WorkflowTypeId = signInWkf.Id,
        StationId = existingStations["Screen"].Id,
        Name = "Selecionar Corporação",
        Order = 8,
        PositionX = 1280,
        PositionY = 420,
        HasLayout = true,
        Icon = "building-2",
        Color = "#6366f1",
        System = true,
        Description = "Exibida quando o usuário possui acesso a múltiplas corporações."
      };
      var redirectPortal = new WkfTypeConfig
      {
        Id = Guid.CreateVersion7(),
        CorporationId = corpId,
        WorkflowTypeId = signInWkf.Id,
        StationId = existingStations["Redirect"].Id,
        Name = "Ir para Portal Morphus",
        Order = 9,
        PositionX = 1600,
        PositionY = 260,
        TargetRouteId = portalRoute?.Id,
        Icon = "compass",
        Color = "#10b981",
        System = true,
        Description = "Redireciona para a MpxRoute /morphus/portal após autenticação completa."
      };
      var signInError = new WkfTypeConfig
      {
        Id = Guid.CreateVersion7(),
        CorporationId = corpId,
        WorkflowTypeId = signInWkf.Id,
        StationId = existingStations["Error"].Id,
        Name = "Error",
        Order = 99,
        PositionX = 1580,
        PositionY = 40,
        IsIsolatedErrorCatcher = true,
        Icon = "octagon-alert",
        Color = "#ef4444",
        System = true,
        Description = "Se alguma etapa do fluxo apresentar algum erro ele vai ser jogado para este local, e aqui dentro você saberá exatamente de onde veio e o motivo do fluxo ter vindo para cá."
      };

      dbContext.WorkflowTypeConfigs.AddRange(
        signInInput,
        signInScreen,
        callSignUpOutput,
        callForgotOutput,
        authProcess,
        confirmEmailScreen,
        boardingScreen,
        selectCorpScreen,
        redirectPortal,
        signInError
      );

      dbContext.WorkflowTypeConfigActions.AddRange(
        new WkfTypeConfigAction { Id = Guid.CreateVersion7(), CorporationId = corpId, WorkflowTypeConfigId = signInInput.Id, NextWorkflowTypeConfigId = signInScreen.Id, Name = "OpenSignInScreen", Label = "Exibir Tela", IsAutomatic = true, Order = 1, Icon = "arrow-right", Color = "#10b981", System = true },
        new WkfTypeConfigAction { Id = Guid.CreateVersion7(), CorporationId = corpId, WorkflowTypeConfigId = signInScreen.Id, NextWorkflowTypeConfigId = authProcess.Id, Name = "SubmitSignIn", Label = "Entrar", ControlType = "Button", ExecuteWhen = "OnSubmit", Order = 1, Icon = "log-in", Color = "#3b82f6", System = true },
        new WkfTypeConfigAction { Id = Guid.CreateVersion7(), CorporationId = corpId, WorkflowTypeConfigId = signInScreen.Id, NextWorkflowTypeConfigId = callSignUpOutput.Id, Name = "GoToSignUp", Label = "Criar Conta", ControlType = "Link", ExecuteWhen = "OnClick", Order = 2, Icon = "user-plus", Color = "#10b981", System = true },
        new WkfTypeConfigAction { Id = Guid.CreateVersion7(), CorporationId = corpId, WorkflowTypeConfigId = signInScreen.Id, NextWorkflowTypeConfigId = callForgotOutput.Id, Name = "GoToForgotPassword", Label = "Esqueci Minha Senha", ControlType = "Link", ExecuteWhen = "OnClick", Order = 3, Icon = "key-round", Color = "#f59e0b", System = true },
        new WkfTypeConfigAction { Id = Guid.CreateVersion7(), CorporationId = corpId, WorkflowTypeConfigId = confirmEmailScreen.Id, NextWorkflowTypeConfigId = boardingScreen.Id, Name = "EmailConfirmedNext", Label = "Confirmar Código", ControlType = "Button", ExecuteWhen = "OnSubmit", Order = 1, Icon = "check", Color = "#10b981", System = true },
        new WkfTypeConfigAction { Id = Guid.CreateVersion7(), CorporationId = corpId, WorkflowTypeConfigId = boardingScreen.Id, NextWorkflowTypeConfigId = redirectPortal.Id, Name = "FinishBoarding", Label = "Concluir Boarding", ControlType = "Button", ExecuteWhen = "OnSubmit", Order = 1, Icon = "rocket", Color = "#8b5cf6", System = true },
        new WkfTypeConfigAction { Id = Guid.CreateVersion7(), CorporationId = corpId, WorkflowTypeConfigId = selectCorpScreen.Id, NextWorkflowTypeConfigId = redirectPortal.Id, Name = "SelectCorporationAction", Label = "Acessar Corporação", ControlType = "Button", ExecuteWhen = "OnClick", Order = 1, Icon = "building-2", Color = "#6366f1", System = true },
        // SignUp actions
        new WkfTypeConfigAction { Id = Guid.CreateVersion7(), CorporationId = corpId, WorkflowTypeConfigId = signUpInput.Id, NextWorkflowTypeConfigId = signUpScreen.Id, Name = "OpenSignUpScreen", Label = "Abrir Formulário", IsAutomatic = true, Order = 1, Icon = "arrow-right", Color = "#10b981", System = true },
        new WkfTypeConfigAction { Id = Guid.CreateVersion7(), CorporationId = corpId, WorkflowTypeConfigId = signUpScreen.Id, NextWorkflowTypeConfigId = signUpProcess.Id, Name = "SubmitSignUp", Label = "Cadastrar", ControlType = "Button", ExecuteWhen = "OnSubmit", Order = 1, Icon = "user-plus", Color = "#10b981", System = true },
        new WkfTypeConfigAction { Id = Guid.CreateVersion7(), CorporationId = corpId, WorkflowTypeConfigId = signUpProcess.Id, NextWorkflowTypeConfigId = signUpEmail.Id, Name = "SendWelcomeMail", Label = "Disparar E-mail", IsAutomatic = true, Order = 1, Icon = "send", Color = "#ec4899", System = true },
        new WkfTypeConfigAction { Id = Guid.CreateVersion7(), CorporationId = corpId, WorkflowTypeConfigId = signUpEmail.Id, NextWorkflowTypeConfigId = signUpOutput.Id, Name = "ReturnToParentSignIn", Label = "Voltar ao Login", IsAutomatic = true, Order = 1, Icon = "log-out", Color = "#8b5cf6", System = true },
        // ForgotPassword actions
        new WkfTypeConfigAction { Id = Guid.CreateVersion7(), CorporationId = corpId, WorkflowTypeConfigId = forgotInput.Id, NextWorkflowTypeConfigId = forgotScreen.Id, Name = "OpenForgotScreen", Label = "Abrir Recuperação", IsAutomatic = true, Order = 1, Icon = "arrow-right", Color = "#10b981", System = true },
        new WkfTypeConfigAction { Id = Guid.CreateVersion7(), CorporationId = corpId, WorkflowTypeConfigId = forgotScreen.Id, NextWorkflowTypeConfigId = forgotEmail.Id, Name = "RequestPasswordReset", Label = "Enviar Código", ControlType = "Button", ExecuteWhen = "OnSubmit", Order = 1, Icon = "send", Color = "#f59e0b", System = true },
        new WkfTypeConfigAction { Id = Guid.CreateVersion7(), CorporationId = corpId, WorkflowTypeConfigId = forgotEmail.Id, NextWorkflowTypeConfigId = forgotOutput.Id, Name = "ReturnFromForgot", Label = "Voltar ao Login", IsAutomatic = true, Order = 1, Icon = "log-out", Color = "#8b5cf6", System = true }
      );

      dbContext.WorkflowTypeConfigConditions.AddRange(
        new WkfTypeConfigCondition { Id = Guid.CreateVersion7(), CorporationId = corpId, WorkflowTypeConfigId = authProcess.Id, ConditionType = "If", PropertyName = "CurrentUser.EmailConfirmed", DataType = "boolean", Operator = "Equals", Value = "false", NextWorkflowTypeConfigId = confirmEmailScreen.Id, ElseNextWorkflowTypeConfigId = boardingScreen.Id, Order = 1, System = true, Description = "Se e-mail não estiver confirmado, desvia para Tela Confirmar E-mail." },
        new WkfTypeConfigCondition { Id = Guid.CreateVersion7(), CorporationId = corpId, WorkflowTypeConfigId = authProcess.Id, ConditionType = "If", PropertyName = "CurrentUser.OnboardingCompleted", DataType = "boolean", Operator = "Equals", Value = "false", NextWorkflowTypeConfigId = boardingScreen.Id, ElseNextWorkflowTypeConfigId = selectCorpScreen.Id, Order = 2, System = true, Description = "Se boarding não estiver concluído, encaminha para Onboarding em 4 etapas." },
        new WkfTypeConfigCondition { Id = Guid.CreateVersion7(), CorporationId = corpId, WorkflowTypeConfigId = authProcess.Id, ConditionType = "If", PropertyName = "CurrentUser.CorporationUsers.Count", DataType = "number", Operator = "GreaterThan", Value = "1", NextWorkflowTypeConfigId = selectCorpScreen.Id, ElseNextWorkflowTypeConfigId = redirectPortal.Id, Order = 3, System = true, Description = "Se pertencer a mais de 1 corporação, escolhe a corporação antes de ir ao Portal." }
      );

      anySeeded = true;
    }

    if (anySeeded)
    {
      dbContext.SaveChanges();
      Console.WriteLine(">>> FLUXOS NATIVOS DE LOGIN (SignIn + Subfluxos SignUp e ForgotPassword) SEMEADOS COM PLAY CENTRAL E ERROR ISOLADO! <<<");
    }
  }

  private static void SeedSystemEntityCatalog(MpxDbContext dbContext)
  {
    var existingEntities = dbContext.EntityDefinitions
        .Include(e => e.Properties)
        .Where(e => e.CorporationId == null && e.System)
        .ToList();

    var entityByName = existingEntities.ToDictionary(e => e.Name, StringComparer.OrdinalIgnoreCase);
    var entityByClrType = new Dictionary<Type, EntityDefinition>();
    var hasChanges = false;

    foreach (var et in dbContext.Model.GetEntityTypes())
    {
      var clrType = et.ClrType;
      if (clrType.IsAbstract)
        continue;

      var tableName = et.GetTableName() ?? clrType.Name;
      var entityName = clrType.Name;
      var moduleName = InferModuleNameFromTable(tableName);

      if (!entityByName.TryGetValue(entityName, out var entityDef))
      {
        entityDef = new EntityDefinition
        {
          Id = Guid.NewGuid(),
          CorporationId = null,
          Name = entityName,
          TableName = tableName,
          Label = FormatFriendlyLabel(entityName),
          PluralLabel = FormatFriendlyLabel(entityName) + "s",
          ModuleName = moduleName,
          Icon = InferEntityIcon(moduleName, entityName),
          System = true,
          Inactive = false,
          Description = $"Entidade nativa do módulo {moduleName} ({tableName})."
        };
        dbContext.EntityDefinitions.Add(entityDef);
        entityByName[entityName] = entityDef;
        hasChanges = true;
      }

      entityByClrType[clrType] = entityDef;
    }

    if (hasChanges)
    {
      dbContext.SaveChanges();
    }

    var propChanges = false;
    foreach (var et in dbContext.Model.GetEntityTypes())
    {
      if (!entityByClrType.TryGetValue(et.ClrType, out var ownerDef))
        continue;

      var existingProps = ownerDef.Properties.ToDictionary(p => p.Name, StringComparer.OrdinalIgnoreCase);
      var order = existingProps.Count;

      foreach (var prop in et.GetProperties())
      {
        if (existingProps.ContainsKey(prop.Name))
          continue;

        var isPk = prop.IsPrimaryKey();
        var isFk = prop.IsForeignKey();
        Guid? targetDefId = null;

        if (isFk)
        {
          var fk = prop.GetContainingForeignKeys().FirstOrDefault();
          if (fk is not null && entityByClrType.TryGetValue(fk.PrincipalEntityType.ClrType, out var principalDef))
          {
            targetDefId = principalDef.Id;
          }
        }

        var (dataType, controlType) = InferScalarDataType(prop.Name, prop.ClrType);
        var maxLen = prop.GetMaxLength();
        var colName = prop.GetColumnName();

        var newProp = new EntityProperty
        {
          Id = Guid.NewGuid(),
          CorporationId = null,
          EntityDefinitionId = ownerDef.Id,
          Name = prop.Name,
          ColumnName = colName,
          Label = FormatFriendlyLabel(prop.Name),
          DataType = dataType,
          DefaultControlType = isFk ? "Select" : controlType,
          TargetEntityDefinitionId = targetDefId,
          ForeignKeyPropertyName = isFk ? prop.Name : null,
          IsPrimaryKey = isPk,
          IsForeignKey = isFk,
          IsRequired = !prop.IsNullable,
          MaxLength = maxLen,
          Order = ++order,
          System = true,
          Inactive = false
        };

        dbContext.EntityProperties.Add(newProp);
        existingProps[prop.Name] = newProp;
        propChanges = true;
      }

      foreach (var nav in et.GetNavigations())
      {
        if (existingProps.ContainsKey(nav.Name))
          continue;

        entityByClrType.TryGetValue(nav.TargetEntityType.ClrType, out var targetDef);
        var fkPropName = nav.ForeignKey.Properties.FirstOrDefault()?.Name;
        var isCollection = nav.IsCollection;

        var navProp = new EntityProperty
        {
          Id = Guid.NewGuid(),
          CorporationId = null,
          EntityDefinitionId = ownerDef.Id,
          Name = nav.Name,
          ColumnName = null,
          Label = FormatFriendlyLabel(nav.Name),
          DataType = isCollection ? "ListOfEntities" : "Entity",
          DefaultControlType = isCollection ? "MultiSelect" : "Select",
          TargetEntityDefinitionId = targetDef?.Id,
          ForeignKeyPropertyName = fkPropName,
          IsPrimaryKey = false,
          IsForeignKey = false,
          IsRequired = !isCollection && nav.ForeignKey.IsRequired,
          Order = ++order,
          System = true,
          Inactive = false
        };

        dbContext.EntityProperties.Add(navProp);
        existingProps[nav.Name] = navProp;
        propChanges = true;
      }
    }

    if (propChanges)
    {
      dbContext.SaveChanges();
      Console.WriteLine(">>> CATÁLOGO DE ENTIDADES E PROPRIEDADES (mpx_entities / mpx_entity_properties) SINCRONIZADO VIA REFLECTION! <<<");
    }
  }

  private static string InferModuleNameFromTable(string tableName)
  {
    if (tableName.StartsWith("sec_", StringComparison.OrdinalIgnoreCase))
      return "Security";
    if (tableName.StartsWith("wkf_", StringComparison.OrdinalIgnoreCase))
      return "Workflow";
    if (tableName.StartsWith("jrb_", StringComparison.OrdinalIgnoreCase))
      return "Jarbass";
    if (tableName.StartsWith("mpx_emails", StringComparison.OrdinalIgnoreCase))
      return "Send";
    if (tableName.StartsWith("mpx_feature", StringComparison.OrdinalIgnoreCase) ||
        tableName.Equals("mpx_module_categories", StringComparison.OrdinalIgnoreCase) ||
        tableName.Equals("mpx_modules", StringComparison.OrdinalIgnoreCase))
      return "Website";
    return "Morphus";
  }

  private static string InferEntityIcon(string moduleName, string entityName)
  {
    return moduleName switch
    {
      "Security" => entityName.Contains("User") ? "users" : "shield-check",
      "Workflow" => "workflow",
      "Jarbass" => "bot",
      "Send" => "send",
      "Website" => "globe",
      _ => entityName.Contains("Corporation") ? "building-2" : "database"
    };
  }

  private static (string DataType, string ControlType) InferScalarDataType(string propName, Type clrType)
  {
    var underlying = Nullable.GetUnderlyingType(clrType) ?? clrType;
    if (underlying == typeof(Guid))
      return ("Guid", "Input");
    if (underlying == typeof(bool))
      return ("Boolean", "Switch");
    if (underlying == typeof(int) || underlying == typeof(long) || underlying == typeof(short))
      return ("Number", "NumberInput");
    if (underlying == typeof(decimal) || underlying == typeof(double) || underlying == typeof(float))
      return ("Decimal", "CurrencyInput");
    if (underlying == typeof(DateTime) || underlying == typeof(DateTimeOffset))
      return ("DateTime", "DatePicker");
    if (propName.Contains("Email", StringComparison.OrdinalIgnoreCase))
      return ("Email", "Input");
    return ("Text", "Input");
  }

  private static string FormatFriendlyLabel(string pascalName)
  {
    if (string.IsNullOrWhiteSpace(pascalName))
      return pascalName;
    var sb = new System.Text.StringBuilder();
    for (var i = 0; i < pascalName.Length; i++)
    {
      var c = pascalName[i];
      if (i > 0 && char.IsUpper(c) && !char.IsUpper(pascalName[i - 1]))
      {
        sb.Append(' ');
      }
      sb.Append(c);
    }
    return sb.ToString();
  }

  private static WebApplicationBuilder AddCors(this WebApplicationBuilder builder)
  {
    builder.Services.AddCors(options =>
    {
      options.AddPolicy("MorphusCorsPolicy", policy =>
      {
        policy.WithOrigins(
                "http://localhost:4200",
                "https://localhost:4200",
                "https://morphus.one",
                "https://www.morphus.one",
                "https://morphus.site",
                "https://homolog.morphus.one",
                "http://179.197.232.25",
                "http://192.168.0.100"
                )
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials()
                .SetPreflightMaxAge(TimeSpan.FromMinutes(10));
      });
    });

    return builder;
  }

  private static IServiceCollection AddDependencyInjection(IServiceCollection services)
  {
    services.AddHttpContextAccessor();
    services.AddScoped<ITenantProvider, TenantProvider>();

    services.AddScoped<MpxDbContext>();
    services.AddScoped<IUnitOfWork>(provider => provider.GetRequiredService<MpxDbContext>());

    // Repositórios
    services.AddScoped(typeof(IMpxRepository<>), typeof(MpxRepository<>));
    services.AddScoped<ICorporationRepository, CorporationRepository>();
    services.AddScoped<ICorporationUserRepository, CorporationUserRepository>();
    services.AddScoped<IWorkspaceRepository, WorkspaceRepository>();
    services.AddScoped<IWorkspaceUserRepository, WorkspaceUserRepository>();
    services.AddScoped<IWorkspaceApplicationRepository, WorkspaceApplicationRepository>();
    services.AddScoped<IApplicationRepository, ApplicationRepository>();
    services.AddScoped<IApplicationUserRepository, ApplicationUserRepository>();
    services.AddScoped<IMenuRepository, MenuRepository>();
    services.AddScoped<IUserRepository, UserRepository>();
    services.AddScoped<IUserStatusRepository, UserStatusRepository>();
    services.AddScoped<IModuleRepository, ModuleRepository>();
    services.AddScoped<ISubModuleRepository, SubModuleRepository>();
    services.AddScoped<IRoleRepository, RoleRepository>();
    services.AddScoped<IClaimRepository, ClaimRepository>();
    services.AddScoped<IRoleClaimRepository, RoleClaimRepository>();
    services.AddScoped<IUserRoleRepository, UserRoleRepository>();
    services.AddScoped<IUserClaimRepository, UserClaimRepository>();
    services.AddScoped<IEmailRepository, EmailRepository>();

    // Validators da Camada Application
    services.AddScoped<ICorporationValidator, CorporationValidator>();
    services.AddScoped<IWorkspaceValidator, WorkspaceValidator>();

    // Handlers da Camada Application
    services.AddScoped<SecurityHandler>();
    services.AddScoped<EmailHandler>();
    services.AddScoped<CorporationHandler>();
    services.AddScoped<CorporationUserHandler>();
    services.AddScoped<WorkspaceHandler>();
    services.AddScoped<WorkspaceUserHandler>();
    services.AddScoped<WorkspaceApplicationHandler>();
    services.AddScoped<ApplicationHandler>();
    services.AddScoped<ApplicationUserHandler>();
    services.AddScoped<MenuHandler>();
    services.AddScoped<UserHandler>();
    services.AddScoped<UserStatusHandler>();
    services.AddScoped<ModuleHandler>();
    services.AddScoped<SubModuleHandler>();
    services.AddScoped<RoleHandler>();
    services.AddScoped<ClaimHandler>();
    services.AddScoped<RoleClaimHandler>();
    services.AddScoped<UserRoleHandler>();
    services.AddScoped<UserClaimHandler>();

    return services;
  }

  private static IServiceCollection AddMpxDbContext(IServiceCollection services, IConfiguration configuration)
  {
    var connectionString = configuration.GetConnectionString("DefaultConnection");

    var connectionBuilder = new NpgsqlConnectionStringBuilder(connectionString)
    {
      Password = Environment.GetEnvironmentVariable("POSTGRES_DB_PASSWORD")
               ?? throw new InvalidOperationException("Nenhuma senha de banco de dados configurada")
    };

    services.AddDbContext<MpxDbContext>(options =>
             options.UseSnakeCaseNamingConvention()
                    .ConfigureWarnings(w => w.Ignore(RelationalEventId.PendingModelChangesWarning))
                    .UseNpgsql(connectionBuilder.ConnectionString, b => b
                    .MigrationsAssembly(typeof(MpxDbContext)
                    .Assembly.FullName)));

    return services;
  }

  private static WebApplicationBuilder AddJsonSettings(this WebApplicationBuilder builder)
  {
    builder.Services.AddControllers()
            .AddJsonOptions(options =>
            {
              options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
              options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
              options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
              options.JsonSerializerOptions.MaxDepth = 128;
            });

    return builder;
  }

  private static WebApplicationBuilder AddMpxJwtAuthentication(this WebApplicationBuilder builder)
  {
    var secretKey = Environment.GetEnvironmentVariable("JWT_SECRET_KEY")
        ?? builder.Configuration["JWT:SecretKey"]
        ?? throw new InvalidOperationException("Chave secreta JWT não configurada.");

    var validIssuer = builder.Configuration["JWT:ValidIssuer"] ?? "https://morphus.one";
    var validAudience = builder.Configuration["JWT:ValidAudience"] ?? "https://morphus.one";

    builder.Services.AddAuthentication(options =>
    {
      options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
      options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    }).AddJwtBearer(options =>
    {
      options.SaveToken = true;
      options.RequireHttpsMetadata = false;
      options.TokenValidationParameters = new TokenValidationParameters
      {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ClockSkew = TimeSpan.Zero,
        ValidIssuer = validIssuer,
        ValidAudience = validAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
      };
    });

    return builder;
  }

  private static WebApplicationBuilder AddMpxAuthorizationPolicies(this WebApplicationBuilder builder)
  {
    var auth = builder.Services.AddAuthorizationBuilder();

    auth.AddPolicy("ADMINISTRATOR", p => p.RequireRole("ADMINISTRATOR"));

    // User
    auth.AddPolicy("USER_GET_BY_ID", p => p.RequireClaim("USER", "GET_BY_ID"));
    auth.AddPolicy("USER_LIST", p => p.RequireClaim("USER", "LIST"));
    auth.AddPolicy("USER_CREATE", p => p.RequireClaim("USER", "CREATE"));
    auth.AddPolicy("USER_UPDATE", p => p.RequireClaim("USER", "UPDATE"));
    auth.AddPolicy("USER_DELETE", p => p.RequireClaim("USER", "DELETE"));

    // UserRole
    auth.AddPolicy("USER_ROLE_LIST", p => p.RequireClaim("USER_ROLE", "LIST"));
    auth.AddPolicy("USER_ROLE_ADD", p => p.RequireClaim("USER_ROLE", "ADD"));
    auth.AddPolicy("USER_ROLE_REMOVE", p => p.RequireClaim("USER_ROLE", "REMOVE"));
    auth.AddPolicy("USER_ROLE_ACTIVATE", p => p.RequireClaim("USER_ROLE", "ACTIVATE"));
    auth.AddPolicy("USER_ROLE_INACTIVATE", p => p.RequireClaim("USER_ROLE", "INACTIVATE"));

    // UserClaim
    auth.AddPolicy("USER_CLAIM_LIST", p => p.RequireClaim("USER_CLAIM", "LIST"));
    auth.AddPolicy("USER_CLAIM_ADD", p => p.RequireClaim("USER_CLAIM", "ADD"));
    auth.AddPolicy("USER_CLAIM_REMOVE", p => p.RequireClaim("USER_CLAIM", "REMOVE"));
    auth.AddPolicy("USER_CLAIM_ACTIVATE", p => p.RequireClaim("USER_CLAIM", "ACTIVATE"));
    auth.AddPolicy("USER_CLAIM_INACTIVATE", p => p.RequireClaim("USER_CLAIM", "INACTIVATE"));

    // UserStatus
    auth.AddPolicy("USER_STATUS_GET_BY_ID", p => p.RequireClaim("USER_STATUS", "GET_BY_ID"));
    auth.AddPolicy("USER_STATUS_LIST", p => p.RequireClaim("USER_STATUS", "LIST"));
    auth.AddPolicy("USER_STATUS_CREATE", p => p.RequireClaim("USER_STATUS", "CREATE"));
    auth.AddPolicy("USER_STATUS_UPDATE", p => p.RequireClaim("USER_STATUS", "UPDATE"));
    auth.AddPolicy("USER_STATUS_DELETE", p => p.RequireClaim("USER_STATUS", "DELETE"));

    // Role
    auth.AddPolicy("ROLE_GET_BY_ID", p => p.RequireClaim("ROLE", "GET_BY_ID"));
    auth.AddPolicy("ROLE_LIST", p => p.RequireClaim("ROLE", "LIST"));
    auth.AddPolicy("ROLE_CREATE", p => p.RequireClaim("ROLE", "CREATE"));
    auth.AddPolicy("ROLE_UPDATE", p => p.RequireClaim("ROLE", "UPDATE"));
    auth.AddPolicy("ROLE_DELETE", p => p.RequireClaim("ROLE", "DELETE"));

    // RoleClaim
    auth.AddPolicy("ROLE_CLAIM_LIST", p => p.RequireClaim("ROLE_CLAIM", "LIST"));
    auth.AddPolicy("ROLE_CLAIM_ADD", p => p.RequireClaim("ROLE_CLAIM", "ADD"));
    auth.AddPolicy("ROLE_CLAIM_REMOVE", p => p.RequireClaim("ROLE_CLAIM", "REMOVE"));
    auth.AddPolicy("ROLE_CLAIM_ACTIVATE", p => p.RequireClaim("ROLE_CLAIM", "ACTIVATE"));
    auth.AddPolicy("ROLE_CLAIM_INACTIVATE", p => p.RequireClaim("ROLE_CLAIM", "INACTIVATE"));

    // Claim
    auth.AddPolicy("CLAIM_GET_BY_ID", p => p.RequireClaim("CLAIM", "GET_BY_ID"));
    auth.AddPolicy("CLAIM_LIST", p => p.RequireClaim("CLAIM", "LIST"));
    auth.AddPolicy("CLAIM_CREATE", p => p.RequireClaim("CLAIM", "CREATE"));
    auth.AddPolicy("CLAIM_UPDATE", p => p.RequireClaim("CLAIM", "UPDATE"));
    auth.AddPolicy("CLAIM_DELETE", p => p.RequireClaim("CLAIM", "DELETE"));

    // Corporation
    auth.AddPolicy("CORPORATION_GET_BY_ID", p => p.RequireClaim("CORPORATION", "GET_BY_ID"));
    auth.AddPolicy("CORPORATION_LIST", p => p.RequireClaim("CORPORATION", "LIST"));
    auth.AddPolicy("CORPORATION_CREATE", p => p.RequireClaim("CORPORATION", "CREATE"));
    auth.AddPolicy("CORPORATION_UPDATE", p => p.RequireClaim("CORPORATION", "UPDATE"));
    auth.AddPolicy("CORPORATION_DELETE", p => p.RequireClaim("CORPORATION", "DELETE"));

    // CorporationUser
    auth.AddPolicy("CORPORATION_USER_LIST", p => p.RequireClaim("CORPORATION_USER", "LIST"));
    auth.AddPolicy("CORPORATION_USER_ADD", p => p.RequireClaim("CORPORATION_USER", "ADD"));
    auth.AddPolicy("CORPORATION_USER_REMOVE", p => p.RequireClaim("CORPORATION_USER", "REMOVE"));
    auth.AddPolicy("CORPORATION_USER_ACTIVATE", p => p.RequireClaim("CORPORATION_USER", "ACTIVATE"));
    auth.AddPolicy("CORPORATION_USER_INACTIVATE", p => p.RequireClaim("CORPORATION_USER", "INACTIVATE"));
    auth.AddPolicy("CORPORATION_USER_SET_OWNER", p => p.RequireClaim("CORPORATION_USER", "SET_OWNER"));
    auth.AddPolicy("CORPORATION_USER_REMOVE_OWNER", p => p.RequireClaim("CORPORATION_USER", "REMOVE_OWNER"));

    // Module & SubModule
    auth.AddPolicy("MODULE_GET_BY_ID", p => p.RequireClaim("MODULE", "GET_BY_ID"));
    auth.AddPolicy("MODULE_LIST", p => p.RequireClaim("MODULE", "LIST"));
    auth.AddPolicy("MODULE_GET_BY_KEY", p => p.RequireClaim("MODULE", "GET_BY_KEY"));
    auth.AddPolicy("MODULE_CREATE", p => p.RequireClaim("MODULE", "CREATE"));
    auth.AddPolicy("MODULE_UPDATE", p => p.RequireClaim("MODULE", "UPDATE"));
    auth.AddPolicy("MODULE_DELETE", p => p.RequireClaim("MODULE", "DELETE"));
    auth.AddPolicy("MODULE_SUB_MODULES", p => p.RequireClaim("MODULE", "SUB_MODULES"));

    auth.AddPolicy("SUB_MODULE_GET_BY_ID", p => p.RequireClaim("SUB_MODULE", "GET_BY_ID"));
    auth.AddPolicy("SUB_MODULE_LIST", p => p.RequireClaim("SUB_MODULE", "LIST"));
    auth.AddPolicy("SUB_MODULE_CREATE", p => p.RequireClaim("SUB_MODULE", "CREATE"));
    auth.AddPolicy("SUB_MODULE_UPDATE", p => p.RequireClaim("SUB_MODULE", "UPDATE"));
    auth.AddPolicy("SUB_MODULE_DELETE", p => p.RequireClaim("SUB_MODULE", "DELETE"));

    // Workspace & WorkspaceUser
    auth.AddPolicy("WORKSPACE_GET_BY_ID", p => p.RequireClaim("WORKSPACE", "GET_BY_ID"));
    auth.AddPolicy("WORKSPACE_GET_BY_KEY", p => p.RequireClaim("WORKSPACE", "GET_BY_KEY"));
    auth.AddPolicy("WORKSPACE_LIST", p => p.RequireClaim("WORKSPACE", "LIST"));
    auth.AddPolicy("WORKSPACE_CREATE", p => p.RequireClaim("WORKSPACE", "CREATE"));
    auth.AddPolicy("WORKSPACE_UPDATE", p => p.RequireClaim("WORKSPACE", "UPDATE"));
    auth.AddPolicy("WORKSPACE_DELETE", p => p.RequireClaim("WORKSPACE", "DELETE"));

    auth.AddPolicy("WORKSPACE_USER_LIST", p => p.RequireClaim("WORKSPACE_USER", "LIST"));
    auth.AddPolicy("WORKSPACE_USER_ADD", p => p.RequireClaim("WORKSPACE_USER", "ADD"));
    auth.AddPolicy("WORKSPACE_USER_REMOVE", p => p.RequireClaim("WORKSPACE_USER", "REMOVE"));
    auth.AddPolicy("WORKSPACE_USER_ACTIVATE", p => p.RequireClaim("WORKSPACE_USER", "ACTIVATE"));
    auth.AddPolicy("WORKSPACE_USER_INACTIVATE", p => p.RequireClaim("WORKSPACE_USER", "INACTIVATE"));
    auth.AddPolicy("WORKSPACE_USER_SET_OWNER", p => p.RequireClaim("WORKSPACE_USER", "SET_OWNER"));
    auth.AddPolicy("WORKSPACE_USER_REMOVE_OWNER", p => p.RequireClaim("WORKSPACE_USER", "REMOVE_OWNER"));

    auth.AddPolicy("WORKSPACE_APPLICATION_LIST", p => p.RequireClaim("WORKSPACE_APPLICATION", "LIST"));
    auth.AddPolicy("WORKSPACE_APPLICATION_ADD", p => p.RequireClaim("WORKSPACE_APPLICATION", "ADD"));
    auth.AddPolicy("WORKSPACE_APPLICATION_REMOVE", p => p.RequireClaim("WORKSPACE_APPLICATION", "REMOVE"));
    auth.AddPolicy("WORKSPACE_APPLICATION_ACTIVATE", p => p.RequireClaim("WORKSPACE_APPLICATION", "ACTIVATE"));
    auth.AddPolicy("WORKSPACE_APPLICATION_INACTIVATE", p => p.RequireClaim("WORKSPACE_APPLICATION", "INACTIVATE"));

    // Application & ApplicationUser
    auth.AddPolicy("APPLICATION_GET_BY_ID", p => p.RequireClaim("APPLICATION", "GET_BY_ID"));
    auth.AddPolicy("APPLICATION_GET_BY_KEY", p => p.RequireClaim("APPLICATION", "GET_BY_KEY"));
    auth.AddPolicy("APPLICATION_LIST", p => p.RequireClaim("APPLICATION", "LIST"));
    auth.AddPolicy("APPLICATION_CREATE", p => p.RequireClaim("APPLICATION", "CREATE"));
    auth.AddPolicy("APPLICATION_UPDATE", p => p.RequireClaim("APPLICATION", "UPDATE"));
    auth.AddPolicy("APPLICATION_DELETE", p => p.RequireClaim("APPLICATION", "DELETE"));

    auth.AddPolicy("APPLICATION_USER_LIST", p => p.RequireClaim("APPLICATION_USER", "LIST"));
    auth.AddPolicy("APPLICATION_USER_ADD", p => p.RequireClaim("APPLICATION_USER", "ADD"));
    auth.AddPolicy("APPLICATION_USER_REMOVE", p => p.RequireClaim("APPLICATION_USER", "REMOVE"));
    auth.AddPolicy("APPLICATION_USER_ACTIVATE", p => p.RequireClaim("APPLICATION_USER", "ACTIVATE"));
    auth.AddPolicy("APPLICATION_USER_INACTIVATE", p => p.RequireClaim("APPLICATION_USER", "INACTIVATE"));
    auth.AddPolicy("APPLICATION_USER_SET_OWNER", p => p.RequireClaim("APPLICATION_USER", "SET_OWNER"));
    auth.AddPolicy("APPLICATION_USER_REMOVE_OWNER", p => p.RequireClaim("APPLICATION_USER", "REMOVE_OWNER"));

    // Menu
    auth.AddPolicy("MENU_GET_BY_ID", p => p.RequireClaim("MENU", "GET_BY_ID"));
    auth.AddPolicy("MENU_LIST", p => p.RequireClaim("MENU", "LIST"));
    auth.AddPolicy("MENU_CREATE", p => p.RequireClaim("MENU", "CREATE"));
    auth.AddPolicy("MENU_UPDATE", p => p.RequireClaim("MENU", "UPDATE"));
    auth.AddPolicy("MENU_DELETE", p => p.RequireClaim("MENU", "DELETE"));

    return builder;
  }
}
