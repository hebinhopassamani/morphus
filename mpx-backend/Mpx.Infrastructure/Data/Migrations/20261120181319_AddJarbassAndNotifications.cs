using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Mpx.Infrastructure.Data.Migrations;

/// <inheritdoc />
public partial class _20261120181319_AddJarbassAndNotifications : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropIndex(
            name: "ix_wkf_workflows_parent_workflow_id",
            table: "wkf_workflows");

        migrationBuilder.AddColumn<int>(
            name: "completed_split_branches",
            table: "wkf_workflows",
            type: "integer",
            nullable: false,
            defaultValue: 0);

        migrationBuilder.AddColumn<int>(
            name: "expected_split_branches",
            table: "wkf_workflows",
            type: "integer",
            nullable: false,
            defaultValue: 0);

        migrationBuilder.AddColumn<Guid>(
            name: "join_target_config_id",
            table: "wkf_workflows",
            type: "uuid",
            nullable: true);

        migrationBuilder.AddColumn<Guid>(
            name: "split_group_id",
            table: "wkf_workflows",
            type: "uuid",
            nullable: true);

        migrationBuilder.AddColumn<bool>(
            name: "waiting_for_split_join",
            table: "wkf_workflows",
            type: "boolean",
            nullable: false,
            defaultValue: false);

        migrationBuilder.CreateTable(
            name: "jrb_agents",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                corporation_id = table.Column<Guid>(type: "uuid", nullable: true),
                workspace_id = table.Column<Guid>(type: "uuid", nullable: true),
                user_id = table.Column<Guid>(type: "uuid", nullable: true),
                name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                machine_name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                operating_system = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                ip_address = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: true),
                version = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false, defaultValue: "1.0.0"),
                environment_mode = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false, defaultValue: "Server"),
                status = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false, defaultValue: "Online"),
                is_offline_capable = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                last_heartbeat_utc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                last_trusted_server_utc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                last_cpu_tick_anchor = table.Column<long>(type: "bigint", nullable: false, defaultValue: 0L),
                high_water_mark_utc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                last_chain_hash = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: true),
                last_synced_sequence_number = table.Column<long>(type: "bigint", nullable: false, defaultValue: 0L),
                description = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false, defaultValue: ""),
                system = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                inactive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_jrb_agents", x => x.id);
                table.ForeignKey(
                    name: "fk_jrb_agents_mpx_corporations_corporation_id",
                    column: x => x.corporation_id,
                    principalTable: "mpx_corporations",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "fk_jrb_agents_users_user_id",
                    column: x => x.user_id,
                    principalTable: "sec_users",
                    principalColumn: "id",
                    onDelete: ReferentialAction.SetNull);
                table.ForeignKey(
                    name: "fk_jrb_agents_workspaces_workspace_id",
                    column: x => x.workspace_id,
                    principalTable: "mpx_workspaces",
                    principalColumn: "id",
                    onDelete: ReferentialAction.SetNull);
            });

        migrationBuilder.CreateTable(
            name: "jrb_config",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                corporation_id = table.Column<Guid>(type: "uuid", nullable: true),
                workspace_id = table.Column<Guid>(type: "uuid", nullable: true),
                jarbass_agent_id = table.Column<Guid>(type: "uuid", nullable: true),
                is_singleton = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                morphus_server_url = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false, defaultValue: "https://api.morphus.one"),
                api_key_prefix = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: true),
                api_key_hash = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: true),
                api_key_encrypted = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                signing_secret_encrypted = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                is_paired = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                paired_at_utc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                api_key_revoked = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                api_key_expires_at_utc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                client_database_provider = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false, defaultValue: "PostgreSQL"),
                client_database_connection_string_encrypted = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                client_app_folder_path = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                kalupa_vault_folder_path = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                environment_mode = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false, defaultValue: "Server"),
                last_trusted_server_utc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                last_cpu_tick_anchor = table.Column<long>(type: "bigint", nullable: false, defaultValue: 0L),
                high_water_mark_utc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                last_chain_hash = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: true),
                last_synced_sequence_number = table.Column<long>(type: "bigint", nullable: false, defaultValue: 0L),
                max_allowed_clock_drift_seconds = table.Column<int>(type: "integer", nullable: false, defaultValue: 45),
                block_sync_on_clock_tampering = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                catalog_reflection_enabled = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                catalog_reflection_interval_seconds = table.Column<int>(type: "integer", nullable: false, defaultValue: 60),
                workflow_watcher_enabled = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                workflow_watcher_interval_seconds = table.Column<int>(type: "integer", nullable: false, defaultValue: 15),
                email_dispatcher_enabled = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                email_dispatcher_interval_seconds = table.Column<int>(type: "integer", nullable: false, defaultValue: 10),
                kalupa_sync_enabled = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                kalupa_sync_interval_seconds = table.Column<int>(type: "integer", nullable: false, defaultValue: 15),
                offline_sync_enabled = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                offline_sync_interval_seconds = table.Column<int>(type: "integer", nullable: false, defaultValue: 10),
                auto_heal_enabled = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                description = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false, defaultValue: ""),
                system = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                inactive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_jrb_config", x => x.id);
                table.ForeignKey(
                    name: "fk_jrb_config_jrb_agents_jarbass_agent_id",
                    column: x => x.jarbass_agent_id,
                    principalTable: "jrb_agents",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "fk_jrb_config_mpx_corporations_corporation_id",
                    column: x => x.corporation_id,
                    principalTable: "mpx_corporations",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "fk_jrb_config_workspaces_workspace_id",
                    column: x => x.workspace_id,
                    principalTable: "mpx_workspaces",
                    principalColumn: "id",
                    onDelete: ReferentialAction.SetNull);
            });

        migrationBuilder.CreateTable(
            name: "jrb_insights",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                corporation_id = table.Column<Guid>(type: "uuid", nullable: true),
                jarbass_agent_id = table.Column<Guid>(type: "uuid", nullable: true),
                entity_definition_id = table.Column<Guid>(type: "uuid", nullable: true),
                target_entity_id = table.Column<Guid>(type: "uuid", nullable: true),
                category = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: false, defaultValue: "Prevention"),
                severity = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false, defaultValue: "Info"),
                code = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                details = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                auto_healed = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                auto_heal_action = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                occurred_at_utc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                acknowledged = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                acknowledged_at_utc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                acknowledged_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                description = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false, defaultValue: ""),
                system = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                inactive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_jrb_insights", x => x.id);
                table.ForeignKey(
                    name: "fk_jrb_insights_jrb_agents_jarbass_agent_id",
                    column: x => x.jarbass_agent_id,
                    principalTable: "jrb_agents",
                    principalColumn: "id",
                    onDelete: ReferentialAction.SetNull);
                table.ForeignKey(
                    name: "fk_jrb_insights_mpx_corporations_corporation_id",
                    column: x => x.corporation_id,
                    principalTable: "mpx_corporations",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "fk_jrb_insights_mpx_entities_entity_definition_id",
                    column: x => x.entity_definition_id,
                    principalTable: "mpx_entities",
                    principalColumn: "id",
                    onDelete: ReferentialAction.SetNull);
                table.ForeignKey(
                    name: "fk_jrb_insights_users_acknowledged_by_user_id",
                    column: x => x.acknowledged_by_user_id,
                    principalTable: "sec_users",
                    principalColumn: "id",
                    onDelete: ReferentialAction.SetNull);
            });

        migrationBuilder.CreateTable(
            name: "jrb_jobs",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                corporation_id = table.Column<Guid>(type: "uuid", nullable: true),
                jarbass_agent_id = table.Column<Guid>(type: "uuid", nullable: true),
                code = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                category = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: false, defaultValue: "System"),
                interval_seconds = table.Column<int>(type: "integer", nullable: false, defaultValue: 60),
                enabled = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                last_run_status = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false, defaultValue: "Idle"),
                last_run_utc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                next_run_utc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                last_duration_ms = table.Column<long>(type: "bigint", nullable: true),
                total_runs = table.Column<long>(type: "bigint", nullable: false, defaultValue: 0L),
                total_failures = table.Column<long>(type: "bigint", nullable: false, defaultValue: 0L),
                last_error_message = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                description = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false, defaultValue: ""),
                system = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                inactive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_jrb_jobs", x => x.id);
                table.ForeignKey(
                    name: "fk_jrb_jobs_jrb_agents_jarbass_agent_id",
                    column: x => x.jarbass_agent_id,
                    principalTable: "jrb_agents",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "fk_jrb_jobs_mpx_corporations_corporation_id",
                    column: x => x.corporation_id,
                    principalTable: "mpx_corporations",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateTable(
            name: "jrb_protected_files",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                corporation_id = table.Column<Guid>(type: "uuid", nullable: true),
                workspace_id = table.Column<Guid>(type: "uuid", nullable: true),
                jarbass_agent_id = table.Column<Guid>(type: "uuid", nullable: true),
                current_holder_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                file_name = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                relative_vault_path = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                full_local_path = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                required_claim_key = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                permission_level = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false, defaultValue: "ReadOnly"),
                encryption_state = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false, defaultValue: "EncryptedAtRest"),
                plaintext_content_hash = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                encrypted_content_hash = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                file_key_encrypted = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                encrypted_backup_payload = table.Column<string>(type: "text", nullable: true),
                is_held_in_hand = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                lease_opened_at_utc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                lease_expires_at_utc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                force_close_requested = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                tamper_attempts_count = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                last_tamper_attempt_utc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                last_revoked_reason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                description = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false, defaultValue: ""),
                system = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                inactive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_jrb_protected_files", x => x.id);
                table.ForeignKey(
                    name: "fk_jrb_protected_files_jrb_agents_jarbass_agent_id",
                    column: x => x.jarbass_agent_id,
                    principalTable: "jrb_agents",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "fk_jrb_protected_files_mpx_corporations_corporation_id",
                    column: x => x.corporation_id,
                    principalTable: "mpx_corporations",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "fk_jrb_protected_files_users_current_holder_user_id",
                    column: x => x.current_holder_user_id,
                    principalTable: "sec_users",
                    principalColumn: "id",
                    onDelete: ReferentialAction.SetNull);
                table.ForeignKey(
                    name: "fk_jrb_protected_files_workspaces_workspace_id",
                    column: x => x.workspace_id,
                    principalTable: "mpx_workspaces",
                    principalColumn: "id",
                    onDelete: ReferentialAction.SetNull);
            });

        migrationBuilder.CreateTable(
            name: "jrb_sync_events",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                corporation_id = table.Column<Guid>(type: "uuid", nullable: true),
                jarbass_agent_id = table.Column<Guid>(type: "uuid", nullable: false),
                parent_sync_event_id = table.Column<Guid>(type: "uuid", nullable: true),
                user_id = table.Column<Guid>(type: "uuid", nullable: true),
                sequence_number = table.Column<long>(type: "bigint", nullable: false),
                transaction_group_id = table.Column<Guid>(type: "uuid", nullable: false),
                operation = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false, defaultValue: "Create"),
                entity_definition_id = table.Column<Guid>(type: "uuid", nullable: true),
                entity_name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                table_name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                target_entity_id = table.Column<Guid>(type: "uuid", nullable: false),
                target_entity_key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                unique_key_name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                unique_key_value = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: true),
                payload_json = table.Column<string>(type: "text", nullable: true),
                changed_fields_json = table.Column<string>(type: "text", nullable: true),
                ef_command_text = table.Column<string>(type: "text", nullable: true),
                ef_parameters_json = table.Column<string>(type: "text", nullable: true),
                machine_name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false, defaultValue: ""),
                environment_mode = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false, defaultValue: "Server"),
                execution_channel = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: false, defaultValue: "DirectEntity"),
                source_endpoint = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                ip_address = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: true),
                reported_device_utc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                trusted_occurred_at_utc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                execution_started_at_utc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                execution_completed_at_utc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                execution_duration_ms = table.Column<long>(type: "bigint", nullable: true),
                cpu_tick_at_event = table.Column<long>(type: "bigint", nullable: false, defaultValue: 0L),
                clock_tampered = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                clock_skew_seconds = table.Column<int>(type: "integer", nullable: true),
                executed = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                execution_succeeded = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                synced = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                rows_affected = table.Column<int>(type: "integer", nullable: true),
                retry_count = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                previous_hash = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: true),
                hash = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                sync_status = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false, defaultValue: "Pending"),
                synced_at_utc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                error_message = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                description = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false, defaultValue: ""),
                system = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                inactive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_jrb_sync_events", x => x.id);
                table.ForeignKey(
                    name: "fk_jrb_sync_events_jrb_agents_jarbass_agent_id",
                    column: x => x.jarbass_agent_id,
                    principalTable: "jrb_agents",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "fk_jrb_sync_events_jrb_sync_events_parent_sync_event_id",
                    column: x => x.parent_sync_event_id,
                    principalTable: "jrb_sync_events",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "fk_jrb_sync_events_mpx_corporations_corporation_id",
                    column: x => x.corporation_id,
                    principalTable: "mpx_corporations",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "fk_jrb_sync_events_mpx_entities_entity_definition_id",
                    column: x => x.entity_definition_id,
                    principalTable: "mpx_entities",
                    principalColumn: "id",
                    onDelete: ReferentialAction.SetNull);
                table.ForeignKey(
                    name: "fk_jrb_sync_events_users_user_id",
                    column: x => x.user_id,
                    principalTable: "sec_users",
                    principalColumn: "id",
                    onDelete: ReferentialAction.SetNull);
            });

        migrationBuilder.CreateTable(
            name: "jrb_workflow_watchers",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                corporation_id = table.Column<Guid>(type: "uuid", nullable: false),
                jarbass_agent_id = table.Column<Guid>(type: "uuid", nullable: true),
                parent_workflow_id = table.Column<Guid>(type: "uuid", nullable: false),
                split_group_id = table.Column<Guid>(type: "uuid", nullable: true),
                source_workflow_type_config_id = table.Column<Guid>(type: "uuid", nullable: true),
                join_workflow_type_config_id = table.Column<Guid>(type: "uuid", nullable: false),
                workflow_type_config_condition_id = table.Column<Guid>(type: "uuid", nullable: true),
                watcher_type = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false, defaultValue: "SplitJoinBarrier"),
                merge_mode = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false, defaultValue: "WaitAll"),
                expected_branches_count = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                completed_branches_count = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                failed_branches_count = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                hold_target_inactive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                poll_interval_seconds = table.Column<int>(type: "integer", nullable: false, defaultValue: 15),
                next_poll_at_utc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                last_polled_at_utc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                timeout_at_utc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                retry_count = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                max_retries = table.Column<int>(type: "integer", nullable: false, defaultValue: 3),
                watcher_status = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false, defaultValue: "Watching"),
                joined_at_utc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                effective_trusted_joined_at_utc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                completed_offline_on_time = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                blocking_branch_summary = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                description = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false, defaultValue: ""),
                system = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                inactive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_jrb_workflow_watchers", x => x.id);
                table.ForeignKey(
                    name: "fk_jrb_workflow_watchers_jrb_agents_jarbass_agent_id",
                    column: x => x.jarbass_agent_id,
                    principalTable: "jrb_agents",
                    principalColumn: "id",
                    onDelete: ReferentialAction.SetNull);
                table.ForeignKey(
                    name: "fk_jrb_workflow_watchers_mpx_corporations_corporation_id",
                    column: x => x.corporation_id,
                    principalTable: "mpx_corporations",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "fk_jrb_workflow_watchers_workflow_type_config_conditions_workf",
                    column: x => x.workflow_type_config_condition_id,
                    principalTable: "wkf_workflow_type_config_conditions",
                    principalColumn: "id",
                    onDelete: ReferentialAction.SetNull);
                table.ForeignKey(
                    name: "fk_jrb_workflow_watchers_workflow_type_configs_join_workflow_t",
                    column: x => x.join_workflow_type_config_id,
                    principalTable: "wkf_workflow_type_configs",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "fk_jrb_workflow_watchers_workflow_type_configs_source_workflow",
                    column: x => x.source_workflow_type_config_id,
                    principalTable: "wkf_workflow_type_configs",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "fk_jrb_workflow_watchers_workflows_parent_workflow_id",
                    column: x => x.parent_workflow_id,
                    principalTable: "wkf_workflows",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "jrb_conflict_alerts",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                corporation_id = table.Column<Guid>(type: "uuid", nullable: true),
                jarbass_sync_event_id = table.Column<Guid>(type: "uuid", nullable: false),
                rejected_jarbass_agent_id = table.Column<Guid>(type: "uuid", nullable: false),
                winner_jarbass_agent_id = table.Column<Guid>(type: "uuid", nullable: true),
                notify_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                entity_definition_id = table.Column<Guid>(type: "uuid", nullable: true),
                entity_name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                existing_entity_id = table.Column<Guid>(type: "uuid", nullable: false),
                rejected_entity_id = table.Column<Guid>(type: "uuid", nullable: false),
                unique_key_name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                unique_key_value = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                message = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                rejected_payload_json = table.Column<string>(type: "text", nullable: true),
                resolution_status = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false, defaultValue: "PendingUserAction"),
                detected_at_utc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                resolved_at_utc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                resolved_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                description = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false, defaultValue: ""),
                system = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                inactive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_jrb_conflict_alerts", x => x.id);
                table.ForeignKey(
                    name: "fk_jrb_conflict_alerts_jarbass_sync_events_jarbass_sync_event_",
                    column: x => x.jarbass_sync_event_id,
                    principalTable: "jrb_sync_events",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "fk_jrb_conflict_alerts_jrb_agents_rejected_jarbass_agent_id",
                    column: x => x.rejected_jarbass_agent_id,
                    principalTable: "jrb_agents",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "fk_jrb_conflict_alerts_jrb_agents_winner_jarbass_agent_id",
                    column: x => x.winner_jarbass_agent_id,
                    principalTable: "jrb_agents",
                    principalColumn: "id",
                    onDelete: ReferentialAction.SetNull);
                table.ForeignKey(
                    name: "fk_jrb_conflict_alerts_mpx_corporations_corporation_id",
                    column: x => x.corporation_id,
                    principalTable: "mpx_corporations",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "fk_jrb_conflict_alerts_mpx_entities_entity_definition_id",
                    column: x => x.entity_definition_id,
                    principalTable: "mpx_entities",
                    principalColumn: "id",
                    onDelete: ReferentialAction.SetNull);
                table.ForeignKey(
                    name: "fk_jrb_conflict_alerts_users_notify_user_id",
                    column: x => x.notify_user_id,
                    principalTable: "sec_users",
                    principalColumn: "id",
                    onDelete: ReferentialAction.SetNull);
                table.ForeignKey(
                    name: "fk_jrb_conflict_alerts_users_resolved_by_user_id",
                    column: x => x.resolved_by_user_id,
                    principalTable: "sec_users",
                    principalColumn: "id",
                    onDelete: ReferentialAction.SetNull);
            });

        migrationBuilder.CreateTable(
            name: "mpx_notifications",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                corporation_id = table.Column<Guid>(type: "uuid", nullable: true),
                workspace_id = table.Column<Guid>(type: "uuid", nullable: true),
                application_id = table.Column<Guid>(type: "uuid", nullable: true),
                created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                jarbass_agent_id = table.Column<Guid>(type: "uuid", nullable: true),
                entity_definition_id = table.Column<Guid>(type: "uuid", nullable: true),
                target_entity_id = table.Column<Guid>(type: "uuid", nullable: true),
                workflow_id = table.Column<Guid>(type: "uuid", nullable: true),
                workflow_task_id = table.Column<Guid>(type: "uuid", nullable: true),
                jarbass_conflict_alert_id = table.Column<Guid>(type: "uuid", nullable: true),
                jarbass_insight_id = table.Column<Guid>(type: "uuid", nullable: true),
                source_module = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: false, defaultValue: "Jarbass"),
                category = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: false, defaultValue: "System"),
                severity = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false, defaultValue: "Info"),
                title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                message = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                action_label = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                action_url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                payload_json = table.Column<string>(type: "text", nullable: true),
                icon = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                color = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                created_at_utc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                expires_at_utc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                description = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false, defaultValue: ""),
                system = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                inactive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_mpx_notifications", x => x.id);
                table.ForeignKey(
                    name: "fk_mpx_notifications_jrb_agents_jarbass_agent_id",
                    column: x => x.jarbass_agent_id,
                    principalTable: "jrb_agents",
                    principalColumn: "id",
                    onDelete: ReferentialAction.SetNull);
                table.ForeignKey(
                    name: "fk_mpx_notifications_jrb_conflict_alerts_jarbass_conflict_aler",
                    column: x => x.jarbass_conflict_alert_id,
                    principalTable: "jrb_conflict_alerts",
                    principalColumn: "id",
                    onDelete: ReferentialAction.SetNull);
                table.ForeignKey(
                    name: "fk_mpx_notifications_jrb_insights_jarbass_insight_id",
                    column: x => x.jarbass_insight_id,
                    principalTable: "jrb_insights",
                    principalColumn: "id",
                    onDelete: ReferentialAction.SetNull);
                table.ForeignKey(
                    name: "fk_mpx_notifications_mpx_applications_application_id",
                    column: x => x.application_id,
                    principalTable: "mpx_applications",
                    principalColumn: "id",
                    onDelete: ReferentialAction.SetNull);
                table.ForeignKey(
                    name: "fk_mpx_notifications_mpx_corporations_corporation_id",
                    column: x => x.corporation_id,
                    principalTable: "mpx_corporations",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "fk_mpx_notifications_mpx_entities_entity_definition_id",
                    column: x => x.entity_definition_id,
                    principalTable: "mpx_entities",
                    principalColumn: "id",
                    onDelete: ReferentialAction.SetNull);
                table.ForeignKey(
                    name: "fk_mpx_notifications_users_created_by_user_id",
                    column: x => x.created_by_user_id,
                    principalTable: "sec_users",
                    principalColumn: "id",
                    onDelete: ReferentialAction.SetNull);
                table.ForeignKey(
                    name: "fk_mpx_notifications_workflow_tasks_workflow_task_id",
                    column: x => x.workflow_task_id,
                    principalTable: "wkf_workflow_tasks",
                    principalColumn: "id",
                    onDelete: ReferentialAction.SetNull);
                table.ForeignKey(
                    name: "fk_mpx_notifications_workflows_workflow_id",
                    column: x => x.workflow_id,
                    principalTable: "wkf_workflows",
                    principalColumn: "id",
                    onDelete: ReferentialAction.SetNull);
                table.ForeignKey(
                    name: "fk_mpx_notifications_workspaces_workspace_id",
                    column: x => x.workspace_id,
                    principalTable: "mpx_workspaces",
                    principalColumn: "id",
                    onDelete: ReferentialAction.SetNull);
            });

        migrationBuilder.CreateTable(
            name: "mpx_user_notifications",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                corporation_id = table.Column<Guid>(type: "uuid", nullable: true),
                notification_id = table.Column<Guid>(type: "uuid", nullable: false),
                user_id = table.Column<Guid>(type: "uuid", nullable: false),
                read = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                read_at_utc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                acknowledged = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                acknowledged_at_utc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                dismissed = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                dismissed_at_utc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                pinned = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                delivered_in_app = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                delivered_via_email = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                created_at_utc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                description = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false, defaultValue: ""),
                system = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                inactive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_mpx_user_notifications", x => x.id);
                table.ForeignKey(
                    name: "fk_mpx_user_notifications_mpx_corporations_corporation_id",
                    column: x => x.corporation_id,
                    principalTable: "mpx_corporations",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "fk_mpx_user_notifications_mpx_notifications_notification_id",
                    column: x => x.notification_id,
                    principalTable: "mpx_notifications",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "fk_mpx_user_notifications_sec_users_user_id",
                    column: x => x.user_id,
                    principalTable: "sec_users",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflows_join_target_config_id",
            table: "wkf_workflows",
            column: "join_target_config_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflows_parent_workflow_id_split_group_id",
            table: "wkf_workflows",
            columns: new[] { "parent_workflow_id", "split_group_id" });

        migrationBuilder.CreateIndex(
            name: "ix_jrb_agents_corporation_id_machine_name",
            table: "jrb_agents",
            columns: new[] { "corporation_id", "machine_name" });

        migrationBuilder.CreateIndex(
            name: "ix_jrb_agents_key",
            table: "jrb_agents",
            column: "key",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_jrb_agents_user_id",
            table: "jrb_agents",
            column: "user_id");

        migrationBuilder.CreateIndex(
            name: "ix_jrb_agents_workspace_id",
            table: "jrb_agents",
            column: "workspace_id");

        migrationBuilder.CreateIndex(
            name: "ix_jrb_config_corporation_id_jarbass_agent_id",
            table: "jrb_config",
            columns: new[] { "corporation_id", "jarbass_agent_id" },
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_jrb_config_jarbass_agent_id",
            table: "jrb_config",
            column: "jarbass_agent_id");

        migrationBuilder.CreateIndex(
            name: "ix_jrb_config_key",
            table: "jrb_config",
            column: "key",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_jrb_config_workspace_id",
            table: "jrb_config",
            column: "workspace_id");

        migrationBuilder.CreateIndex(
            name: "ix_jrb_conflict_alerts_corporation_id_resolution_status",
            table: "jrb_conflict_alerts",
            columns: new[] { "corporation_id", "resolution_status" });

        migrationBuilder.CreateIndex(
            name: "ix_jrb_conflict_alerts_entity_definition_id",
            table: "jrb_conflict_alerts",
            column: "entity_definition_id");

        migrationBuilder.CreateIndex(
            name: "ix_jrb_conflict_alerts_jarbass_sync_event_id",
            table: "jrb_conflict_alerts",
            column: "jarbass_sync_event_id");

        migrationBuilder.CreateIndex(
            name: "ix_jrb_conflict_alerts_key",
            table: "jrb_conflict_alerts",
            column: "key",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_jrb_conflict_alerts_notify_user_id_resolution_status",
            table: "jrb_conflict_alerts",
            columns: new[] { "notify_user_id", "resolution_status" });

        migrationBuilder.CreateIndex(
            name: "ix_jrb_conflict_alerts_rejected_jarbass_agent_id",
            table: "jrb_conflict_alerts",
            column: "rejected_jarbass_agent_id");

        migrationBuilder.CreateIndex(
            name: "ix_jrb_conflict_alerts_resolved_by_user_id",
            table: "jrb_conflict_alerts",
            column: "resolved_by_user_id");

        migrationBuilder.CreateIndex(
            name: "ix_jrb_conflict_alerts_winner_jarbass_agent_id",
            table: "jrb_conflict_alerts",
            column: "winner_jarbass_agent_id");

        migrationBuilder.CreateIndex(
            name: "ix_jrb_insights_acknowledged_by_user_id",
            table: "jrb_insights",
            column: "acknowledged_by_user_id");

        migrationBuilder.CreateIndex(
            name: "ix_jrb_insights_corporation_id_acknowledged_occurred_at_utc",
            table: "jrb_insights",
            columns: new[] { "corporation_id", "acknowledged", "occurred_at_utc" });

        migrationBuilder.CreateIndex(
            name: "ix_jrb_insights_entity_definition_id",
            table: "jrb_insights",
            column: "entity_definition_id");

        migrationBuilder.CreateIndex(
            name: "ix_jrb_insights_jarbass_agent_id",
            table: "jrb_insights",
            column: "jarbass_agent_id");

        migrationBuilder.CreateIndex(
            name: "ix_jrb_insights_key",
            table: "jrb_insights",
            column: "key",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_jrb_jobs_corporation_id",
            table: "jrb_jobs",
            column: "corporation_id");

        migrationBuilder.CreateIndex(
            name: "ix_jrb_jobs_jarbass_agent_id_code",
            table: "jrb_jobs",
            columns: new[] { "jarbass_agent_id", "code" },
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_jrb_jobs_key",
            table: "jrb_jobs",
            column: "key",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_jrb_protected_files_corporation_id",
            table: "jrb_protected_files",
            column: "corporation_id");

        migrationBuilder.CreateIndex(
            name: "ix_jrb_protected_files_current_holder_user_id",
            table: "jrb_protected_files",
            column: "current_holder_user_id");

        migrationBuilder.CreateIndex(
            name: "ix_jrb_protected_files_is_held_in_hand_lease_expires_at_utc",
            table: "jrb_protected_files",
            columns: new[] { "is_held_in_hand", "lease_expires_at_utc" });

        migrationBuilder.CreateIndex(
            name: "ix_jrb_protected_files_jarbass_agent_id_relative_vault_path",
            table: "jrb_protected_files",
            columns: new[] { "jarbass_agent_id", "relative_vault_path" },
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_jrb_protected_files_key",
            table: "jrb_protected_files",
            column: "key",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_jrb_protected_files_workspace_id",
            table: "jrb_protected_files",
            column: "workspace_id");

        migrationBuilder.CreateIndex(
            name: "ix_jrb_sync_events_corporation_id",
            table: "jrb_sync_events",
            column: "corporation_id");

        migrationBuilder.CreateIndex(
            name: "ix_jrb_sync_events_entity_definition_id",
            table: "jrb_sync_events",
            column: "entity_definition_id");

        migrationBuilder.CreateIndex(
            name: "ix_jrb_sync_events_jarbass_agent_id_sequence_number",
            table: "jrb_sync_events",
            columns: new[] { "jarbass_agent_id", "sequence_number" },
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_jrb_sync_events_key",
            table: "jrb_sync_events",
            column: "key",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_jrb_sync_events_parent_sync_event_id",
            table: "jrb_sync_events",
            column: "parent_sync_event_id");

        migrationBuilder.CreateIndex(
            name: "ix_jrb_sync_events_sync_status_trusted_occurred_at_utc",
            table: "jrb_sync_events",
            columns: new[] { "sync_status", "trusted_occurred_at_utc" });

        migrationBuilder.CreateIndex(
            name: "ix_jrb_sync_events_synced_sequence_number",
            table: "jrb_sync_events",
            columns: new[] { "synced", "sequence_number" });

        migrationBuilder.CreateIndex(
            name: "ix_jrb_sync_events_user_id",
            table: "jrb_sync_events",
            column: "user_id");

        migrationBuilder.CreateIndex(
            name: "ix_jrb_workflow_watchers_corporation_id",
            table: "jrb_workflow_watchers",
            column: "corporation_id");

        migrationBuilder.CreateIndex(
            name: "ix_jrb_workflow_watchers_jarbass_agent_id",
            table: "jrb_workflow_watchers",
            column: "jarbass_agent_id");

        migrationBuilder.CreateIndex(
            name: "ix_jrb_workflow_watchers_join_workflow_type_config_id",
            table: "jrb_workflow_watchers",
            column: "join_workflow_type_config_id");

        migrationBuilder.CreateIndex(
            name: "ix_jrb_workflow_watchers_key",
            table: "jrb_workflow_watchers",
            column: "key",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_jrb_workflow_watchers_parent_workflow_id_split_group_id",
            table: "jrb_workflow_watchers",
            columns: new[] { "parent_workflow_id", "split_group_id" });

        migrationBuilder.CreateIndex(
            name: "ix_jrb_workflow_watchers_source_workflow_type_config_id",
            table: "jrb_workflow_watchers",
            column: "source_workflow_type_config_id");

        migrationBuilder.CreateIndex(
            name: "ix_jrb_workflow_watchers_watcher_status_next_poll_at_utc",
            table: "jrb_workflow_watchers",
            columns: new[] { "watcher_status", "next_poll_at_utc" });

        migrationBuilder.CreateIndex(
            name: "ix_jrb_workflow_watchers_workflow_type_config_condition_id",
            table: "jrb_workflow_watchers",
            column: "workflow_type_config_condition_id");

        migrationBuilder.CreateIndex(
            name: "ix_mpx_notifications_application_id",
            table: "mpx_notifications",
            column: "application_id");

        migrationBuilder.CreateIndex(
            name: "ix_mpx_notifications_corporation_id_source_module_created_at_u",
            table: "mpx_notifications",
            columns: new[] { "corporation_id", "source_module", "created_at_utc" });

        migrationBuilder.CreateIndex(
            name: "ix_mpx_notifications_created_by_user_id",
            table: "mpx_notifications",
            column: "created_by_user_id");

        migrationBuilder.CreateIndex(
            name: "ix_mpx_notifications_entity_definition_id",
            table: "mpx_notifications",
            column: "entity_definition_id");

        migrationBuilder.CreateIndex(
            name: "ix_mpx_notifications_jarbass_agent_id",
            table: "mpx_notifications",
            column: "jarbass_agent_id");

        migrationBuilder.CreateIndex(
            name: "ix_mpx_notifications_jarbass_conflict_alert_id",
            table: "mpx_notifications",
            column: "jarbass_conflict_alert_id");

        migrationBuilder.CreateIndex(
            name: "ix_mpx_notifications_jarbass_insight_id",
            table: "mpx_notifications",
            column: "jarbass_insight_id");

        migrationBuilder.CreateIndex(
            name: "ix_mpx_notifications_key",
            table: "mpx_notifications",
            column: "key",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_mpx_notifications_workflow_id",
            table: "mpx_notifications",
            column: "workflow_id");

        migrationBuilder.CreateIndex(
            name: "ix_mpx_notifications_workflow_task_id",
            table: "mpx_notifications",
            column: "workflow_task_id");

        migrationBuilder.CreateIndex(
            name: "ix_mpx_notifications_workspace_id",
            table: "mpx_notifications",
            column: "workspace_id");

        migrationBuilder.CreateIndex(
            name: "ix_mpx_user_notifications_corporation_id",
            table: "mpx_user_notifications",
            column: "corporation_id");

        migrationBuilder.CreateIndex(
            name: "ix_mpx_user_notifications_key",
            table: "mpx_user_notifications",
            column: "key",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_mpx_user_notifications_notification_id_user_id",
            table: "mpx_user_notifications",
            columns: new[] { "notification_id", "user_id" },
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_mpx_user_notifications_user_id_read_dismissed_created_at_utc",
            table: "mpx_user_notifications",
            columns: new[] { "user_id", "read", "dismissed", "created_at_utc" });

        migrationBuilder.AddForeignKey(
            name: "fk_wkf_workflows_workflow_type_configs_join_target_config_id",
            table: "wkf_workflows",
            column: "join_target_config_id",
            principalTable: "wkf_workflow_type_configs",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "fk_wkf_workflows_workflow_type_configs_join_target_config_id",
            table: "wkf_workflows");

        migrationBuilder.DropTable(
            name: "jrb_config");

        migrationBuilder.DropTable(
            name: "jrb_jobs");

        migrationBuilder.DropTable(
            name: "jrb_protected_files");

        migrationBuilder.DropTable(
            name: "jrb_workflow_watchers");

        migrationBuilder.DropTable(
            name: "mpx_user_notifications");

        migrationBuilder.DropTable(
            name: "mpx_notifications");

        migrationBuilder.DropTable(
            name: "jrb_conflict_alerts");

        migrationBuilder.DropTable(
            name: "jrb_insights");

        migrationBuilder.DropTable(
            name: "jrb_sync_events");

        migrationBuilder.DropTable(
            name: "jrb_agents");

        migrationBuilder.DropIndex(
            name: "ix_wkf_workflows_join_target_config_id",
            table: "wkf_workflows");

        migrationBuilder.DropIndex(
            name: "ix_wkf_workflows_parent_workflow_id_split_group_id",
            table: "wkf_workflows");

        migrationBuilder.DropColumn(
            name: "completed_split_branches",
            table: "wkf_workflows");

        migrationBuilder.DropColumn(
            name: "expected_split_branches",
            table: "wkf_workflows");

        migrationBuilder.DropColumn(
            name: "join_target_config_id",
            table: "wkf_workflows");

        migrationBuilder.DropColumn(
            name: "split_group_id",
            table: "wkf_workflows");

        migrationBuilder.DropColumn(
            name: "waiting_for_split_join",
            table: "wkf_workflows");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflows_parent_workflow_id",
            table: "wkf_workflows",
            column: "parent_workflow_id");
    }
}
