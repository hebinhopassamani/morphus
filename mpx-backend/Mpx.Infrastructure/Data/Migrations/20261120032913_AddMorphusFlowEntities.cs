using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Mpx.Infrastructure.Data.Migrations;

/// <inheritdoc />
public partial class _20261120032913_AddMorphusFlowEntities : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "email",
            table: "sec_roles",
            type: "character varying(150)",
            maxLength: 150,
            nullable: true);

        migrationBuilder.CreateTable(
            name: "mpx_file_types",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                extension = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                mime_type = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                category = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: false, defaultValue: "Document"),
                max_size_in_mb = table.Column<int>(type: "integer", nullable: false, defaultValue: 10),
                corporation_id = table.Column<Guid>(type: "uuid", nullable: false),
                icon = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                description = table.Column<string>(type: "text", nullable: true),
                key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false, defaultValue: ""),
                system = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                inactive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_mpx_file_types", x => x.id);
                table.ForeignKey(
                    name: "fk_mpx_file_types_mpx_corporations_corporation_id",
                    column: x => x.corporation_id,
                    principalTable: "mpx_corporations",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateTable(
            name: "wkf_stations",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                code = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                corporation_id = table.Column<Guid>(type: "uuid", nullable: false),
                has_layout = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                default_layout_html = table.Column<string>(type: "text", nullable: true),
                process_handler_key = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                icon = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                color = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                description = table.Column<string>(type: "text", nullable: true),
                key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false, defaultValue: ""),
                system = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                inactive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_wkf_stations", x => x.id);
                table.ForeignKey(
                    name: "fk_wkf_stations_mpx_corporations_corporation_id",
                    column: x => x.corporation_id,
                    principalTable: "mpx_corporations",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateTable(
            name: "wkf_workflow_types",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                corporation_id = table.Column<Guid>(type: "uuid", nullable: false),
                workspace_id = table.Column<Guid>(type: "uuid", nullable: true),
                application_id = table.Column<Guid>(type: "uuid", nullable: true),
                module_id = table.Column<Guid>(type: "uuid", nullable: true),
                sub_module_id = table.Column<Guid>(type: "uuid", nullable: true),
                entity_name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                trigger_type = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: false, defaultValue: "Manual"),
                viewport_x = table.Column<double>(type: "double precision", nullable: false, defaultValue: 0.0),
                viewport_y = table.Column<double>(type: "double precision", nullable: false, defaultValue: 0.0),
                viewport_zoom = table.Column<double>(type: "double precision", nullable: false, defaultValue: 1.0),
                icon = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                color = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                description = table.Column<string>(type: "text", nullable: true),
                key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false, defaultValue: ""),
                system = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                inactive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_wkf_workflow_types", x => x.id);
                table.ForeignKey(
                    name: "fk_wkf_workflow_types_mpx_applications_application_id",
                    column: x => x.application_id,
                    principalTable: "mpx_applications",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "fk_wkf_workflow_types_mpx_corporations_corporation_id",
                    column: x => x.corporation_id,
                    principalTable: "mpx_corporations",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "fk_wkf_workflow_types_sec_modules_module_id",
                    column: x => x.module_id,
                    principalTable: "sec_modules",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "fk_wkf_workflow_types_sec_sub_modules_sub_module_id",
                    column: x => x.sub_module_id,
                    principalTable: "sec_sub_modules",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "fk_wkf_workflow_types_workspaces_workspace_id",
                    column: x => x.workspace_id,
                    principalTable: "mpx_workspaces",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateTable(
            name: "wkf_workflow_type_configs",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                corporation_id = table.Column<Guid>(type: "uuid", nullable: false),
                workflow_type_id = table.Column<Guid>(type: "uuid", nullable: false),
                station_id = table.Column<Guid>(type: "uuid", nullable: false),
                order = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                position_x = table.Column<double>(type: "double precision", nullable: false, defaultValue: 0.0),
                position_y = table.Column<double>(type: "double precision", nullable: false, defaultValue: 0.0),
                width = table.Column<double>(type: "double precision", nullable: true),
                height = table.Column<double>(type: "double precision", nullable: true),
                has_layout = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                custom_layout_html = table.Column<string>(type: "text", nullable: true),
                assignment_mode = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false, defaultValue: "GroupQueue"),
                max_owners = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                max_tasks_per_user = table.Column<int>(type: "integer", nullable: true),
                quorum_percentage = table.Column<double>(type: "double precision", nullable: true),
                quorum_min_votes = table.Column<int>(type: "integer", nullable: true),
                auto_advance_on_quorum_reached = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                has_rapporteur = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                requires_rapporteur_first = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                rapporteur_tie_breaker = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                sla_minutes = table.Column<int>(type: "integer", nullable: true),
                hold_inactive_until_approved = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                icon = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                color = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                description = table.Column<string>(type: "text", nullable: true),
                key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false, defaultValue: ""),
                system = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                inactive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_wkf_workflow_type_configs", x => x.id);
                table.ForeignKey(
                    name: "fk_wkf_workflow_type_configs_mpx_corporations_corporation_id",
                    column: x => x.corporation_id,
                    principalTable: "mpx_corporations",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "fk_wkf_workflow_type_configs_wkf_stations_station_id",
                    column: x => x.station_id,
                    principalTable: "wkf_stations",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "fk_wkf_workflow_type_configs_workflow_types_workflow_type_id",
                    column: x => x.workflow_type_id,
                    principalTable: "wkf_workflow_types",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "wkf_workflow_type_config_actions",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                label = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                control_type = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false, defaultValue: "Button"),
                execute_when = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false, defaultValue: "ButtonClick"),
                corporation_id = table.Column<Guid>(type: "uuid", nullable: false),
                workflow_type_config_id = table.Column<Guid>(type: "uuid", nullable: false),
                next_workflow_type_config_id = table.Column<Guid>(type: "uuid", nullable: true),
                is_automatic = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                auto_execute_after_minutes = table.Column<int>(type: "integer", nullable: true),
                auto_execute_on_sla_breach = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                requires_opinion = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                opinion_min_length = table.Column<int>(type: "integer", nullable: true),
                allows_attachments = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                requires_attachments = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                min_attachments = table.Column<int>(type: "integer", nullable: true),
                max_attachments = table.Column<int>(type: "integer", nullable: true),
                order = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                icon = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                color = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                custom_css = table.Column<string>(type: "text", nullable: true),
                description = table.Column<string>(type: "text", nullable: true),
                key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false, defaultValue: ""),
                system = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                inactive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_wkf_workflow_type_config_actions", x => x.id);
                table.ForeignKey(
                    name: "fk_wkf_workflow_type_config_actions_mpx_corporations_corporati",
                    column: x => x.corporation_id,
                    principalTable: "mpx_corporations",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "fk_wkf_workflow_type_config_actions_workflow_type_configs_next",
                    column: x => x.next_workflow_type_config_id,
                    principalTable: "wkf_workflow_type_configs",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "fk_wkf_workflow_type_config_actions_workflow_type_configs_work",
                    column: x => x.workflow_type_config_id,
                    principalTable: "wkf_workflow_type_configs",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "wkf_workflow_type_config_conditions",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                corporation_id = table.Column<Guid>(type: "uuid", nullable: false),
                workflow_type_config_id = table.Column<Guid>(type: "uuid", nullable: false),
                condition_type = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false, defaultValue: "If"),
                next_workflow_type_config_id = table.Column<Guid>(type: "uuid", nullable: false),
                else_next_workflow_type_config_id = table.Column<Guid>(type: "uuid", nullable: true),
                open_parenthesis = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                property_name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                data_type = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false, defaultValue: "text"),
                @operator = table.Column<string>(name: "operator", type: "character varying(40)", maxLength: 40, nullable: false),
                value = table.Column<string>(type: "text", nullable: true),
                close_parenthesis = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                and_or = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                where_clause = table.Column<string>(type: "text", nullable: true),
                collection_property_name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                max_iterations = table.Column<int>(type: "integer", nullable: true),
                merge_mode = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: true),
                poll_interval_seconds = table.Column<int>(type: "integer", nullable: true),
                timeout_minutes = table.Column<int>(type: "integer", nullable: true),
                max_retries = table.Column<int>(type: "integer", nullable: true),
                retry_interval_seconds = table.Column<int>(type: "integer", nullable: true),
                split_into_child_workflows = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                wait_child_workflows_complete = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                is_critical_check = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                hold_target_inactive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                order = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                description = table.Column<string>(type: "text", nullable: true),
                key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false, defaultValue: ""),
                system = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                inactive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_wkf_workflow_type_config_conditions", x => x.id);
                table.ForeignKey(
                    name: "fk_wkf_workflow_type_config_conditions_mpx_corporations_corpor",
                    column: x => x.corporation_id,
                    principalTable: "mpx_corporations",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "fk_wkf_workflow_type_config_conditions_workflow_type_configs_e",
                    column: x => x.else_next_workflow_type_config_id,
                    principalTable: "wkf_workflow_type_configs",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "fk_wkf_workflow_type_config_conditions_workflow_type_configs_n",
                    column: x => x.next_workflow_type_config_id,
                    principalTable: "wkf_workflow_type_configs",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "fk_wkf_workflow_type_config_conditions_workflow_type_configs_w",
                    column: x => x.workflow_type_config_id,
                    principalTable: "wkf_workflow_type_configs",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "wkf_workflow_type_config_fields",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                corporation_id = table.Column<Guid>(type: "uuid", nullable: false),
                workflow_type_config_id = table.Column<Guid>(type: "uuid", nullable: false),
                is_entity_property = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                entity_name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                entity_alias = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                is_collection = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                property_name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                label = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                placeholder = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                data_type = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false, defaultValue: "text"),
                control_type = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false, defaultValue: "Input"),
                options_json = table.Column<string>(type: "text", nullable: true),
                mask = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                default_value = table.Column<string>(type: "text", nullable: true),
                is_visible = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                is_editable = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                is_required = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                min_length = table.Column<int>(type: "integer", nullable: true),
                max_length = table.Column<int>(type: "integer", nullable: true),
                min_value = table.Column<decimal>(type: "numeric(18,4)", nullable: true),
                max_value = table.Column<decimal>(type: "numeric(18,4)", nullable: true),
                regex_pattern = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                grid_span = table.Column<int>(type: "integer", nullable: false, defaultValue: 12),
                order = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                custom_css = table.Column<string>(type: "text", nullable: true),
                help_text = table.Column<string>(type: "text", nullable: true),
                key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false, defaultValue: ""),
                system = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                inactive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_wkf_workflow_type_config_fields", x => x.id);
                table.ForeignKey(
                    name: "fk_wkf_workflow_type_config_fields_mpx_corporations_corporatio",
                    column: x => x.corporation_id,
                    principalTable: "mpx_corporations",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "fk_wkf_workflow_type_config_fields_wkf_workflow_type_configs_w",
                    column: x => x.workflow_type_config_id,
                    principalTable: "wkf_workflow_type_configs",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "wkf_workflow_type_config_slas",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                corporation_id = table.Column<Guid>(type: "uuid", nullable: false),
                workflow_type_config_id = table.Column<Guid>(type: "uuid", nullable: false),
                severity = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false, defaultValue: "warning"),
                color = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false, defaultValue: "amber"),
                percentage = table.Column<int>(type: "integer", nullable: false),
                repeat_interval_minutes = table.Column<int>(type: "integer", nullable: true),
                order = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                description = table.Column<string>(type: "text", nullable: true),
                key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false, defaultValue: ""),
                system = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                inactive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_wkf_workflow_type_config_slas", x => x.id);
                table.ForeignKey(
                    name: "fk_wkf_workflow_type_config_slas_mpx_corporations_corporation_",
                    column: x => x.corporation_id,
                    principalTable: "mpx_corporations",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "fk_wkf_workflow_type_config_slas_wkf_workflow_type_configs_wor",
                    column: x => x.workflow_type_config_id,
                    principalTable: "wkf_workflow_type_configs",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "wkf_workflow_type_config_action_file_types",
            columns: table => new
            {
                workflow_type_config_action_id = table.Column<Guid>(type: "uuid", nullable: false),
                file_type_id = table.Column<Guid>(type: "uuid", nullable: false),
                corporation_id = table.Column<Guid>(type: "uuid", nullable: false),
                system = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                inactive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_wkf_workflow_type_config_action_file_types", x => new { x.workflow_type_config_action_id, x.file_type_id });
                table.ForeignKey(
                    name: "fk_wkf_workflow_type_config_action_file_types_mpx_corporations",
                    column: x => x.corporation_id,
                    principalTable: "mpx_corporations",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "fk_wkf_workflow_type_config_action_file_types_mpx_file_types_f",
                    column: x => x.file_type_id,
                    principalTable: "mpx_file_types",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "fk_wkf_workflow_type_config_action_file_types_wkf_workflow_typ",
                    column: x => x.workflow_type_config_action_id,
                    principalTable: "wkf_workflow_type_config_actions",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "wkf_workflow_type_config_validations",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                corporation_id = table.Column<Guid>(type: "uuid", nullable: false),
                workflow_type_config_id = table.Column<Guid>(type: "uuid", nullable: false),
                workflow_type_config_action_id = table.Column<Guid>(type: "uuid", nullable: true),
                validation_type = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false, defaultValue: "FilterRule"),
                preset_validator_key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                entity_name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                entity_alias = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                open_parenthesis = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                property_name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                data_type = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false, defaultValue: "text"),
                @operator = table.Column<string>(name: "operator", type: "character varying(40)", maxLength: 40, nullable: true),
                value = table.Column<string>(type: "text", nullable: true),
                close_parenthesis = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                and_or = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                where_clause = table.Column<string>(type: "text", nullable: true),
                regex_pattern = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                severity = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "Error"),
                error_message = table.Column<string>(type: "character varying(400)", maxLength: 400, nullable: false),
                order = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false, defaultValue: ""),
                system = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                inactive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_wkf_workflow_type_config_validations", x => x.id);
                table.ForeignKey(
                    name: "fk_wkf_workflow_type_config_validations_mpx_corporations_corpo",
                    column: x => x.corporation_id,
                    principalTable: "mpx_corporations",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "fk_wkf_workflow_type_config_validations_wkf_workflow_type_conf",
                    column: x => x.workflow_type_config_action_id,
                    principalTable: "wkf_workflow_type_config_actions",
                    principalColumn: "id",
                    onDelete: ReferentialAction.SetNull);
                table.ForeignKey(
                    name: "fk_wkf_workflow_type_config_validations_wkf_workflow_type_conf1",
                    column: x => x.workflow_type_config_id,
                    principalTable: "wkf_workflow_type_configs",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "wkf_workflows",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                corporation_id = table.Column<Guid>(type: "uuid", nullable: false),
                workflow_type_id = table.Column<Guid>(type: "uuid", nullable: false),
                protocol = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: false),
                parent_workflow_id = table.Column<Guid>(type: "uuid", nullable: true),
                from_workflow_type_config_id = table.Column<Guid>(type: "uuid", nullable: true),
                to_workflow_type_config_id = table.Column<Guid>(type: "uuid", nullable: false),
                workflow_type_config_action_id = table.Column<Guid>(type: "uuid", nullable: true),
                workflow_type_config_condition_id = table.Column<Guid>(type: "uuid", nullable: true),
                executed_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                executed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                opinion = table.Column<string>(type: "text", nullable: true),
                ip_address = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: true),
                user_agent = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                status = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false, defaultValue: "Running"),
                is_current_step = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false, defaultValue: ""),
                system = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                inactive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_wkf_workflows", x => x.id);
                table.ForeignKey(
                    name: "fk_wkf_workflows_mpx_corporations_corporation_id",
                    column: x => x.corporation_id,
                    principalTable: "mpx_corporations",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "fk_wkf_workflows_sec_users_executed_by_user_id",
                    column: x => x.executed_by_user_id,
                    principalTable: "sec_users",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "fk_wkf_workflows_wkf_workflows_parent_workflow_id",
                    column: x => x.parent_workflow_id,
                    principalTable: "wkf_workflows",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "fk_wkf_workflows_workflow_type_config_actions_workflow_type_co",
                    column: x => x.workflow_type_config_action_id,
                    principalTable: "wkf_workflow_type_config_actions",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "fk_wkf_workflows_workflow_type_config_conditions_workflow_type",
                    column: x => x.workflow_type_config_condition_id,
                    principalTable: "wkf_workflow_type_config_conditions",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "fk_wkf_workflows_workflow_type_configs_from_workflow_type_conf",
                    column: x => x.from_workflow_type_config_id,
                    principalTable: "wkf_workflow_type_configs",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "fk_wkf_workflows_workflow_type_configs_to_workflow_type_config",
                    column: x => x.to_workflow_type_config_id,
                    principalTable: "wkf_workflow_type_configs",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "fk_wkf_workflows_workflow_types_workflow_type_id",
                    column: x => x.workflow_type_id,
                    principalTable: "wkf_workflow_types",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateTable(
            name: "wkf_workflow_permissions",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                corporation_id = table.Column<Guid>(type: "uuid", nullable: false),
                workflow_type_id = table.Column<Guid>(type: "uuid", nullable: false),
                workflow_type_config_id = table.Column<Guid>(type: "uuid", nullable: true),
                workflow_type_config_action_id = table.Column<Guid>(type: "uuid", nullable: true),
                workflow_type_config_field_id = table.Column<Guid>(type: "uuid", nullable: true),
                workspace_id = table.Column<Guid>(type: "uuid", nullable: true),
                role_id = table.Column<Guid>(type: "uuid", nullable: true),
                claim_id = table.Column<Guid>(type: "uuid", nullable: true),
                user_id = table.Column<Guid>(type: "uuid", nullable: true),
                can_view = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                can_edit = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                can_execute = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false, defaultValue: ""),
                system = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                inactive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_wkf_workflow_permissions", x => x.id);
                table.ForeignKey(
                    name: "fk_wkf_workflow_permissions_mpx_corporations_corporation_id",
                    column: x => x.corporation_id,
                    principalTable: "mpx_corporations",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "fk_wkf_workflow_permissions_sec_claims_claim_id",
                    column: x => x.claim_id,
                    principalTable: "sec_claims",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "fk_wkf_workflow_permissions_sec_roles_role_id",
                    column: x => x.role_id,
                    principalTable: "sec_roles",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "fk_wkf_workflow_permissions_sec_users_user_id",
                    column: x => x.user_id,
                    principalTable: "sec_users",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "fk_wkf_workflow_permissions_workflow_type_config_actions_workf",
                    column: x => x.workflow_type_config_action_id,
                    principalTable: "wkf_workflow_type_config_actions",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "fk_wkf_workflow_permissions_workflow_type_config_fields_workfl",
                    column: x => x.workflow_type_config_field_id,
                    principalTable: "wkf_workflow_type_config_fields",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "fk_wkf_workflow_permissions_workflow_type_configs_workflow_typ",
                    column: x => x.workflow_type_config_id,
                    principalTable: "wkf_workflow_type_configs",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "fk_wkf_workflow_permissions_workflow_types_workflow_type_id",
                    column: x => x.workflow_type_id,
                    principalTable: "wkf_workflow_types",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "fk_wkf_workflow_permissions_workspaces_workspace_id",
                    column: x => x.workspace_id,
                    principalTable: "mpx_workspaces",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "wkf_workflow_type_config_notifications",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                corporation_id = table.Column<Guid>(type: "uuid", nullable: false),
                workflow_type_config_id = table.Column<Guid>(type: "uuid", nullable: false),
                workflow_type_config_action_id = table.Column<Guid>(type: "uuid", nullable: true),
                workflow_type_config_sla_id = table.Column<Guid>(type: "uuid", nullable: true),
                trigger_event = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: false, defaultValue: "OnEnter"),
                target_role_id = table.Column<Guid>(type: "uuid", nullable: true),
                target_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                target_email = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                entity_email_property_path = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                notify_role_email = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                notify_role_users = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                notify_corporation_email = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                notify_task_owners = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                notify_workflow_starter = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                notify_previous_step_executor = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                cc_role_id = table.Column<Guid>(type: "uuid", nullable: true),
                cc_emails = table.Column<string>(type: "text", nullable: true),
                bcc_role_id = table.Column<Guid>(type: "uuid", nullable: true),
                bcc_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                bcc_emails = table.Column<string>(type: "text", nullable: true),
                attach_workflow_files = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                attachment_keys = table.Column<string>(type: "text", nullable: true),
                attachment_tag_filter = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                attachment_from_config_id = table.Column<Guid>(type: "uuid", nullable: true),
                attachment_filter_where_clause = table.Column<string>(type: "text", nullable: true),
                repeat_interval_minutes = table.Column<int>(type: "integer", nullable: true),
                channel = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false, defaultValue: "Both"),
                template_key = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                subject_template = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                message_template = table.Column<string>(type: "text", nullable: true),
                key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false, defaultValue: ""),
                system = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                inactive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_wkf_workflow_type_config_notifications", x => x.id);
                table.ForeignKey(
                    name: "fk_wkf_workflow_type_config_notifications_mpx_corporations_cor",
                    column: x => x.corporation_id,
                    principalTable: "mpx_corporations",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "fk_wkf_workflow_type_config_notifications_sec_roles_bcc_role_id",
                    column: x => x.bcc_role_id,
                    principalTable: "sec_roles",
                    principalColumn: "id",
                    onDelete: ReferentialAction.SetNull);
                table.ForeignKey(
                    name: "fk_wkf_workflow_type_config_notifications_sec_roles_cc_role_id",
                    column: x => x.cc_role_id,
                    principalTable: "sec_roles",
                    principalColumn: "id",
                    onDelete: ReferentialAction.SetNull);
                table.ForeignKey(
                    name: "fk_wkf_workflow_type_config_notifications_sec_roles_target_rol",
                    column: x => x.target_role_id,
                    principalTable: "sec_roles",
                    principalColumn: "id",
                    onDelete: ReferentialAction.SetNull);
                table.ForeignKey(
                    name: "fk_wkf_workflow_type_config_notifications_sec_users_bcc_user_id",
                    column: x => x.bcc_user_id,
                    principalTable: "sec_users",
                    principalColumn: "id",
                    onDelete: ReferentialAction.SetNull);
                table.ForeignKey(
                    name: "fk_wkf_workflow_type_config_notifications_sec_users_target_use",
                    column: x => x.target_user_id,
                    principalTable: "sec_users",
                    principalColumn: "id",
                    onDelete: ReferentialAction.SetNull);
                table.ForeignKey(
                    name: "fk_wkf_workflow_type_config_notifications_wkf_workflow_type_co",
                    column: x => x.workflow_type_config_action_id,
                    principalTable: "wkf_workflow_type_config_actions",
                    principalColumn: "id",
                    onDelete: ReferentialAction.SetNull);
                table.ForeignKey(
                    name: "fk_wkf_workflow_type_config_notifications_wkf_workflow_type_co1",
                    column: x => x.workflow_type_config_id,
                    principalTable: "wkf_workflow_type_configs",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "fk_wkf_workflow_type_config_notifications_workflow_type_config",
                    column: x => x.workflow_type_config_sla_id,
                    principalTable: "wkf_workflow_type_config_slas",
                    principalColumn: "id",
                    onDelete: ReferentialAction.SetNull);
            });

        migrationBuilder.CreateTable(
            name: "wkf_workflow_items",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                corporation_id = table.Column<Guid>(type: "uuid", nullable: false),
                workflow_id = table.Column<Guid>(type: "uuid", nullable: false),
                parent_workflow_item_id = table.Column<Guid>(type: "uuid", nullable: true),
                added_in_config_id = table.Column<Guid>(type: "uuid", nullable: true),
                workflow_type_config_field_id = table.Column<Guid>(type: "uuid", nullable: true),
                added_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                item_type = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false, defaultValue: "Entity"),
                is_primary_entity = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                entity_name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                entity_alias = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                entity_id = table.Column<Guid>(type: "uuid", nullable: true),
                file_name = table.Column<string>(type: "character varying(260)", maxLength: 260, nullable: true),
                mime_type = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                file_size = table.Column<long>(type: "bigint", nullable: true),
                storage_url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                payload_json = table.Column<string>(type: "text", nullable: true),
                pending_activation = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false, defaultValue: ""),
                system = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                inactive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_wkf_workflow_items", x => x.id);
                table.ForeignKey(
                    name: "fk_wkf_workflow_items_mpx_corporations_corporation_id",
                    column: x => x.corporation_id,
                    principalTable: "mpx_corporations",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "fk_wkf_workflow_items_sec_users_added_by_user_id",
                    column: x => x.added_by_user_id,
                    principalTable: "sec_users",
                    principalColumn: "id",
                    onDelete: ReferentialAction.SetNull);
                table.ForeignKey(
                    name: "fk_wkf_workflow_items_wkf_workflow_items_parent_workflow_item_",
                    column: x => x.parent_workflow_item_id,
                    principalTable: "wkf_workflow_items",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "fk_wkf_workflow_items_wkf_workflows_workflow_id",
                    column: x => x.workflow_id,
                    principalTable: "wkf_workflows",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "fk_wkf_workflow_items_workflow_type_config_fields_workflow_typ",
                    column: x => x.workflow_type_config_field_id,
                    principalTable: "wkf_workflow_type_config_fields",
                    principalColumn: "id",
                    onDelete: ReferentialAction.SetNull);
                table.ForeignKey(
                    name: "fk_wkf_workflow_items_workflow_type_configs_added_in_config_id",
                    column: x => x.added_in_config_id,
                    principalTable: "wkf_workflow_type_configs",
                    principalColumn: "id",
                    onDelete: ReferentialAction.SetNull);
            });

        migrationBuilder.CreateTable(
            name: "wkf_workflow_tasks",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                corporation_id = table.Column<Guid>(type: "uuid", nullable: false),
                workflow_id = table.Column<Guid>(type: "uuid", nullable: false),
                workflow_type_config_id = table.Column<Guid>(type: "uuid", nullable: false),
                target_role_id = table.Column<Guid>(type: "uuid", nullable: true),
                target_workspace_id = table.Column<Guid>(type: "uuid", nullable: true),
                max_owners = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                current_owners_count = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                claimed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                completed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                due_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                remaining_sla_minutes = table.Column<int>(type: "integer", nullable: true),
                sla_elapsed_percent = table.Column<double>(type: "double precision", nullable: false, defaultValue: 0.0),
                sla_severity = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false, defaultValue: "success"),
                sla_color = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false, defaultValue: "green"),
                sla_breached = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                status = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false, defaultValue: "PendingGroup"),
                num_retries = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                next_check_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false, defaultValue: ""),
                system = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                inactive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_wkf_workflow_tasks", x => x.id);
                table.ForeignKey(
                    name: "fk_wkf_workflow_tasks_mpx_corporations_corporation_id",
                    column: x => x.corporation_id,
                    principalTable: "mpx_corporations",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "fk_wkf_workflow_tasks_sec_roles_target_role_id",
                    column: x => x.target_role_id,
                    principalTable: "sec_roles",
                    principalColumn: "id",
                    onDelete: ReferentialAction.SetNull);
                table.ForeignKey(
                    name: "fk_wkf_workflow_tasks_wkf_workflows_workflow_id",
                    column: x => x.workflow_id,
                    principalTable: "wkf_workflows",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "fk_wkf_workflow_tasks_workflow_type_configs_workflow_type_conf",
                    column: x => x.workflow_type_config_id,
                    principalTable: "wkf_workflow_type_configs",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "fk_wkf_workflow_tasks_workspaces_target_workspace_id",
                    column: x => x.target_workspace_id,
                    principalTable: "mpx_workspaces",
                    principalColumn: "id",
                    onDelete: ReferentialAction.SetNull);
            });

        migrationBuilder.CreateTable(
            name: "wkf_workflow_item_metadatas",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                corporation_id = table.Column<Guid>(type: "uuid", nullable: false),
                workflow_item_id = table.Column<Guid>(type: "uuid", nullable: false),
                workflow_type_config_id = table.Column<Guid>(type: "uuid", nullable: true),
                workflow_type_config_field_id = table.Column<Guid>(type: "uuid", nullable: true),
                metadata_key = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                value = table.Column<string>(type: "text", nullable: true),
                data_type = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false, defaultValue: "text"),
                tag = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                is_critical = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                required_claim_id = table.Column<Guid>(type: "uuid", nullable: true),
                key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false, defaultValue: ""),
                system = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                inactive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_wkf_workflow_item_metadatas", x => x.id);
                table.ForeignKey(
                    name: "fk_wkf_workflow_item_metadatas_mpx_corporations_corporation_id",
                    column: x => x.corporation_id,
                    principalTable: "mpx_corporations",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "fk_wkf_workflow_item_metadatas_sec_claims_required_claim_id",
                    column: x => x.required_claim_id,
                    principalTable: "sec_claims",
                    principalColumn: "id",
                    onDelete: ReferentialAction.SetNull);
                table.ForeignKey(
                    name: "fk_wkf_workflow_item_metadatas_wkf_workflow_items_workflow_ite",
                    column: x => x.workflow_item_id,
                    principalTable: "wkf_workflow_items",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "fk_wkf_workflow_item_metadatas_workflow_type_config_fields_wor",
                    column: x => x.workflow_type_config_field_id,
                    principalTable: "wkf_workflow_type_config_fields",
                    principalColumn: "id",
                    onDelete: ReferentialAction.SetNull);
                table.ForeignKey(
                    name: "fk_wkf_workflow_item_metadatas_workflow_type_configs_workflow_",
                    column: x => x.workflow_type_config_id,
                    principalTable: "wkf_workflow_type_configs",
                    principalColumn: "id",
                    onDelete: ReferentialAction.SetNull);
            });

        migrationBuilder.CreateTable(
            name: "wkf_workflow_task_owners",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                corporation_id = table.Column<Guid>(type: "uuid", nullable: false),
                workflow_task_id = table.Column<Guid>(type: "uuid", nullable: false),
                user_id = table.Column<Guid>(type: "uuid", nullable: false),
                is_rapporteur = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                workflow_type_config_action_id = table.Column<Guid>(type: "uuid", nullable: true),
                followed_rapporteur = table.Column<bool>(type: "boolean", nullable: true),
                opinion = table.Column<string>(type: "text", nullable: true),
                ip_address = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: true),
                user_agent = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                claimed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                released_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                transferred_to_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                release_reason = table.Column<string>(type: "text", nullable: true),
                completed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false, defaultValue: ""),
                system = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                inactive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_wkf_workflow_task_owners", x => x.id);
                table.ForeignKey(
                    name: "fk_wkf_workflow_task_owners_mpx_corporations_corporation_id",
                    column: x => x.corporation_id,
                    principalTable: "mpx_corporations",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "fk_wkf_workflow_task_owners_sec_users_transferred_to_user_id",
                    column: x => x.transferred_to_user_id,
                    principalTable: "sec_users",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "fk_wkf_workflow_task_owners_sec_users_user_id",
                    column: x => x.user_id,
                    principalTable: "sec_users",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "fk_wkf_workflow_task_owners_wkf_workflow_tasks_workflow_task_id",
                    column: x => x.workflow_task_id,
                    principalTable: "wkf_workflow_tasks",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "fk_wkf_workflow_task_owners_workflow_type_config_actions_workf",
                    column: x => x.workflow_type_config_action_id,
                    principalTable: "wkf_workflow_type_config_actions",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateIndex(
            name: "ix_mpx_file_types_corporation_id",
            table: "mpx_file_types",
            column: "corporation_id");

        migrationBuilder.CreateIndex(
            name: "ix_mpx_file_types_key",
            table: "mpx_file_types",
            column: "key",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_wkf_stations_corporation_id_code",
            table: "wkf_stations",
            columns: new[] { "corporation_id", "code" },
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_wkf_stations_key",
            table: "wkf_stations",
            column: "key",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_item_metadatas_corporation_id",
            table: "wkf_workflow_item_metadatas",
            column: "corporation_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_item_metadatas_key",
            table: "wkf_workflow_item_metadatas",
            column: "key",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_item_metadatas_required_claim_id",
            table: "wkf_workflow_item_metadatas",
            column: "required_claim_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_item_metadatas_workflow_item_id",
            table: "wkf_workflow_item_metadatas",
            column: "workflow_item_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_item_metadatas_workflow_type_config_field_id",
            table: "wkf_workflow_item_metadatas",
            column: "workflow_type_config_field_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_item_metadatas_workflow_type_config_id",
            table: "wkf_workflow_item_metadatas",
            column: "workflow_type_config_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_items_added_by_user_id",
            table: "wkf_workflow_items",
            column: "added_by_user_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_items_added_in_config_id",
            table: "wkf_workflow_items",
            column: "added_in_config_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_items_corporation_id",
            table: "wkf_workflow_items",
            column: "corporation_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_items_key",
            table: "wkf_workflow_items",
            column: "key",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_items_parent_workflow_item_id",
            table: "wkf_workflow_items",
            column: "parent_workflow_item_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_items_workflow_id",
            table: "wkf_workflow_items",
            column: "workflow_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_items_workflow_type_config_field_id",
            table: "wkf_workflow_items",
            column: "workflow_type_config_field_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_permissions_claim_id",
            table: "wkf_workflow_permissions",
            column: "claim_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_permissions_corporation_id",
            table: "wkf_workflow_permissions",
            column: "corporation_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_permissions_key",
            table: "wkf_workflow_permissions",
            column: "key",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_permissions_role_id",
            table: "wkf_workflow_permissions",
            column: "role_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_permissions_user_id",
            table: "wkf_workflow_permissions",
            column: "user_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_permissions_workflow_type_config_action_id",
            table: "wkf_workflow_permissions",
            column: "workflow_type_config_action_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_permissions_workflow_type_config_field_id",
            table: "wkf_workflow_permissions",
            column: "workflow_type_config_field_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_permissions_workflow_type_config_id",
            table: "wkf_workflow_permissions",
            column: "workflow_type_config_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_permissions_workflow_type_id",
            table: "wkf_workflow_permissions",
            column: "workflow_type_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_permissions_workspace_id",
            table: "wkf_workflow_permissions",
            column: "workspace_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_task_owners_corporation_id",
            table: "wkf_workflow_task_owners",
            column: "corporation_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_task_owners_key",
            table: "wkf_workflow_task_owners",
            column: "key",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_task_owners_transferred_to_user_id",
            table: "wkf_workflow_task_owners",
            column: "transferred_to_user_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_task_owners_user_id",
            table: "wkf_workflow_task_owners",
            column: "user_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_task_owners_workflow_task_id",
            table: "wkf_workflow_task_owners",
            column: "workflow_task_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_task_owners_workflow_type_config_action_id",
            table: "wkf_workflow_task_owners",
            column: "workflow_type_config_action_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_tasks_corporation_id",
            table: "wkf_workflow_tasks",
            column: "corporation_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_tasks_key",
            table: "wkf_workflow_tasks",
            column: "key",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_tasks_status_next_check_at",
            table: "wkf_workflow_tasks",
            columns: new[] { "status", "next_check_at" });

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_tasks_target_role_id",
            table: "wkf_workflow_tasks",
            column: "target_role_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_tasks_target_workspace_id",
            table: "wkf_workflow_tasks",
            column: "target_workspace_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_tasks_workflow_id",
            table: "wkf_workflow_tasks",
            column: "workflow_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_tasks_workflow_type_config_id",
            table: "wkf_workflow_tasks",
            column: "workflow_type_config_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_type_config_action_file_types_corporation_id",
            table: "wkf_workflow_type_config_action_file_types",
            column: "corporation_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_type_config_action_file_types_file_type_id",
            table: "wkf_workflow_type_config_action_file_types",
            column: "file_type_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_type_config_actions_corporation_id",
            table: "wkf_workflow_type_config_actions",
            column: "corporation_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_type_config_actions_key",
            table: "wkf_workflow_type_config_actions",
            column: "key",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_type_config_actions_next_workflow_type_config_",
            table: "wkf_workflow_type_config_actions",
            column: "next_workflow_type_config_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_type_config_actions_workflow_type_config_id",
            table: "wkf_workflow_type_config_actions",
            column: "workflow_type_config_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_type_config_conditions_corporation_id",
            table: "wkf_workflow_type_config_conditions",
            column: "corporation_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_type_config_conditions_else_next_workflow_type",
            table: "wkf_workflow_type_config_conditions",
            column: "else_next_workflow_type_config_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_type_config_conditions_key",
            table: "wkf_workflow_type_config_conditions",
            column: "key",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_type_config_conditions_next_workflow_type_conf",
            table: "wkf_workflow_type_config_conditions",
            column: "next_workflow_type_config_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_type_config_conditions_workflow_type_config_id",
            table: "wkf_workflow_type_config_conditions",
            column: "workflow_type_config_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_type_config_fields_corporation_id",
            table: "wkf_workflow_type_config_fields",
            column: "corporation_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_type_config_fields_key",
            table: "wkf_workflow_type_config_fields",
            column: "key",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_type_config_fields_workflow_type_config_id",
            table: "wkf_workflow_type_config_fields",
            column: "workflow_type_config_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_type_config_notifications_bcc_role_id",
            table: "wkf_workflow_type_config_notifications",
            column: "bcc_role_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_type_config_notifications_bcc_user_id",
            table: "wkf_workflow_type_config_notifications",
            column: "bcc_user_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_type_config_notifications_cc_role_id",
            table: "wkf_workflow_type_config_notifications",
            column: "cc_role_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_type_config_notifications_corporation_id",
            table: "wkf_workflow_type_config_notifications",
            column: "corporation_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_type_config_notifications_key",
            table: "wkf_workflow_type_config_notifications",
            column: "key",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_type_config_notifications_target_role_id",
            table: "wkf_workflow_type_config_notifications",
            column: "target_role_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_type_config_notifications_target_user_id",
            table: "wkf_workflow_type_config_notifications",
            column: "target_user_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_type_config_notifications_workflow_type_config",
            table: "wkf_workflow_type_config_notifications",
            column: "workflow_type_config_action_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_type_config_notifications_workflow_type_config1",
            table: "wkf_workflow_type_config_notifications",
            column: "workflow_type_config_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_type_config_notifications_workflow_type_config2",
            table: "wkf_workflow_type_config_notifications",
            column: "workflow_type_config_sla_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_type_config_slas_corporation_id",
            table: "wkf_workflow_type_config_slas",
            column: "corporation_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_type_config_slas_key",
            table: "wkf_workflow_type_config_slas",
            column: "key",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_type_config_slas_workflow_type_config_id",
            table: "wkf_workflow_type_config_slas",
            column: "workflow_type_config_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_type_config_validations_corporation_id",
            table: "wkf_workflow_type_config_validations",
            column: "corporation_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_type_config_validations_key",
            table: "wkf_workflow_type_config_validations",
            column: "key",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_type_config_validations_workflow_type_config_a",
            table: "wkf_workflow_type_config_validations",
            column: "workflow_type_config_action_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_type_config_validations_workflow_type_config_id",
            table: "wkf_workflow_type_config_validations",
            column: "workflow_type_config_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_type_configs_corporation_id",
            table: "wkf_workflow_type_configs",
            column: "corporation_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_type_configs_key",
            table: "wkf_workflow_type_configs",
            column: "key",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_type_configs_station_id",
            table: "wkf_workflow_type_configs",
            column: "station_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_type_configs_workflow_type_id",
            table: "wkf_workflow_type_configs",
            column: "workflow_type_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_types_application_id",
            table: "wkf_workflow_types",
            column: "application_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_types_corporation_id",
            table: "wkf_workflow_types",
            column: "corporation_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_types_key",
            table: "wkf_workflow_types",
            column: "key",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_types_module_id",
            table: "wkf_workflow_types",
            column: "module_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_types_sub_module_id",
            table: "wkf_workflow_types",
            column: "sub_module_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_types_workspace_id",
            table: "wkf_workflow_types",
            column: "workspace_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflows_corporation_id_protocol",
            table: "wkf_workflows",
            columns: new[] { "corporation_id", "protocol" });

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflows_executed_by_user_id",
            table: "wkf_workflows",
            column: "executed_by_user_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflows_from_workflow_type_config_id",
            table: "wkf_workflows",
            column: "from_workflow_type_config_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflows_key",
            table: "wkf_workflows",
            column: "key",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflows_parent_workflow_id",
            table: "wkf_workflows",
            column: "parent_workflow_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflows_to_workflow_type_config_id",
            table: "wkf_workflows",
            column: "to_workflow_type_config_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflows_workflow_type_config_action_id",
            table: "wkf_workflows",
            column: "workflow_type_config_action_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflows_workflow_type_config_condition_id",
            table: "wkf_workflows",
            column: "workflow_type_config_condition_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflows_workflow_type_id",
            table: "wkf_workflows",
            column: "workflow_type_id");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "wkf_workflow_item_metadatas");

        migrationBuilder.DropTable(
            name: "wkf_workflow_permissions");

        migrationBuilder.DropTable(
            name: "wkf_workflow_task_owners");

        migrationBuilder.DropTable(
            name: "wkf_workflow_type_config_action_file_types");

        migrationBuilder.DropTable(
            name: "wkf_workflow_type_config_notifications");

        migrationBuilder.DropTable(
            name: "wkf_workflow_type_config_validations");

        migrationBuilder.DropTable(
            name: "wkf_workflow_items");

        migrationBuilder.DropTable(
            name: "wkf_workflow_tasks");

        migrationBuilder.DropTable(
            name: "mpx_file_types");

        migrationBuilder.DropTable(
            name: "wkf_workflow_type_config_slas");

        migrationBuilder.DropTable(
            name: "wkf_workflow_type_config_fields");

        migrationBuilder.DropTable(
            name: "wkf_workflows");

        migrationBuilder.DropTable(
            name: "wkf_workflow_type_config_actions");

        migrationBuilder.DropTable(
            name: "wkf_workflow_type_config_conditions");

        migrationBuilder.DropTable(
            name: "wkf_workflow_type_configs");

        migrationBuilder.DropTable(
            name: "wkf_stations");

        migrationBuilder.DropTable(
            name: "wkf_workflow_types");

        migrationBuilder.DropColumn(
            name: "email",
            table: "sec_roles");
    }
}
