using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Mpx.Infrastructure.Data.Migrations;

/// <inheritdoc />
public partial class _20261120233405_AddWorkflowTriggersStationsRoutesAndErrorEngine : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
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
            """);

        migrationBuilder.AddColumn<DateTime>(
            name: "created_at",
            table: "wkf_workflows",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "updated_at",
            table: "wkf_workflows",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AlterColumn<string>(
            name: "trigger_type",
            table: "wkf_workflow_types",
            type: "character varying(60)",
            maxLength: 60,
            nullable: false,
            defaultValue: "HtmlAction",
            oldClrType: typeof(string),
            oldType: "character varying(60)",
            oldMaxLength: 60,
            oldDefaultValue: "Manual");

        migrationBuilder.AddColumn<DateTime>(
            name: "created_at",
            table: "wkf_workflow_types",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<string>(
            name: "trigger_event",
            table: "wkf_workflow_types",
            type: "character varying(60)",
            maxLength: 60,
            nullable: true,
            defaultValue: "OnScreenLoad");

        migrationBuilder.AddColumn<Guid>(
            name: "trigger_route_id",
            table: "wkf_workflow_types",
            type: "uuid",
            nullable: true);

        migrationBuilder.AddColumn<Guid>(
            name: "trigger_type_id",
            table: "wkf_workflow_types",
            type: "uuid",
            nullable: true);

        migrationBuilder.AddColumn<DateTime>(
            name: "updated_at",
            table: "wkf_workflow_types",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "created_at",
            table: "wkf_workflow_type_contexts",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "updated_at",
            table: "wkf_workflow_type_contexts",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "created_at",
            table: "wkf_workflow_type_configs",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<bool>(
            name: "is_isolated_error_catcher",
            table: "wkf_workflow_type_configs",
            type: "boolean",
            nullable: false,
            defaultValue: false);

        migrationBuilder.AddColumn<Guid>(
            name: "return_input_config_id",
            table: "wkf_workflow_type_configs",
            type: "uuid",
            nullable: true);

        migrationBuilder.AddColumn<Guid>(
            name: "target_route_id",
            table: "wkf_workflow_type_configs",
            type: "uuid",
            nullable: true);

        migrationBuilder.AddColumn<Guid>(
            name: "target_sub_workflow_type_id",
            table: "wkf_workflow_type_configs",
            type: "uuid",
            nullable: true);

        migrationBuilder.AddColumn<DateTime>(
            name: "updated_at",
            table: "wkf_workflow_type_configs",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "created_at",
            table: "wkf_workflow_type_config_validations",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "updated_at",
            table: "wkf_workflow_type_config_validations",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "created_at",
            table: "wkf_workflow_type_config_slas",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "updated_at",
            table: "wkf_workflow_type_config_slas",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "created_at",
            table: "wkf_workflow_type_config_notifications",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "updated_at",
            table: "wkf_workflow_type_config_notifications",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "created_at",
            table: "wkf_workflow_type_config_fields",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "updated_at",
            table: "wkf_workflow_type_config_fields",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "created_at",
            table: "wkf_workflow_type_config_conditions",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "updated_at",
            table: "wkf_workflow_type_config_conditions",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "created_at",
            table: "wkf_workflow_type_config_actions",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "updated_at",
            table: "wkf_workflow_type_config_actions",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "created_at",
            table: "wkf_workflow_type_config_action_file_types",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "updated_at",
            table: "wkf_workflow_type_config_action_file_types",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AlterColumn<DateTime>(
            name: "created_at",
            table: "wkf_workflow_tasks",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()",
            oldClrType: typeof(DateTime),
            oldType: "timestamp with time zone");

        migrationBuilder.AddColumn<DateTime>(
            name: "updated_at",
            table: "wkf_workflow_tasks",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "created_at",
            table: "wkf_workflow_task_owners",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "updated_at",
            table: "wkf_workflow_task_owners",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "created_at",
            table: "wkf_workflow_permissions",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "updated_at",
            table: "wkf_workflow_permissions",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "created_at",
            table: "wkf_workflow_items",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "updated_at",
            table: "wkf_workflow_items",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "created_at",
            table: "wkf_workflow_item_metadatas",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "updated_at",
            table: "wkf_workflow_item_metadatas",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "created_at",
            table: "wkf_stations",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<Guid>(
            name: "station_type_id",
            table: "wkf_stations",
            type: "uuid",
            nullable: true);

        migrationBuilder.AddColumn<DateTime>(
            name: "updated_at",
            table: "wkf_stations",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "created_at",
            table: "sec_users",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "updated_at",
            table: "sec_users",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "created_at",
            table: "sec_user_statuses",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "updated_at",
            table: "sec_user_statuses",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "created_at",
            table: "sec_user_roles",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "updated_at",
            table: "sec_user_roles",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "created_at",
            table: "sec_user_claims",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "updated_at",
            table: "sec_user_claims",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "created_at",
            table: "sec_sub_modules",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "updated_at",
            table: "sec_sub_modules",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "created_at",
            table: "sec_roles",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "updated_at",
            table: "sec_roles",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "created_at",
            table: "sec_role_claims",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "updated_at",
            table: "sec_role_claims",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "created_at",
            table: "sec_modules",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "updated_at",
            table: "sec_modules",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "created_at",
            table: "sec_claims",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "updated_at",
            table: "sec_claims",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "created_at",
            table: "mpx_workspaces",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "updated_at",
            table: "mpx_workspaces",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "created_at",
            table: "mpx_workspace_users",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "updated_at",
            table: "mpx_workspace_users",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "created_at",
            table: "mpx_workspace_applications",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "updated_at",
            table: "mpx_workspace_applications",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "created_at",
            table: "mpx_user_notifications",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "updated_at",
            table: "mpx_user_notifications",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "created_at",
            table: "mpx_notifications",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "updated_at",
            table: "mpx_notifications",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "created_at",
            table: "mpx_modules",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "updated_at",
            table: "mpx_modules",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "created_at",
            table: "mpx_module_categories",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "updated_at",
            table: "mpx_module_categories",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "created_at",
            table: "mpx_menus",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<Guid>(
            name: "route_id",
            table: "mpx_menus",
            type: "uuid",
            nullable: true);

        migrationBuilder.AddColumn<DateTime>(
            name: "updated_at",
            table: "mpx_menus",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "created_at",
            table: "mpx_file_types",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "updated_at",
            table: "mpx_file_types",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "created_at",
            table: "mpx_features",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "updated_at",
            table: "mpx_features",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "created_at",
            table: "mpx_feature_highlights",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "updated_at",
            table: "mpx_feature_highlights",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "created_at",
            table: "mpx_entity_properties",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "updated_at",
            table: "mpx_entity_properties",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "created_at",
            table: "mpx_entities",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "updated_at",
            table: "mpx_entities",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "created_at",
            table: "mpx_emails_to",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "updated_at",
            table: "mpx_emails_to",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "created_at",
            table: "mpx_emails_from",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "updated_at",
            table: "mpx_emails_from",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "created_at",
            table: "mpx_emails_cc",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "updated_at",
            table: "mpx_emails_cc",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "created_at",
            table: "mpx_emails_bcc",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "updated_at",
            table: "mpx_emails_bcc",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "created_at",
            table: "mpx_emails",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "updated_at",
            table: "mpx_emails",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "created_at",
            table: "mpx_corporations",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "updated_at",
            table: "mpx_corporations",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "created_at",
            table: "mpx_corporation_users",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "updated_at",
            table: "mpx_corporation_users",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "created_at",
            table: "mpx_corporation_domains",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "updated_at",
            table: "mpx_corporation_domains",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "created_at",
            table: "mpx_corporation_domain_records",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "updated_at",
            table: "mpx_corporation_domain_records",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "created_at",
            table: "mpx_categories",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "updated_at",
            table: "mpx_categories",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "created_at",
            table: "mpx_applications",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "updated_at",
            table: "mpx_applications",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "created_at",
            table: "mpx_application_users",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "updated_at",
            table: "mpx_application_users",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "created_at",
            table: "mpx_application_sub_modules",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "updated_at",
            table: "mpx_application_sub_modules",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "created_at",
            table: "mpx_application_statuses",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "updated_at",
            table: "mpx_application_statuses",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "created_at",
            table: "mpx_application_settings",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "updated_at",
            table: "mpx_application_settings",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "created_at",
            table: "mpx_application_modules",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "updated_at",
            table: "mpx_application_modules",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "created_at",
            table: "jrb_workflow_watchers",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "updated_at",
            table: "jrb_workflow_watchers",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "created_at",
            table: "jrb_sync_events",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "updated_at",
            table: "jrb_sync_events",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "created_at",
            table: "jrb_security_scopes",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "updated_at",
            table: "jrb_security_scopes",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "created_at",
            table: "jrb_security_levels",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "updated_at",
            table: "jrb_security_levels",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "created_at",
            table: "jrb_protected_files",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "updated_at",
            table: "jrb_protected_files",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "created_at",
            table: "jrb_permission_levels",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "updated_at",
            table: "jrb_permission_levels",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "created_at",
            table: "jrb_jobs",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "updated_at",
            table: "jrb_jobs",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "created_at",
            table: "jrb_insights",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "updated_at",
            table: "jrb_insights",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "created_at",
            table: "jrb_encryption_states",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "updated_at",
            table: "jrb_encryption_states",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "created_at",
            table: "jrb_conflict_alerts",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "updated_at",
            table: "jrb_conflict_alerts",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "created_at",
            table: "jrb_config",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "updated_at",
            table: "jrb_config",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "created_at",
            table: "jrb_agents",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.AddColumn<DateTime>(
            name: "updated_at",
            table: "jrb_agents",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()");

        migrationBuilder.CreateTable(
            name: "mpx_error_severities",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                corporation_id = table.Column<Guid>(type: "uuid", nullable: true),
                code = table.Column<short>(type: "smallint", nullable: false, defaultValue: (short)0),
                label = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                involves_entire_workspace = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                involves_entire_corporation = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                icon = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                color = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                order = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                description = table.Column<string>(type: "text", nullable: true),
                key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false, defaultValue: ""),
                system = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                inactive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_mpx_error_severities", x => x.id);
                table.ForeignKey(
                    name: "fk_mpx_error_severities_mpx_corporations_corporation_id",
                    column: x => x.corporation_id,
                    principalTable: "mpx_corporations",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateTable(
            name: "mpx_error_states",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                corporation_id = table.Column<Guid>(type: "uuid", nullable: true),
                code = table.Column<short>(type: "smallint", nullable: false, defaultValue: (short)0),
                label = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                is_terminal = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                icon = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                color = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                order = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                description = table.Column<string>(type: "text", nullable: true),
                key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false, defaultValue: ""),
                system = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                inactive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_mpx_error_states", x => x.id);
                table.ForeignKey(
                    name: "fk_mpx_error_states_mpx_corporations_corporation_id",
                    column: x => x.corporation_id,
                    principalTable: "mpx_corporations",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateTable(
            name: "mpx_routes",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                corporation_id = table.Column<Guid>(type: "uuid", nullable: true),
                workspace_id = table.Column<Guid>(type: "uuid", nullable: true),
                application_id = table.Column<Guid>(type: "uuid", nullable: true),
                module_id = table.Column<Guid>(type: "uuid", nullable: true),
                sub_module_id = table.Column<Guid>(type: "uuid", nullable: true),
                name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                label = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                path = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                is_public = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                icon = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                color = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                order = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                description = table.Column<string>(type: "text", nullable: true),
                key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false, defaultValue: ""),
                system = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                inactive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_mpx_routes", x => x.id);
                table.ForeignKey(
                    name: "fk_mpx_routes_modules_module_id",
                    column: x => x.module_id,
                    principalTable: "sec_modules",
                    principalColumn: "id",
                    onDelete: ReferentialAction.SetNull);
                table.ForeignKey(
                    name: "fk_mpx_routes_mpx_applications_application_id",
                    column: x => x.application_id,
                    principalTable: "mpx_applications",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "fk_mpx_routes_mpx_corporations_corporation_id",
                    column: x => x.corporation_id,
                    principalTable: "mpx_corporations",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "fk_mpx_routes_sub_modules_sub_module_id",
                    column: x => x.sub_module_id,
                    principalTable: "sec_sub_modules",
                    principalColumn: "id",
                    onDelete: ReferentialAction.SetNull);
                table.ForeignKey(
                    name: "fk_mpx_routes_workspaces_workspace_id",
                    column: x => x.workspace_id,
                    principalTable: "mpx_workspaces",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateTable(
            name: "wkf_station_types",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                corporation_id = table.Column<Guid>(type: "uuid", nullable: true),
                code = table.Column<short>(type: "smallint", nullable: false, defaultValue: (short)2),
                name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                label = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                is_input_port = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                is_output_port = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                is_isolated_error_catcher = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                has_layout = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                icon = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                color = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                order = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                description = table.Column<string>(type: "text", nullable: true),
                key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false, defaultValue: ""),
                system = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                inactive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_wkf_station_types", x => x.id);
                table.ForeignKey(
                    name: "fk_wkf_station_types_mpx_corporations_corporation_id",
                    column: x => x.corporation_id,
                    principalTable: "mpx_corporations",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateTable(
            name: "wkf_trigger_types",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                corporation_id = table.Column<Guid>(type: "uuid", nullable: true),
                code = table.Column<short>(type: "smallint", nullable: false, defaultValue: (short)0),
                name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                label = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                requires_route = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                requires_schedule = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                icon = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                color = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                order = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                description = table.Column<string>(type: "text", nullable: true),
                key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false, defaultValue: ""),
                system = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                inactive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_wkf_trigger_types", x => x.id);
                table.ForeignKey(
                    name: "fk_wkf_trigger_types_mpx_corporations_corporation_id",
                    column: x => x.corporation_id,
                    principalTable: "mpx_corporations",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateTable(
            name: "mpx_error_codes",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                code = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                corporation_id = table.Column<Guid>(type: "uuid", nullable: false),
                workspace_id = table.Column<Guid>(type: "uuid", nullable: true),
                application_id = table.Column<Guid>(type: "uuid", nullable: true),
                friendly_message = table.Column<string>(type: "text", nullable: false),
                sla = table.Column<int>(type: "integer", nullable: false, defaultValue: 60),
                severity_id = table.Column<Guid>(type: "uuid", nullable: false),
                icon = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                color = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                description = table.Column<string>(type: "text", nullable: true),
                key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false, defaultValue: ""),
                system = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                inactive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_mpx_error_codes", x => x.id);
                table.ForeignKey(
                    name: "fk_mpx_error_codes_error_severities_severity_id",
                    column: x => x.severity_id,
                    principalTable: "mpx_error_severities",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "fk_mpx_error_codes_mpx_applications_application_id",
                    column: x => x.application_id,
                    principalTable: "mpx_applications",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "fk_mpx_error_codes_mpx_corporations_corporation_id",
                    column: x => x.corporation_id,
                    principalTable: "mpx_corporations",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "fk_mpx_error_codes_workspaces_workspace_id",
                    column: x => x.workspace_id,
                    principalTable: "mpx_workspaces",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateTable(
            name: "mpx_errors",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                error_code_id = table.Column<Guid>(type: "uuid", nullable: false),
                error_state_id = table.Column<Guid>(type: "uuid", nullable: false),
                corporation_id = table.Column<Guid>(type: "uuid", nullable: false),
                workspace_id = table.Column<Guid>(type: "uuid", nullable: true),
                application_id = table.Column<Guid>(type: "uuid", nullable: true),
                workflow_type_id = table.Column<Guid>(type: "uuid", nullable: true),
                workflow_id = table.Column<Guid>(type: "uuid", nullable: true),
                workflow_task_id = table.Column<Guid>(type: "uuid", nullable: true),
                origin_config_id = table.Column<Guid>(type: "uuid", nullable: true),
                user_id = table.Column<Guid>(type: "uuid", nullable: true),
                message = table.Column<string>(type: "text", nullable: false),
                user_message = table.Column<string>(type: "text", nullable: false),
                method = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                user_snapshot = table.Column<string>(type: "text", nullable: true),
                context_snapshot = table.Column<string>(type: "text", nullable: true),
                resolved_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                resolved_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                resolution_notes = table.Column<string>(type: "text", nullable: true),
                key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false, defaultValue: ""),
                system = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                inactive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_mpx_errors", x => x.id);
                table.ForeignKey(
                    name: "fk_mpx_errors_error_states_error_state_id",
                    column: x => x.error_state_id,
                    principalTable: "mpx_error_states",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "fk_mpx_errors_mpx_applications_application_id",
                    column: x => x.application_id,
                    principalTable: "mpx_applications",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "fk_mpx_errors_mpx_corporations_corporation_id",
                    column: x => x.corporation_id,
                    principalTable: "mpx_corporations",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "fk_mpx_errors_mpx_error_codes_error_code_id",
                    column: x => x.error_code_id,
                    principalTable: "mpx_error_codes",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "fk_mpx_errors_users_resolved_by_user_id",
                    column: x => x.resolved_by_user_id,
                    principalTable: "sec_users",
                    principalColumn: "id",
                    onDelete: ReferentialAction.SetNull);
                table.ForeignKey(
                    name: "fk_mpx_errors_users_user_id",
                    column: x => x.user_id,
                    principalTable: "sec_users",
                    principalColumn: "id",
                    onDelete: ReferentialAction.SetNull);
                table.ForeignKey(
                    name: "fk_mpx_errors_workflow_tasks_workflow_task_id",
                    column: x => x.workflow_task_id,
                    principalTable: "wkf_workflow_tasks",
                    principalColumn: "id",
                    onDelete: ReferentialAction.SetNull);
                table.ForeignKey(
                    name: "fk_mpx_errors_workflow_type_configs_origin_config_id",
                    column: x => x.origin_config_id,
                    principalTable: "wkf_workflow_type_configs",
                    principalColumn: "id",
                    onDelete: ReferentialAction.SetNull);
                table.ForeignKey(
                    name: "fk_mpx_errors_workflow_types_workflow_type_id",
                    column: x => x.workflow_type_id,
                    principalTable: "wkf_workflow_types",
                    principalColumn: "id",
                    onDelete: ReferentialAction.SetNull);
                table.ForeignKey(
                    name: "fk_mpx_errors_workflows_workflow_id",
                    column: x => x.workflow_id,
                    principalTable: "wkf_workflows",
                    principalColumn: "id",
                    onDelete: ReferentialAction.SetNull);
                table.ForeignKey(
                    name: "fk_mpx_errors_workspaces_workspace_id",
                    column: x => x.workspace_id,
                    principalTable: "mpx_workspaces",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_types_trigger_route_id",
            table: "wkf_workflow_types",
            column: "trigger_route_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_types_trigger_type_id",
            table: "wkf_workflow_types",
            column: "trigger_type_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_type_configs_return_input_config_id",
            table: "wkf_workflow_type_configs",
            column: "return_input_config_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_type_configs_target_route_id",
            table: "wkf_workflow_type_configs",
            column: "target_route_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_type_configs_target_sub_workflow_type_id",
            table: "wkf_workflow_type_configs",
            column: "target_sub_workflow_type_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_stations_station_type_id",
            table: "wkf_stations",
            column: "station_type_id");

        migrationBuilder.CreateIndex(
            name: "ix_mpx_menus_route_id",
            table: "mpx_menus",
            column: "route_id");

        migrationBuilder.CreateIndex(
            name: "ix_mpx_error_codes_application_id",
            table: "mpx_error_codes",
            column: "application_id");

        migrationBuilder.CreateIndex(
            name: "ix_mpx_error_codes_corporation_id_code",
            table: "mpx_error_codes",
            columns: new[] { "corporation_id", "code" },
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_mpx_error_codes_key",
            table: "mpx_error_codes",
            column: "key",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_mpx_error_codes_severity_id",
            table: "mpx_error_codes",
            column: "severity_id");

        migrationBuilder.CreateIndex(
            name: "ix_mpx_error_codes_workspace_id",
            table: "mpx_error_codes",
            column: "workspace_id");

        migrationBuilder.CreateIndex(
            name: "ix_mpx_error_severities_corporation_id_code",
            table: "mpx_error_severities",
            columns: new[] { "corporation_id", "code" },
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_mpx_error_severities_key",
            table: "mpx_error_severities",
            column: "key",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_mpx_error_states_corporation_id_code",
            table: "mpx_error_states",
            columns: new[] { "corporation_id", "code" },
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_mpx_error_states_key",
            table: "mpx_error_states",
            column: "key",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_mpx_errors_application_id",
            table: "mpx_errors",
            column: "application_id");

        migrationBuilder.CreateIndex(
            name: "ix_mpx_errors_corporation_id_error_state_id_created_at",
            table: "mpx_errors",
            columns: new[] { "corporation_id", "error_state_id", "created_at" });

        migrationBuilder.CreateIndex(
            name: "ix_mpx_errors_error_code_id",
            table: "mpx_errors",
            column: "error_code_id");

        migrationBuilder.CreateIndex(
            name: "ix_mpx_errors_error_state_id",
            table: "mpx_errors",
            column: "error_state_id");

        migrationBuilder.CreateIndex(
            name: "ix_mpx_errors_key",
            table: "mpx_errors",
            column: "key",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_mpx_errors_origin_config_id",
            table: "mpx_errors",
            column: "origin_config_id");

        migrationBuilder.CreateIndex(
            name: "ix_mpx_errors_resolved_by_user_id",
            table: "mpx_errors",
            column: "resolved_by_user_id");

        migrationBuilder.CreateIndex(
            name: "ix_mpx_errors_user_id",
            table: "mpx_errors",
            column: "user_id");

        migrationBuilder.CreateIndex(
            name: "ix_mpx_errors_workflow_id_origin_config_id",
            table: "mpx_errors",
            columns: new[] { "workflow_id", "origin_config_id" });

        migrationBuilder.CreateIndex(
            name: "ix_mpx_errors_workflow_task_id",
            table: "mpx_errors",
            column: "workflow_task_id");

        migrationBuilder.CreateIndex(
            name: "ix_mpx_errors_workflow_type_id",
            table: "mpx_errors",
            column: "workflow_type_id");

        migrationBuilder.CreateIndex(
            name: "ix_mpx_errors_workspace_id",
            table: "mpx_errors",
            column: "workspace_id");

        migrationBuilder.CreateIndex(
            name: "ix_mpx_routes_application_id",
            table: "mpx_routes",
            column: "application_id");

        migrationBuilder.CreateIndex(
            name: "ix_mpx_routes_corporation_id_path",
            table: "mpx_routes",
            columns: new[] { "corporation_id", "path" },
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_mpx_routes_key",
            table: "mpx_routes",
            column: "key",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_mpx_routes_module_id",
            table: "mpx_routes",
            column: "module_id");

        migrationBuilder.CreateIndex(
            name: "ix_mpx_routes_sub_module_id",
            table: "mpx_routes",
            column: "sub_module_id");

        migrationBuilder.CreateIndex(
            name: "ix_mpx_routes_workspace_id",
            table: "mpx_routes",
            column: "workspace_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_station_types_corporation_id_code",
            table: "wkf_station_types",
            columns: new[] { "corporation_id", "code" },
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_wkf_station_types_key",
            table: "wkf_station_types",
            column: "key",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_wkf_trigger_types_corporation_id_code",
            table: "wkf_trigger_types",
            columns: new[] { "corporation_id", "code" },
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_wkf_trigger_types_key",
            table: "wkf_trigger_types",
            column: "key",
            unique: true);

        migrationBuilder.AddForeignKey(
            name: "fk_mpx_menus_routes_route_id",
            table: "mpx_menus",
            column: "route_id",
            principalTable: "mpx_routes",
            principalColumn: "id",
            onDelete: ReferentialAction.SetNull);

        migrationBuilder.AddForeignKey(
            name: "fk_wkf_stations_workflow_station_types_station_type_id",
            table: "wkf_stations",
            column: "station_type_id",
            principalTable: "wkf_station_types",
            principalColumn: "id",
            onDelete: ReferentialAction.SetNull);

        migrationBuilder.AddForeignKey(
            name: "fk_wkf_workflow_type_configs_mpx_routes_target_route_id",
            table: "wkf_workflow_type_configs",
            column: "target_route_id",
            principalTable: "mpx_routes",
            principalColumn: "id",
            onDelete: ReferentialAction.SetNull);

        migrationBuilder.AddForeignKey(
            name: "fk_wkf_workflow_type_configs_wkf_workflow_type_configs_return_",
            table: "wkf_workflow_type_configs",
            column: "return_input_config_id",
            principalTable: "wkf_workflow_type_configs",
            principalColumn: "id",
            onDelete: ReferentialAction.SetNull);

        migrationBuilder.AddForeignKey(
            name: "fk_wkf_workflow_type_configs_workflow_types_target_sub_workflo",
            table: "wkf_workflow_type_configs",
            column: "target_sub_workflow_type_id",
            principalTable: "wkf_workflow_types",
            principalColumn: "id",
            onDelete: ReferentialAction.SetNull);

        migrationBuilder.AddForeignKey(
            name: "fk_wkf_workflow_types_mpx_routes_trigger_route_id",
            table: "wkf_workflow_types",
            column: "trigger_route_id",
            principalTable: "mpx_routes",
            principalColumn: "id",
            onDelete: ReferentialAction.SetNull);

        migrationBuilder.AddForeignKey(
            name: "fk_wkf_workflow_types_wkf_trigger_types_trigger_type_id",
            table: "wkf_workflow_types",
            column: "trigger_type_id",
            principalTable: "wkf_trigger_types",
            principalColumn: "id",
            onDelete: ReferentialAction.SetNull);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "fk_mpx_menus_routes_route_id",
            table: "mpx_menus");

        migrationBuilder.DropForeignKey(
            name: "fk_wkf_stations_workflow_station_types_station_type_id",
            table: "wkf_stations");

        migrationBuilder.DropForeignKey(
            name: "fk_wkf_workflow_type_configs_mpx_routes_target_route_id",
            table: "wkf_workflow_type_configs");

        migrationBuilder.DropForeignKey(
            name: "fk_wkf_workflow_type_configs_wkf_workflow_type_configs_return_",
            table: "wkf_workflow_type_configs");

        migrationBuilder.DropForeignKey(
            name: "fk_wkf_workflow_type_configs_workflow_types_target_sub_workflo",
            table: "wkf_workflow_type_configs");

        migrationBuilder.DropForeignKey(
            name: "fk_wkf_workflow_types_mpx_routes_trigger_route_id",
            table: "wkf_workflow_types");

        migrationBuilder.DropForeignKey(
            name: "fk_wkf_workflow_types_wkf_trigger_types_trigger_type_id",
            table: "wkf_workflow_types");

        migrationBuilder.DropTable(
            name: "mpx_errors");

        migrationBuilder.DropTable(
            name: "mpx_routes");

        migrationBuilder.DropTable(
            name: "wkf_station_types");

        migrationBuilder.DropTable(
            name: "wkf_trigger_types");

        migrationBuilder.DropTable(
            name: "mpx_error_states");

        migrationBuilder.DropTable(
            name: "mpx_error_codes");

        migrationBuilder.DropTable(
            name: "mpx_error_severities");

        migrationBuilder.DropIndex(
            name: "ix_wkf_workflow_types_trigger_route_id",
            table: "wkf_workflow_types");

        migrationBuilder.DropIndex(
            name: "ix_wkf_workflow_types_trigger_type_id",
            table: "wkf_workflow_types");

        migrationBuilder.DropIndex(
            name: "ix_wkf_workflow_type_configs_return_input_config_id",
            table: "wkf_workflow_type_configs");

        migrationBuilder.DropIndex(
            name: "ix_wkf_workflow_type_configs_target_route_id",
            table: "wkf_workflow_type_configs");

        migrationBuilder.DropIndex(
            name: "ix_wkf_workflow_type_configs_target_sub_workflow_type_id",
            table: "wkf_workflow_type_configs");

        migrationBuilder.DropIndex(
            name: "ix_wkf_stations_station_type_id",
            table: "wkf_stations");

        migrationBuilder.DropIndex(
            name: "ix_mpx_menus_route_id",
            table: "mpx_menus");

        migrationBuilder.DropColumn(
            name: "created_at",
            table: "wkf_workflows");

        migrationBuilder.DropColumn(
            name: "updated_at",
            table: "wkf_workflows");

        migrationBuilder.DropColumn(
            name: "created_at",
            table: "wkf_workflow_types");

        migrationBuilder.DropColumn(
            name: "trigger_event",
            table: "wkf_workflow_types");

        migrationBuilder.DropColumn(
            name: "trigger_route_id",
            table: "wkf_workflow_types");

        migrationBuilder.DropColumn(
            name: "trigger_type_id",
            table: "wkf_workflow_types");

        migrationBuilder.DropColumn(
            name: "updated_at",
            table: "wkf_workflow_types");

        migrationBuilder.DropColumn(
            name: "created_at",
            table: "wkf_workflow_type_contexts");

        migrationBuilder.DropColumn(
            name: "updated_at",
            table: "wkf_workflow_type_contexts");

        migrationBuilder.DropColumn(
            name: "created_at",
            table: "wkf_workflow_type_configs");

        migrationBuilder.DropColumn(
            name: "is_isolated_error_catcher",
            table: "wkf_workflow_type_configs");

        migrationBuilder.DropColumn(
            name: "return_input_config_id",
            table: "wkf_workflow_type_configs");

        migrationBuilder.DropColumn(
            name: "target_route_id",
            table: "wkf_workflow_type_configs");

        migrationBuilder.DropColumn(
            name: "target_sub_workflow_type_id",
            table: "wkf_workflow_type_configs");

        migrationBuilder.DropColumn(
            name: "updated_at",
            table: "wkf_workflow_type_configs");

        migrationBuilder.DropColumn(
            name: "created_at",
            table: "wkf_workflow_type_config_validations");

        migrationBuilder.DropColumn(
            name: "updated_at",
            table: "wkf_workflow_type_config_validations");

        migrationBuilder.DropColumn(
            name: "created_at",
            table: "wkf_workflow_type_config_slas");

        migrationBuilder.DropColumn(
            name: "updated_at",
            table: "wkf_workflow_type_config_slas");

        migrationBuilder.DropColumn(
            name: "created_at",
            table: "wkf_workflow_type_config_notifications");

        migrationBuilder.DropColumn(
            name: "updated_at",
            table: "wkf_workflow_type_config_notifications");

        migrationBuilder.DropColumn(
            name: "created_at",
            table: "wkf_workflow_type_config_fields");

        migrationBuilder.DropColumn(
            name: "updated_at",
            table: "wkf_workflow_type_config_fields");

        migrationBuilder.DropColumn(
            name: "created_at",
            table: "wkf_workflow_type_config_conditions");

        migrationBuilder.DropColumn(
            name: "updated_at",
            table: "wkf_workflow_type_config_conditions");

        migrationBuilder.DropColumn(
            name: "created_at",
            table: "wkf_workflow_type_config_actions");

        migrationBuilder.DropColumn(
            name: "updated_at",
            table: "wkf_workflow_type_config_actions");

        migrationBuilder.DropColumn(
            name: "created_at",
            table: "wkf_workflow_type_config_action_file_types");

        migrationBuilder.DropColumn(
            name: "updated_at",
            table: "wkf_workflow_type_config_action_file_types");

        migrationBuilder.DropColumn(
            name: "updated_at",
            table: "wkf_workflow_tasks");

        migrationBuilder.DropColumn(
            name: "created_at",
            table: "wkf_workflow_task_owners");

        migrationBuilder.DropColumn(
            name: "updated_at",
            table: "wkf_workflow_task_owners");

        migrationBuilder.DropColumn(
            name: "created_at",
            table: "wkf_workflow_permissions");

        migrationBuilder.DropColumn(
            name: "updated_at",
            table: "wkf_workflow_permissions");

        migrationBuilder.DropColumn(
            name: "created_at",
            table: "wkf_workflow_items");

        migrationBuilder.DropColumn(
            name: "updated_at",
            table: "wkf_workflow_items");

        migrationBuilder.DropColumn(
            name: "created_at",
            table: "wkf_workflow_item_metadatas");

        migrationBuilder.DropColumn(
            name: "updated_at",
            table: "wkf_workflow_item_metadatas");

        migrationBuilder.DropColumn(
            name: "created_at",
            table: "wkf_stations");

        migrationBuilder.DropColumn(
            name: "station_type_id",
            table: "wkf_stations");

        migrationBuilder.DropColumn(
            name: "updated_at",
            table: "wkf_stations");

        migrationBuilder.DropColumn(
            name: "created_at",
            table: "sec_users");

        migrationBuilder.DropColumn(
            name: "updated_at",
            table: "sec_users");

        migrationBuilder.DropColumn(
            name: "created_at",
            table: "sec_user_statuses");

        migrationBuilder.DropColumn(
            name: "updated_at",
            table: "sec_user_statuses");

        migrationBuilder.DropColumn(
            name: "created_at",
            table: "sec_user_roles");

        migrationBuilder.DropColumn(
            name: "updated_at",
            table: "sec_user_roles");

        migrationBuilder.DropColumn(
            name: "created_at",
            table: "sec_user_claims");

        migrationBuilder.DropColumn(
            name: "updated_at",
            table: "sec_user_claims");

        migrationBuilder.DropColumn(
            name: "created_at",
            table: "sec_sub_modules");

        migrationBuilder.DropColumn(
            name: "updated_at",
            table: "sec_sub_modules");

        migrationBuilder.DropColumn(
            name: "created_at",
            table: "sec_roles");

        migrationBuilder.DropColumn(
            name: "updated_at",
            table: "sec_roles");

        migrationBuilder.DropColumn(
            name: "created_at",
            table: "sec_role_claims");

        migrationBuilder.DropColumn(
            name: "updated_at",
            table: "sec_role_claims");

        migrationBuilder.DropColumn(
            name: "created_at",
            table: "sec_modules");

        migrationBuilder.DropColumn(
            name: "updated_at",
            table: "sec_modules");

        migrationBuilder.DropColumn(
            name: "created_at",
            table: "sec_claims");

        migrationBuilder.DropColumn(
            name: "updated_at",
            table: "sec_claims");

        migrationBuilder.DropColumn(
            name: "created_at",
            table: "mpx_workspaces");

        migrationBuilder.DropColumn(
            name: "updated_at",
            table: "mpx_workspaces");

        migrationBuilder.DropColumn(
            name: "created_at",
            table: "mpx_workspace_users");

        migrationBuilder.DropColumn(
            name: "updated_at",
            table: "mpx_workspace_users");

        migrationBuilder.DropColumn(
            name: "created_at",
            table: "mpx_workspace_applications");

        migrationBuilder.DropColumn(
            name: "updated_at",
            table: "mpx_workspace_applications");

        migrationBuilder.DropColumn(
            name: "created_at",
            table: "mpx_user_notifications");

        migrationBuilder.DropColumn(
            name: "updated_at",
            table: "mpx_user_notifications");

        migrationBuilder.DropColumn(
            name: "created_at",
            table: "mpx_notifications");

        migrationBuilder.DropColumn(
            name: "updated_at",
            table: "mpx_notifications");

        migrationBuilder.DropColumn(
            name: "created_at",
            table: "mpx_modules");

        migrationBuilder.DropColumn(
            name: "updated_at",
            table: "mpx_modules");

        migrationBuilder.DropColumn(
            name: "created_at",
            table: "mpx_module_categories");

        migrationBuilder.DropColumn(
            name: "updated_at",
            table: "mpx_module_categories");

        migrationBuilder.DropColumn(
            name: "created_at",
            table: "mpx_menus");

        migrationBuilder.DropColumn(
            name: "route_id",
            table: "mpx_menus");

        migrationBuilder.DropColumn(
            name: "updated_at",
            table: "mpx_menus");

        migrationBuilder.DropColumn(
            name: "created_at",
            table: "mpx_file_types");

        migrationBuilder.DropColumn(
            name: "updated_at",
            table: "mpx_file_types");

        migrationBuilder.DropColumn(
            name: "created_at",
            table: "mpx_features");

        migrationBuilder.DropColumn(
            name: "updated_at",
            table: "mpx_features");

        migrationBuilder.DropColumn(
            name: "created_at",
            table: "mpx_feature_highlights");

        migrationBuilder.DropColumn(
            name: "updated_at",
            table: "mpx_feature_highlights");

        migrationBuilder.DropColumn(
            name: "created_at",
            table: "mpx_entity_properties");

        migrationBuilder.DropColumn(
            name: "updated_at",
            table: "mpx_entity_properties");

        migrationBuilder.DropColumn(
            name: "created_at",
            table: "mpx_entities");

        migrationBuilder.DropColumn(
            name: "updated_at",
            table: "mpx_entities");

        migrationBuilder.DropColumn(
            name: "created_at",
            table: "mpx_emails_to");

        migrationBuilder.DropColumn(
            name: "updated_at",
            table: "mpx_emails_to");

        migrationBuilder.DropColumn(
            name: "created_at",
            table: "mpx_emails_from");

        migrationBuilder.DropColumn(
            name: "updated_at",
            table: "mpx_emails_from");

        migrationBuilder.DropColumn(
            name: "created_at",
            table: "mpx_emails_cc");

        migrationBuilder.DropColumn(
            name: "updated_at",
            table: "mpx_emails_cc");

        migrationBuilder.DropColumn(
            name: "created_at",
            table: "mpx_emails_bcc");

        migrationBuilder.DropColumn(
            name: "updated_at",
            table: "mpx_emails_bcc");

        migrationBuilder.DropColumn(
            name: "created_at",
            table: "mpx_emails");

        migrationBuilder.DropColumn(
            name: "updated_at",
            table: "mpx_emails");

        migrationBuilder.DropColumn(
            name: "created_at",
            table: "mpx_corporations");

        migrationBuilder.DropColumn(
            name: "updated_at",
            table: "mpx_corporations");

        migrationBuilder.DropColumn(
            name: "created_at",
            table: "mpx_corporation_users");

        migrationBuilder.DropColumn(
            name: "updated_at",
            table: "mpx_corporation_users");

        migrationBuilder.DropColumn(
            name: "created_at",
            table: "mpx_corporation_domains");

        migrationBuilder.DropColumn(
            name: "updated_at",
            table: "mpx_corporation_domains");

        migrationBuilder.DropColumn(
            name: "created_at",
            table: "mpx_corporation_domain_records");

        migrationBuilder.DropColumn(
            name: "updated_at",
            table: "mpx_corporation_domain_records");

        migrationBuilder.DropColumn(
            name: "created_at",
            table: "mpx_categories");

        migrationBuilder.DropColumn(
            name: "updated_at",
            table: "mpx_categories");

        migrationBuilder.DropColumn(
            name: "created_at",
            table: "mpx_applications");

        migrationBuilder.DropColumn(
            name: "updated_at",
            table: "mpx_applications");

        migrationBuilder.DropColumn(
            name: "created_at",
            table: "mpx_application_users");

        migrationBuilder.DropColumn(
            name: "updated_at",
            table: "mpx_application_users");

        migrationBuilder.DropColumn(
            name: "created_at",
            table: "mpx_application_sub_modules");

        migrationBuilder.DropColumn(
            name: "updated_at",
            table: "mpx_application_sub_modules");

        migrationBuilder.DropColumn(
            name: "created_at",
            table: "mpx_application_statuses");

        migrationBuilder.DropColumn(
            name: "updated_at",
            table: "mpx_application_statuses");

        migrationBuilder.DropColumn(
            name: "created_at",
            table: "mpx_application_settings");

        migrationBuilder.DropColumn(
            name: "updated_at",
            table: "mpx_application_settings");

        migrationBuilder.DropColumn(
            name: "created_at",
            table: "mpx_application_modules");

        migrationBuilder.DropColumn(
            name: "updated_at",
            table: "mpx_application_modules");

        migrationBuilder.DropColumn(
            name: "created_at",
            table: "jrb_workflow_watchers");

        migrationBuilder.DropColumn(
            name: "updated_at",
            table: "jrb_workflow_watchers");

        migrationBuilder.DropColumn(
            name: "created_at",
            table: "jrb_sync_events");

        migrationBuilder.DropColumn(
            name: "updated_at",
            table: "jrb_sync_events");

        migrationBuilder.DropColumn(
            name: "created_at",
            table: "jrb_security_scopes");

        migrationBuilder.DropColumn(
            name: "updated_at",
            table: "jrb_security_scopes");

        migrationBuilder.DropColumn(
            name: "created_at",
            table: "jrb_security_levels");

        migrationBuilder.DropColumn(
            name: "updated_at",
            table: "jrb_security_levels");

        migrationBuilder.DropColumn(
            name: "created_at",
            table: "jrb_protected_files");

        migrationBuilder.DropColumn(
            name: "updated_at",
            table: "jrb_protected_files");

        migrationBuilder.DropColumn(
            name: "created_at",
            table: "jrb_permission_levels");

        migrationBuilder.DropColumn(
            name: "updated_at",
            table: "jrb_permission_levels");

        migrationBuilder.DropColumn(
            name: "created_at",
            table: "jrb_jobs");

        migrationBuilder.DropColumn(
            name: "updated_at",
            table: "jrb_jobs");

        migrationBuilder.DropColumn(
            name: "created_at",
            table: "jrb_insights");

        migrationBuilder.DropColumn(
            name: "updated_at",
            table: "jrb_insights");

        migrationBuilder.DropColumn(
            name: "created_at",
            table: "jrb_encryption_states");

        migrationBuilder.DropColumn(
            name: "updated_at",
            table: "jrb_encryption_states");

        migrationBuilder.DropColumn(
            name: "created_at",
            table: "jrb_conflict_alerts");

        migrationBuilder.DropColumn(
            name: "updated_at",
            table: "jrb_conflict_alerts");

        migrationBuilder.DropColumn(
            name: "created_at",
            table: "jrb_config");

        migrationBuilder.DropColumn(
            name: "updated_at",
            table: "jrb_config");

        migrationBuilder.DropColumn(
            name: "created_at",
            table: "jrb_agents");

        migrationBuilder.DropColumn(
            name: "updated_at",
            table: "jrb_agents");

        migrationBuilder.AlterColumn<string>(
            name: "trigger_type",
            table: "wkf_workflow_types",
            type: "character varying(60)",
            maxLength: 60,
            nullable: false,
            defaultValue: "Manual",
            oldClrType: typeof(string),
            oldType: "character varying(60)",
            oldMaxLength: 60,
            oldDefaultValue: "HtmlAction");

        migrationBuilder.AlterColumn<DateTime>(
            name: "created_at",
            table: "wkf_workflow_tasks",
            type: "timestamp with time zone",
            nullable: false,
            oldClrType: typeof(DateTime),
            oldType: "timestamp with time zone",
            oldDefaultValueSql: "now()");
    }
}
