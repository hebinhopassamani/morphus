using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Mpx.Infrastructure.Data.Migrations;

/// <inheritdoc />
public partial class _20261120201012_AddJarbassDocumentSecurityAndEntityPrefixStandard : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "fk_jrb_agents_mpx_corporations_corporation_id",
            table: "jrb_agents");

        migrationBuilder.DropForeignKey(
            name: "fk_jrb_config_mpx_corporations_corporation_id",
            table: "jrb_config");

        migrationBuilder.DropForeignKey(
            name: "fk_jrb_conflict_alerts_mpx_corporations_corporation_id",
            table: "jrb_conflict_alerts");

        migrationBuilder.DropForeignKey(
            name: "fk_jrb_conflict_alerts_mpx_entities_entity_definition_id",
            table: "jrb_conflict_alerts");

        migrationBuilder.DropForeignKey(
            name: "fk_jrb_insights_mpx_corporations_corporation_id",
            table: "jrb_insights");

        migrationBuilder.DropForeignKey(
            name: "fk_jrb_insights_mpx_entities_entity_definition_id",
            table: "jrb_insights");

        migrationBuilder.DropForeignKey(
            name: "fk_jrb_jobs_mpx_corporations_corporation_id",
            table: "jrb_jobs");

        migrationBuilder.DropForeignKey(
            name: "fk_jrb_protected_files_mpx_corporations_corporation_id",
            table: "jrb_protected_files");

        migrationBuilder.DropForeignKey(
            name: "fk_jrb_sync_events_mpx_corporations_corporation_id",
            table: "jrb_sync_events");

        migrationBuilder.DropForeignKey(
            name: "fk_jrb_sync_events_mpx_entities_entity_definition_id",
            table: "jrb_sync_events");

        migrationBuilder.DropForeignKey(
            name: "fk_jrb_workflow_watchers_mpx_corporations_corporation_id",
            table: "jrb_workflow_watchers");

        migrationBuilder.DropForeignKey(
            name: "fk_mpx_user_notifications_sec_users_user_id",
            table: "mpx_user_notifications");

        migrationBuilder.DropForeignKey(
            name: "fk_mpx_workspace_users_sec_users_user_id",
            table: "mpx_workspace_users");

        migrationBuilder.DropForeignKey(
            name: "fk_sec_claims_corporations_corporation_id",
            table: "sec_claims");

        migrationBuilder.DropForeignKey(
            name: "fk_wkf_workflow_items_wkf_workflows_workflow_id",
            table: "wkf_workflow_items");

        migrationBuilder.DropForeignKey(
            name: "fk_wkf_workflow_permissions_workspaces_workspace_id",
            table: "wkf_workflow_permissions");

        migrationBuilder.DropForeignKey(
            name: "fk_wkf_workflow_tasks_wkf_workflows_workflow_id",
            table: "wkf_workflow_tasks");

        migrationBuilder.DropForeignKey(
            name: "fk_wkf_workflow_tasks_workspaces_target_workspace_id",
            table: "wkf_workflow_tasks");

        migrationBuilder.DropForeignKey(
            name: "fk_wkf_workflow_types_workspaces_workspace_id",
            table: "wkf_workflow_types");

        migrationBuilder.DropForeignKey(
            name: "fk_wkf_workflows_workflow_type_config_actions_workflow_type_co",
            table: "wkf_workflows");

        migrationBuilder.DropForeignKey(
            name: "fk_wkf_workflows_workflow_type_config_conditions_workflow_type",
            table: "wkf_workflows");

        migrationBuilder.DropForeignKey(
            name: "fk_wkf_workflows_workflow_type_configs_from_workflow_type_conf",
            table: "wkf_workflows");

        migrationBuilder.DropForeignKey(
            name: "fk_wkf_workflows_workflow_type_configs_join_target_config_id",
            table: "wkf_workflows");

        migrationBuilder.DropForeignKey(
            name: "fk_wkf_workflows_workflow_type_configs_to_workflow_type_config",
            table: "wkf_workflows");

        migrationBuilder.DropForeignKey(
            name: "fk_wkf_workflows_workflow_types_workflow_type_id",
            table: "wkf_workflows");

        migrationBuilder.DropIndex(
            name: "ix_mpx_file_types_corporation_id",
            table: "mpx_file_types");

        migrationBuilder.DropIndex(
            name: "ix_jrb_protected_files_current_holder_user_id",
            table: "jrb_protected_files");

        migrationBuilder.DropIndex(
            name: "ix_jrb_protected_files_is_held_in_hand_lease_expires_at_utc",
            table: "jrb_protected_files");

        migrationBuilder.DropColumn(
            name: "encryption_state",
            table: "jrb_protected_files");

        migrationBuilder.DropColumn(
            name: "permission_level",
            table: "jrb_protected_files");

        migrationBuilder.AddColumn<int>(
            name: "default_lease_minutes",
            table: "mpx_file_types",
            type: "integer",
            nullable: false,
            defaultValue: 60);

        migrationBuilder.AddColumn<Guid>(
            name: "default_permission_level_id",
            table: "mpx_file_types",
            type: "uuid",
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "default_required_claim_key",
            table: "mpx_file_types",
            type: "character varying(120)",
            maxLength: 120,
            nullable: true);

        migrationBuilder.AddColumn<Guid>(
            name: "security_level_id",
            table: "mpx_file_types",
            type: "uuid",
            nullable: true);

        migrationBuilder.AddColumn<Guid>(
            name: "security_scope_id",
            table: "mpx_file_types",
            type: "uuid",
            nullable: true);

        migrationBuilder.AddColumn<Guid>(
            name: "effective_security_level_id",
            table: "jrb_protected_files",
            type: "uuid",
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "encrypted_metadata_header",
            table: "jrb_protected_files",
            type: "text",
            nullable: true);

        migrationBuilder.AddColumn<Guid>(
            name: "encryption_state_id",
            table: "jrb_protected_files",
            type: "uuid",
            nullable: true);

        migrationBuilder.AddColumn<Guid>(
            name: "file_type_id",
            table: "jrb_protected_files",
            type: "uuid",
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "inner_content_signature",
            table: "jrb_protected_files",
            type: "character varying(128)",
            maxLength: 128,
            nullable: true);

        migrationBuilder.AddColumn<Guid>(
            name: "instance_security_level_id",
            table: "jrb_protected_files",
            type: "uuid",
            nullable: true);

        migrationBuilder.AddColumn<DateTime>(
            name: "last_online_security_verified_at_utc",
            table: "jrb_protected_files",
            type: "timestamp with time zone",
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "outer_envelope_signature",
            table: "jrb_protected_files",
            type: "character varying(128)",
            maxLength: 128,
            nullable: true);

        migrationBuilder.AddColumn<Guid>(
            name: "permission_level_id",
            table: "jrb_protected_files",
            type: "uuid",
            nullable: true);

        migrationBuilder.AddColumn<Guid>(
            name: "security_scope_id",
            table: "jrb_protected_files",
            type: "uuid",
            nullable: true);

        migrationBuilder.CreateTable(
            name: "jrb_encryption_states",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                corporation_id = table.Column<Guid>(type: "uuid", nullable: true),
                code = table.Column<short>(type: "smallint", nullable: false, defaultValue: (short)1),
                label = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                is_encrypted = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                is_held_in_hand = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                is_tamper_locked = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                icon = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: true),
                color = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: true),
                order = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                description = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false, defaultValue: ""),
                system = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                inactive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_jrb_encryption_states", x => x.id);
                table.ForeignKey(
                    name: "fk_jrb_encryption_states_corporations_corporation_id",
                    column: x => x.corporation_id,
                    principalTable: "mpx_corporations",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateTable(
            name: "jrb_permission_levels",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                corporation_id = table.Column<Guid>(type: "uuid", nullable: true),
                code = table.Column<short>(type: "smallint", nullable: false, defaultValue: (short)1),
                label = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                allow_read = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                allow_write = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                allow_security_change = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                icon = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: true),
                color = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: true),
                order = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                description = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false, defaultValue: ""),
                system = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                inactive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_jrb_permission_levels", x => x.id);
                table.ForeignKey(
                    name: "fk_jrb_permission_levels_corporations_corporation_id",
                    column: x => x.corporation_id,
                    principalTable: "mpx_corporations",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateTable(
            name: "jrb_security_levels",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                corporation_id = table.Column<Guid>(type: "uuid", nullable: true),
                code = table.Column<short>(type: "smallint", nullable: false, defaultValue: (short)0),
                label = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                jarbass_should_ignore = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                requires_encryption_at_rest = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                requires_online_validation = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                icon = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: true),
                color = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: true),
                order = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                description = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false, defaultValue: ""),
                system = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                inactive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_jrb_security_levels", x => x.id);
                table.ForeignKey(
                    name: "fk_jrb_security_levels_corporations_corporation_id",
                    column: x => x.corporation_id,
                    principalTable: "mpx_corporations",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateTable(
            name: "jrb_security_scopes",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                corporation_id = table.Column<Guid>(type: "uuid", nullable: true),
                code = table.Column<short>(type: "smallint", nullable: false, defaultValue: (short)0),
                label = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                apply_to_instance = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                icon = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: true),
                color = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: true),
                order = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                description = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false, defaultValue: ""),
                system = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                inactive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_jrb_security_scopes", x => x.id);
                table.ForeignKey(
                    name: "fk_jrb_security_scopes_corporations_corporation_id",
                    column: x => x.corporation_id,
                    principalTable: "mpx_corporations",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateIndex(
            name: "ix_mpx_file_types_corporation_id_security_scope_id_security_le",
            table: "mpx_file_types",
            columns: new[] { "corporation_id", "security_scope_id", "security_level_id" });

        migrationBuilder.CreateIndex(
            name: "ix_mpx_file_types_default_permission_level_id",
            table: "mpx_file_types",
            column: "default_permission_level_id");

        migrationBuilder.CreateIndex(
            name: "ix_mpx_file_types_security_level_id",
            table: "mpx_file_types",
            column: "security_level_id");

        migrationBuilder.CreateIndex(
            name: "ix_mpx_file_types_security_scope_id",
            table: "mpx_file_types",
            column: "security_scope_id");

        migrationBuilder.CreateIndex(
            name: "ix_jrb_protected_files_current_holder_user_id_permission_level",
            table: "jrb_protected_files",
            columns: new[] { "current_holder_user_id", "permission_level_id", "is_held_in_hand" });

        migrationBuilder.CreateIndex(
            name: "ix_jrb_protected_files_effective_security_level_id",
            table: "jrb_protected_files",
            column: "effective_security_level_id");

        migrationBuilder.CreateIndex(
            name: "ix_jrb_protected_files_encryption_state_id",
            table: "jrb_protected_files",
            column: "encryption_state_id");

        migrationBuilder.CreateIndex(
            name: "ix_jrb_protected_files_file_type_id_security_scope_id_effectiv",
            table: "jrb_protected_files",
            columns: new[] { "file_type_id", "security_scope_id", "effective_security_level_id" });

        migrationBuilder.CreateIndex(
            name: "ix_jrb_protected_files_instance_security_level_id",
            table: "jrb_protected_files",
            column: "instance_security_level_id");

        migrationBuilder.CreateIndex(
            name: "ix_jrb_protected_files_is_held_in_hand_encryption_state_id_lea",
            table: "jrb_protected_files",
            columns: new[] { "is_held_in_hand", "encryption_state_id", "lease_expires_at_utc" });

        migrationBuilder.CreateIndex(
            name: "ix_jrb_protected_files_permission_level_id",
            table: "jrb_protected_files",
            column: "permission_level_id");

        migrationBuilder.CreateIndex(
            name: "ix_jrb_protected_files_security_scope_id",
            table: "jrb_protected_files",
            column: "security_scope_id");

        migrationBuilder.CreateIndex(
            name: "ix_jrb_encryption_states_corporation_id_code",
            table: "jrb_encryption_states",
            columns: new[] { "corporation_id", "code" },
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_jrb_encryption_states_key",
            table: "jrb_encryption_states",
            column: "key",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_jrb_permission_levels_corporation_id_code",
            table: "jrb_permission_levels",
            columns: new[] { "corporation_id", "code" },
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_jrb_permission_levels_key",
            table: "jrb_permission_levels",
            column: "key",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_jrb_security_levels_code_jarbass_should_ignore_requires_onl",
            table: "jrb_security_levels",
            columns: new[] { "code", "jarbass_should_ignore", "requires_online_validation" });

        migrationBuilder.CreateIndex(
            name: "ix_jrb_security_levels_corporation_id_code",
            table: "jrb_security_levels",
            columns: new[] { "corporation_id", "code" },
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_jrb_security_levels_key",
            table: "jrb_security_levels",
            column: "key",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_jrb_security_scopes_corporation_id_code",
            table: "jrb_security_scopes",
            columns: new[] { "corporation_id", "code" },
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_jrb_security_scopes_key",
            table: "jrb_security_scopes",
            column: "key",
            unique: true);

        migrationBuilder.AddForeignKey(
            name: "fk_jrb_agents_corporations_corporation_id",
            table: "jrb_agents",
            column: "corporation_id",
            principalTable: "mpx_corporations",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_jrb_config_corporations_corporation_id",
            table: "jrb_config",
            column: "corporation_id",
            principalTable: "mpx_corporations",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_jrb_conflict_alerts_corporations_corporation_id",
            table: "jrb_conflict_alerts",
            column: "corporation_id",
            principalTable: "mpx_corporations",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_jrb_conflict_alerts_entity_definitions_entity_definition_id",
            table: "jrb_conflict_alerts",
            column: "entity_definition_id",
            principalTable: "mpx_entities",
            principalColumn: "id",
            onDelete: ReferentialAction.SetNull);

        migrationBuilder.AddForeignKey(
            name: "fk_jrb_insights_corporations_corporation_id",
            table: "jrb_insights",
            column: "corporation_id",
            principalTable: "mpx_corporations",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_jrb_insights_entity_definitions_entity_definition_id",
            table: "jrb_insights",
            column: "entity_definition_id",
            principalTable: "mpx_entities",
            principalColumn: "id",
            onDelete: ReferentialAction.SetNull);

        migrationBuilder.AddForeignKey(
            name: "fk_jrb_jobs_corporations_corporation_id",
            table: "jrb_jobs",
            column: "corporation_id",
            principalTable: "mpx_corporations",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_jrb_protected_files_corporations_corporation_id",
            table: "jrb_protected_files",
            column: "corporation_id",
            principalTable: "mpx_corporations",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_jrb_protected_files_file_types_file_type_id",
            table: "jrb_protected_files",
            column: "file_type_id",
            principalTable: "mpx_file_types",
            principalColumn: "id",
            onDelete: ReferentialAction.SetNull);

        migrationBuilder.AddForeignKey(
            name: "fk_jrb_protected_files_jarbass_security_levels_effective_secur",
            table: "jrb_protected_files",
            column: "effective_security_level_id",
            principalTable: "jrb_security_levels",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_jrb_protected_files_jarbass_security_levels_instance_securi",
            table: "jrb_protected_files",
            column: "instance_security_level_id",
            principalTable: "jrb_security_levels",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_jrb_protected_files_jarbass_security_scopes_security_scope_",
            table: "jrb_protected_files",
            column: "security_scope_id",
            principalTable: "jrb_security_scopes",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_jrb_protected_files_jrb_encryption_states_encryption_state_",
            table: "jrb_protected_files",
            column: "encryption_state_id",
            principalTable: "jrb_encryption_states",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_jrb_protected_files_jrb_permission_levels_permission_level_",
            table: "jrb_protected_files",
            column: "permission_level_id",
            principalTable: "jrb_permission_levels",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_jrb_sync_events_corporations_corporation_id",
            table: "jrb_sync_events",
            column: "corporation_id",
            principalTable: "mpx_corporations",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_jrb_sync_events_entity_definitions_entity_definition_id",
            table: "jrb_sync_events",
            column: "entity_definition_id",
            principalTable: "mpx_entities",
            principalColumn: "id",
            onDelete: ReferentialAction.SetNull);

        migrationBuilder.AddForeignKey(
            name: "fk_jrb_workflow_watchers_corporations_corporation_id",
            table: "jrb_workflow_watchers",
            column: "corporation_id",
            principalTable: "mpx_corporations",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_mpx_file_types_jrb_permission_levels_default_permission_lev",
            table: "mpx_file_types",
            column: "default_permission_level_id",
            principalTable: "jrb_permission_levels",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_mpx_file_types_jrb_security_levels_security_level_id",
            table: "mpx_file_types",
            column: "security_level_id",
            principalTable: "jrb_security_levels",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_mpx_file_types_jrb_security_scopes_security_scope_id",
            table: "mpx_file_types",
            column: "security_scope_id",
            principalTable: "jrb_security_scopes",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_mpx_user_notifications_users_user_id",
            table: "mpx_user_notifications",
            column: "user_id",
            principalTable: "sec_users",
            principalColumn: "id",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "fk_mpx_workspace_users_users_user_id",
            table: "mpx_workspace_users",
            column: "user_id",
            principalTable: "sec_users",
            principalColumn: "id",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "fk_sec_claims_mpx_corporations_corporation_id",
            table: "sec_claims",
            column: "corporation_id",
            principalTable: "mpx_corporations",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_wkf_workflow_items_workflows_workflow_id",
            table: "wkf_workflow_items",
            column: "workflow_id",
            principalTable: "wkf_workflows",
            principalColumn: "id",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "fk_wkf_workflow_permissions_mpx_workspaces_workspace_id",
            table: "wkf_workflow_permissions",
            column: "workspace_id",
            principalTable: "mpx_workspaces",
            principalColumn: "id",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "fk_wkf_workflow_tasks_mpx_workspaces_target_workspace_id",
            table: "wkf_workflow_tasks",
            column: "target_workspace_id",
            principalTable: "mpx_workspaces",
            principalColumn: "id",
            onDelete: ReferentialAction.SetNull);

        migrationBuilder.AddForeignKey(
            name: "fk_wkf_workflow_tasks_workflows_workflow_id",
            table: "wkf_workflow_tasks",
            column: "workflow_id",
            principalTable: "wkf_workflows",
            principalColumn: "id",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "fk_wkf_workflow_types_mpx_workspaces_workspace_id",
            table: "wkf_workflow_types",
            column: "workspace_id",
            principalTable: "mpx_workspaces",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_wkf_workflows_wkf_workflow_type_config_actions_workflow_typ",
            table: "wkf_workflows",
            column: "workflow_type_config_action_id",
            principalTable: "wkf_workflow_type_config_actions",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_wkf_workflows_wkf_workflow_type_config_conditions_workflow_",
            table: "wkf_workflows",
            column: "workflow_type_config_condition_id",
            principalTable: "wkf_workflow_type_config_conditions",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_wkf_workflows_wkf_workflow_type_configs_from_workflow_type_",
            table: "wkf_workflows",
            column: "from_workflow_type_config_id",
            principalTable: "wkf_workflow_type_configs",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_wkf_workflows_wkf_workflow_type_configs_join_target_config_",
            table: "wkf_workflows",
            column: "join_target_config_id",
            principalTable: "wkf_workflow_type_configs",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_wkf_workflows_wkf_workflow_type_configs_to_workflow_type_co",
            table: "wkf_workflows",
            column: "to_workflow_type_config_id",
            principalTable: "wkf_workflow_type_configs",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_wkf_workflows_wkf_workflow_types_workflow_type_id",
            table: "wkf_workflows",
            column: "workflow_type_id",
            principalTable: "wkf_workflow_types",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "fk_jrb_agents_corporations_corporation_id",
            table: "jrb_agents");

        migrationBuilder.DropForeignKey(
            name: "fk_jrb_config_corporations_corporation_id",
            table: "jrb_config");

        migrationBuilder.DropForeignKey(
            name: "fk_jrb_conflict_alerts_corporations_corporation_id",
            table: "jrb_conflict_alerts");

        migrationBuilder.DropForeignKey(
            name: "fk_jrb_conflict_alerts_entity_definitions_entity_definition_id",
            table: "jrb_conflict_alerts");

        migrationBuilder.DropForeignKey(
            name: "fk_jrb_insights_corporations_corporation_id",
            table: "jrb_insights");

        migrationBuilder.DropForeignKey(
            name: "fk_jrb_insights_entity_definitions_entity_definition_id",
            table: "jrb_insights");

        migrationBuilder.DropForeignKey(
            name: "fk_jrb_jobs_corporations_corporation_id",
            table: "jrb_jobs");

        migrationBuilder.DropForeignKey(
            name: "fk_jrb_protected_files_corporations_corporation_id",
            table: "jrb_protected_files");

        migrationBuilder.DropForeignKey(
            name: "fk_jrb_protected_files_file_types_file_type_id",
            table: "jrb_protected_files");

        migrationBuilder.DropForeignKey(
            name: "fk_jrb_protected_files_jarbass_security_levels_effective_secur",
            table: "jrb_protected_files");

        migrationBuilder.DropForeignKey(
            name: "fk_jrb_protected_files_jarbass_security_levels_instance_securi",
            table: "jrb_protected_files");

        migrationBuilder.DropForeignKey(
            name: "fk_jrb_protected_files_jarbass_security_scopes_security_scope_",
            table: "jrb_protected_files");

        migrationBuilder.DropForeignKey(
            name: "fk_jrb_protected_files_jrb_encryption_states_encryption_state_",
            table: "jrb_protected_files");

        migrationBuilder.DropForeignKey(
            name: "fk_jrb_protected_files_jrb_permission_levels_permission_level_",
            table: "jrb_protected_files");

        migrationBuilder.DropForeignKey(
            name: "fk_jrb_sync_events_corporations_corporation_id",
            table: "jrb_sync_events");

        migrationBuilder.DropForeignKey(
            name: "fk_jrb_sync_events_entity_definitions_entity_definition_id",
            table: "jrb_sync_events");

        migrationBuilder.DropForeignKey(
            name: "fk_jrb_workflow_watchers_corporations_corporation_id",
            table: "jrb_workflow_watchers");

        migrationBuilder.DropForeignKey(
            name: "fk_mpx_file_types_jrb_permission_levels_default_permission_lev",
            table: "mpx_file_types");

        migrationBuilder.DropForeignKey(
            name: "fk_mpx_file_types_jrb_security_levels_security_level_id",
            table: "mpx_file_types");

        migrationBuilder.DropForeignKey(
            name: "fk_mpx_file_types_jrb_security_scopes_security_scope_id",
            table: "mpx_file_types");

        migrationBuilder.DropForeignKey(
            name: "fk_mpx_user_notifications_users_user_id",
            table: "mpx_user_notifications");

        migrationBuilder.DropForeignKey(
            name: "fk_mpx_workspace_users_users_user_id",
            table: "mpx_workspace_users");

        migrationBuilder.DropForeignKey(
            name: "fk_sec_claims_mpx_corporations_corporation_id",
            table: "sec_claims");

        migrationBuilder.DropForeignKey(
            name: "fk_wkf_workflow_items_workflows_workflow_id",
            table: "wkf_workflow_items");

        migrationBuilder.DropForeignKey(
            name: "fk_wkf_workflow_permissions_mpx_workspaces_workspace_id",
            table: "wkf_workflow_permissions");

        migrationBuilder.DropForeignKey(
            name: "fk_wkf_workflow_tasks_mpx_workspaces_target_workspace_id",
            table: "wkf_workflow_tasks");

        migrationBuilder.DropForeignKey(
            name: "fk_wkf_workflow_tasks_workflows_workflow_id",
            table: "wkf_workflow_tasks");

        migrationBuilder.DropForeignKey(
            name: "fk_wkf_workflow_types_mpx_workspaces_workspace_id",
            table: "wkf_workflow_types");

        migrationBuilder.DropForeignKey(
            name: "fk_wkf_workflows_wkf_workflow_type_config_actions_workflow_typ",
            table: "wkf_workflows");

        migrationBuilder.DropForeignKey(
            name: "fk_wkf_workflows_wkf_workflow_type_config_conditions_workflow_",
            table: "wkf_workflows");

        migrationBuilder.DropForeignKey(
            name: "fk_wkf_workflows_wkf_workflow_type_configs_from_workflow_type_",
            table: "wkf_workflows");

        migrationBuilder.DropForeignKey(
            name: "fk_wkf_workflows_wkf_workflow_type_configs_join_target_config_",
            table: "wkf_workflows");

        migrationBuilder.DropForeignKey(
            name: "fk_wkf_workflows_wkf_workflow_type_configs_to_workflow_type_co",
            table: "wkf_workflows");

        migrationBuilder.DropForeignKey(
            name: "fk_wkf_workflows_wkf_workflow_types_workflow_type_id",
            table: "wkf_workflows");

        migrationBuilder.DropTable(
            name: "jrb_encryption_states");

        migrationBuilder.DropTable(
            name: "jrb_permission_levels");

        migrationBuilder.DropTable(
            name: "jrb_security_levels");

        migrationBuilder.DropTable(
            name: "jrb_security_scopes");

        migrationBuilder.DropIndex(
            name: "ix_mpx_file_types_corporation_id_security_scope_id_security_le",
            table: "mpx_file_types");

        migrationBuilder.DropIndex(
            name: "ix_mpx_file_types_default_permission_level_id",
            table: "mpx_file_types");

        migrationBuilder.DropIndex(
            name: "ix_mpx_file_types_security_level_id",
            table: "mpx_file_types");

        migrationBuilder.DropIndex(
            name: "ix_mpx_file_types_security_scope_id",
            table: "mpx_file_types");

        migrationBuilder.DropIndex(
            name: "ix_jrb_protected_files_current_holder_user_id_permission_level",
            table: "jrb_protected_files");

        migrationBuilder.DropIndex(
            name: "ix_jrb_protected_files_effective_security_level_id",
            table: "jrb_protected_files");

        migrationBuilder.DropIndex(
            name: "ix_jrb_protected_files_encryption_state_id",
            table: "jrb_protected_files");

        migrationBuilder.DropIndex(
            name: "ix_jrb_protected_files_file_type_id_security_scope_id_effectiv",
            table: "jrb_protected_files");

        migrationBuilder.DropIndex(
            name: "ix_jrb_protected_files_instance_security_level_id",
            table: "jrb_protected_files");

        migrationBuilder.DropIndex(
            name: "ix_jrb_protected_files_is_held_in_hand_encryption_state_id_lea",
            table: "jrb_protected_files");

        migrationBuilder.DropIndex(
            name: "ix_jrb_protected_files_permission_level_id",
            table: "jrb_protected_files");

        migrationBuilder.DropIndex(
            name: "ix_jrb_protected_files_security_scope_id",
            table: "jrb_protected_files");

        migrationBuilder.DropColumn(
            name: "default_lease_minutes",
            table: "mpx_file_types");

        migrationBuilder.DropColumn(
            name: "default_permission_level_id",
            table: "mpx_file_types");

        migrationBuilder.DropColumn(
            name: "default_required_claim_key",
            table: "mpx_file_types");

        migrationBuilder.DropColumn(
            name: "security_level_id",
            table: "mpx_file_types");

        migrationBuilder.DropColumn(
            name: "security_scope_id",
            table: "mpx_file_types");

        migrationBuilder.DropColumn(
            name: "effective_security_level_id",
            table: "jrb_protected_files");

        migrationBuilder.DropColumn(
            name: "encrypted_metadata_header",
            table: "jrb_protected_files");

        migrationBuilder.DropColumn(
            name: "encryption_state_id",
            table: "jrb_protected_files");

        migrationBuilder.DropColumn(
            name: "file_type_id",
            table: "jrb_protected_files");

        migrationBuilder.DropColumn(
            name: "inner_content_signature",
            table: "jrb_protected_files");

        migrationBuilder.DropColumn(
            name: "instance_security_level_id",
            table: "jrb_protected_files");

        migrationBuilder.DropColumn(
            name: "last_online_security_verified_at_utc",
            table: "jrb_protected_files");

        migrationBuilder.DropColumn(
            name: "outer_envelope_signature",
            table: "jrb_protected_files");

        migrationBuilder.DropColumn(
            name: "permission_level_id",
            table: "jrb_protected_files");

        migrationBuilder.DropColumn(
            name: "security_scope_id",
            table: "jrb_protected_files");

        migrationBuilder.AddColumn<string>(
            name: "encryption_state",
            table: "jrb_protected_files",
            type: "character varying(40)",
            maxLength: 40,
            nullable: false,
            defaultValue: "EncryptedAtRest");

        migrationBuilder.AddColumn<string>(
            name: "permission_level",
            table: "jrb_protected_files",
            type: "character varying(40)",
            maxLength: 40,
            nullable: false,
            defaultValue: "ReadOnly");

        migrationBuilder.CreateIndex(
            name: "ix_mpx_file_types_corporation_id",
            table: "mpx_file_types",
            column: "corporation_id");

        migrationBuilder.CreateIndex(
            name: "ix_jrb_protected_files_current_holder_user_id",
            table: "jrb_protected_files",
            column: "current_holder_user_id");

        migrationBuilder.CreateIndex(
            name: "ix_jrb_protected_files_is_held_in_hand_lease_expires_at_utc",
            table: "jrb_protected_files",
            columns: new[] { "is_held_in_hand", "lease_expires_at_utc" });

        migrationBuilder.AddForeignKey(
            name: "fk_jrb_agents_mpx_corporations_corporation_id",
            table: "jrb_agents",
            column: "corporation_id",
            principalTable: "mpx_corporations",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_jrb_config_mpx_corporations_corporation_id",
            table: "jrb_config",
            column: "corporation_id",
            principalTable: "mpx_corporations",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_jrb_conflict_alerts_mpx_corporations_corporation_id",
            table: "jrb_conflict_alerts",
            column: "corporation_id",
            principalTable: "mpx_corporations",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_jrb_conflict_alerts_mpx_entities_entity_definition_id",
            table: "jrb_conflict_alerts",
            column: "entity_definition_id",
            principalTable: "mpx_entities",
            principalColumn: "id",
            onDelete: ReferentialAction.SetNull);

        migrationBuilder.AddForeignKey(
            name: "fk_jrb_insights_mpx_corporations_corporation_id",
            table: "jrb_insights",
            column: "corporation_id",
            principalTable: "mpx_corporations",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_jrb_insights_mpx_entities_entity_definition_id",
            table: "jrb_insights",
            column: "entity_definition_id",
            principalTable: "mpx_entities",
            principalColumn: "id",
            onDelete: ReferentialAction.SetNull);

        migrationBuilder.AddForeignKey(
            name: "fk_jrb_jobs_mpx_corporations_corporation_id",
            table: "jrb_jobs",
            column: "corporation_id",
            principalTable: "mpx_corporations",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_jrb_protected_files_mpx_corporations_corporation_id",
            table: "jrb_protected_files",
            column: "corporation_id",
            principalTable: "mpx_corporations",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_jrb_sync_events_mpx_corporations_corporation_id",
            table: "jrb_sync_events",
            column: "corporation_id",
            principalTable: "mpx_corporations",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_jrb_sync_events_mpx_entities_entity_definition_id",
            table: "jrb_sync_events",
            column: "entity_definition_id",
            principalTable: "mpx_entities",
            principalColumn: "id",
            onDelete: ReferentialAction.SetNull);

        migrationBuilder.AddForeignKey(
            name: "fk_jrb_workflow_watchers_mpx_corporations_corporation_id",
            table: "jrb_workflow_watchers",
            column: "corporation_id",
            principalTable: "mpx_corporations",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_mpx_user_notifications_sec_users_user_id",
            table: "mpx_user_notifications",
            column: "user_id",
            principalTable: "sec_users",
            principalColumn: "id",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "fk_mpx_workspace_users_sec_users_user_id",
            table: "mpx_workspace_users",
            column: "user_id",
            principalTable: "sec_users",
            principalColumn: "id",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "fk_sec_claims_corporations_corporation_id",
            table: "sec_claims",
            column: "corporation_id",
            principalTable: "mpx_corporations",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_wkf_workflow_items_wkf_workflows_workflow_id",
            table: "wkf_workflow_items",
            column: "workflow_id",
            principalTable: "wkf_workflows",
            principalColumn: "id",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "fk_wkf_workflow_permissions_workspaces_workspace_id",
            table: "wkf_workflow_permissions",
            column: "workspace_id",
            principalTable: "mpx_workspaces",
            principalColumn: "id",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "fk_wkf_workflow_tasks_wkf_workflows_workflow_id",
            table: "wkf_workflow_tasks",
            column: "workflow_id",
            principalTable: "wkf_workflows",
            principalColumn: "id",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "fk_wkf_workflow_tasks_workspaces_target_workspace_id",
            table: "wkf_workflow_tasks",
            column: "target_workspace_id",
            principalTable: "mpx_workspaces",
            principalColumn: "id",
            onDelete: ReferentialAction.SetNull);

        migrationBuilder.AddForeignKey(
            name: "fk_wkf_workflow_types_workspaces_workspace_id",
            table: "wkf_workflow_types",
            column: "workspace_id",
            principalTable: "mpx_workspaces",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_wkf_workflows_workflow_type_config_actions_workflow_type_co",
            table: "wkf_workflows",
            column: "workflow_type_config_action_id",
            principalTable: "wkf_workflow_type_config_actions",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_wkf_workflows_workflow_type_config_conditions_workflow_type",
            table: "wkf_workflows",
            column: "workflow_type_config_condition_id",
            principalTable: "wkf_workflow_type_config_conditions",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_wkf_workflows_workflow_type_configs_from_workflow_type_conf",
            table: "wkf_workflows",
            column: "from_workflow_type_config_id",
            principalTable: "wkf_workflow_type_configs",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_wkf_workflows_workflow_type_configs_join_target_config_id",
            table: "wkf_workflows",
            column: "join_target_config_id",
            principalTable: "wkf_workflow_type_configs",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_wkf_workflows_workflow_type_configs_to_workflow_type_config",
            table: "wkf_workflows",
            column: "to_workflow_type_config_id",
            principalTable: "wkf_workflow_type_configs",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_wkf_workflows_workflow_types_workflow_type_id",
            table: "wkf_workflows",
            column: "workflow_type_id",
            principalTable: "wkf_workflow_types",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);
    }
}
