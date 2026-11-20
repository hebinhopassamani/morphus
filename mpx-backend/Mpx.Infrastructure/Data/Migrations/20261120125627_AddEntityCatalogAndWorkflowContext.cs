using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Mpx.Infrastructure.Data.Migrations;

/// <inheritdoc />
public partial class _20261120125627_AddEntityCatalogAndWorkflowContext : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<Guid>(
            name: "root_entity_definition_id",
            table: "wkf_workflow_types",
            type: "uuid",
            nullable: true);

        migrationBuilder.AlterColumn<string>(
            name: "property_name",
            table: "wkf_workflow_type_config_fields",
            type: "character varying(150)",
            maxLength: 150,
            nullable: true,
            oldClrType: typeof(string),
            oldType: "character varying(150)",
            oldMaxLength: 150);

        migrationBuilder.AddColumn<Guid>(
            name: "entity_definition_id",
            table: "wkf_workflow_type_config_fields",
            type: "uuid",
            nullable: true);

        migrationBuilder.AddColumn<Guid>(
            name: "entity_property_id",
            table: "wkf_workflow_type_config_fields",
            type: "uuid",
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "property_path",
            table: "wkf_workflow_type_config_fields",
            type: "character varying(300)",
            maxLength: 300,
            nullable: true);

        migrationBuilder.AddColumn<Guid>(
            name: "target_entity_definition_id",
            table: "wkf_workflow_type_config_fields",
            type: "uuid",
            nullable: true);

        migrationBuilder.AddColumn<Guid>(
            name: "workflow_type_context_id",
            table: "wkf_workflow_type_config_fields",
            type: "uuid",
            nullable: true);

        migrationBuilder.AddColumn<Guid>(
            name: "entity_definition_id",
            table: "wkf_workflow_items",
            type: "uuid",
            nullable: true);

        migrationBuilder.AddColumn<Guid>(
            name: "workflow_type_context_id",
            table: "wkf_workflow_items",
            type: "uuid",
            nullable: true);

        migrationBuilder.CreateTable(
            name: "mpx_entities",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                corporation_id = table.Column<Guid>(type: "uuid", nullable: true),
                application_id = table.Column<Guid>(type: "uuid", nullable: true),
                name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                table_name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                label = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                plural_label = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                module_name = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false, defaultValue: "Morphus"),
                icon = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                description = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false, defaultValue: ""),
                system = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                inactive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_mpx_entities", x => x.id);
                table.ForeignKey(
                    name: "fk_mpx_entities_mpx_applications_application_id",
                    column: x => x.application_id,
                    principalTable: "mpx_applications",
                    principalColumn: "id",
                    onDelete: ReferentialAction.SetNull);
                table.ForeignKey(
                    name: "fk_mpx_entities_mpx_corporations_corporation_id",
                    column: x => x.corporation_id,
                    principalTable: "mpx_corporations",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateTable(
            name: "mpx_entity_properties",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                corporation_id = table.Column<Guid>(type: "uuid", nullable: true),
                entity_definition_id = table.Column<Guid>(type: "uuid", nullable: false),
                name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                column_name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                label = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                data_type = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false, defaultValue: "Text"),
                default_control_type = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false, defaultValue: "Input"),
                target_entity_definition_id = table.Column<Guid>(type: "uuid", nullable: true),
                foreign_key_property_name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                is_primary_key = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                is_foreign_key = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                is_required = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                min_length = table.Column<int>(type: "integer", nullable: true),
                max_length = table.Column<int>(type: "integer", nullable: true),
                min_value = table.Column<decimal>(type: "numeric(18,4)", nullable: true),
                max_value = table.Column<decimal>(type: "numeric(18,4)", nullable: true),
                default_mask = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                regex_pattern = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                order = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                description = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false, defaultValue: ""),
                system = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                inactive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_mpx_entity_properties", x => x.id);
                table.ForeignKey(
                    name: "fk_mpx_entity_properties_mpx_corporations_corporation_id",
                    column: x => x.corporation_id,
                    principalTable: "mpx_corporations",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "fk_mpx_entity_properties_mpx_entities_entity_definition_id",
                    column: x => x.entity_definition_id,
                    principalTable: "mpx_entities",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "fk_mpx_entity_properties_mpx_entities_target_entity_definition",
                    column: x => x.target_entity_definition_id,
                    principalTable: "mpx_entities",
                    principalColumn: "id",
                    onDelete: ReferentialAction.SetNull);
            });

        migrationBuilder.CreateTable(
            name: "wkf_workflow_type_contexts",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                corporation_id = table.Column<Guid>(type: "uuid", nullable: false),
                workflow_type_id = table.Column<Guid>(type: "uuid", nullable: false),
                added_in_config_id = table.Column<Guid>(type: "uuid", nullable: true),
                entity_definition_id = table.Column<Guid>(type: "uuid", nullable: false),
                alias = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                is_root_entity = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                is_collection = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                is_auto_included = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                parent_context_id = table.Column<Guid>(type: "uuid", nullable: true),
                foreign_key_property_id = table.Column<Guid>(type: "uuid", nullable: true),
                relationship_path = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                has_unlinked_warning = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                position_x = table.Column<double>(type: "double precision", nullable: false, defaultValue: 0.0),
                position_y = table.Column<double>(type: "double precision", nullable: false, defaultValue: 0.0),
                order = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                description = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false, defaultValue: ""),
                system = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                inactive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_wkf_workflow_type_contexts", x => x.id);
                table.ForeignKey(
                    name: "fk_wkf_workflow_type_contexts_mpx_corporations_corporation_id",
                    column: x => x.corporation_id,
                    principalTable: "mpx_corporations",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "fk_wkf_workflow_type_contexts_mpx_entities_entity_definition_id",
                    column: x => x.entity_definition_id,
                    principalTable: "mpx_entities",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "fk_wkf_workflow_type_contexts_mpx_entity_properties_foreign_ke",
                    column: x => x.foreign_key_property_id,
                    principalTable: "mpx_entity_properties",
                    principalColumn: "id",
                    onDelete: ReferentialAction.SetNull);
                table.ForeignKey(
                    name: "fk_wkf_workflow_type_contexts_wkf_workflow_type_configs_added_",
                    column: x => x.added_in_config_id,
                    principalTable: "wkf_workflow_type_configs",
                    principalColumn: "id",
                    onDelete: ReferentialAction.SetNull);
                table.ForeignKey(
                    name: "fk_wkf_workflow_type_contexts_wkf_workflow_type_contexts_paren",
                    column: x => x.parent_context_id,
                    principalTable: "wkf_workflow_type_contexts",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "fk_wkf_workflow_type_contexts_wkf_workflow_types_workflow_type",
                    column: x => x.workflow_type_id,
                    principalTable: "wkf_workflow_types",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_types_root_entity_definition_id",
            table: "wkf_workflow_types",
            column: "root_entity_definition_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_type_config_fields_entity_definition_id",
            table: "wkf_workflow_type_config_fields",
            column: "entity_definition_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_type_config_fields_entity_property_id",
            table: "wkf_workflow_type_config_fields",
            column: "entity_property_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_type_config_fields_target_entity_definition_id",
            table: "wkf_workflow_type_config_fields",
            column: "target_entity_definition_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_type_config_fields_workflow_type_context_id",
            table: "wkf_workflow_type_config_fields",
            column: "workflow_type_context_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_items_entity_definition_id",
            table: "wkf_workflow_items",
            column: "entity_definition_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_items_workflow_type_context_id",
            table: "wkf_workflow_items",
            column: "workflow_type_context_id");

        migrationBuilder.CreateIndex(
            name: "ix_mpx_entities_application_id",
            table: "mpx_entities",
            column: "application_id");

        migrationBuilder.CreateIndex(
            name: "ix_mpx_entities_corporation_id_name",
            table: "mpx_entities",
            columns: new[] { "corporation_id", "name" });

        migrationBuilder.CreateIndex(
            name: "ix_mpx_entities_key",
            table: "mpx_entities",
            column: "key",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_mpx_entity_properties_corporation_id",
            table: "mpx_entity_properties",
            column: "corporation_id");

        migrationBuilder.CreateIndex(
            name: "ix_mpx_entity_properties_entity_definition_id_name",
            table: "mpx_entity_properties",
            columns: new[] { "entity_definition_id", "name" },
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_mpx_entity_properties_key",
            table: "mpx_entity_properties",
            column: "key",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_mpx_entity_properties_target_entity_definition_id",
            table: "mpx_entity_properties",
            column: "target_entity_definition_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_type_contexts_added_in_config_id",
            table: "wkf_workflow_type_contexts",
            column: "added_in_config_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_type_contexts_corporation_id",
            table: "wkf_workflow_type_contexts",
            column: "corporation_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_type_contexts_entity_definition_id",
            table: "wkf_workflow_type_contexts",
            column: "entity_definition_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_type_contexts_foreign_key_property_id",
            table: "wkf_workflow_type_contexts",
            column: "foreign_key_property_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_type_contexts_key",
            table: "wkf_workflow_type_contexts",
            column: "key",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_type_contexts_parent_context_id",
            table: "wkf_workflow_type_contexts",
            column: "parent_context_id");

        migrationBuilder.CreateIndex(
            name: "ix_wkf_workflow_type_contexts_workflow_type_id_alias",
            table: "wkf_workflow_type_contexts",
            columns: new[] { "workflow_type_id", "alias" },
            unique: true);

        migrationBuilder.AddForeignKey(
            name: "fk_wkf_workflow_items_mpx_entities_entity_definition_id",
            table: "wkf_workflow_items",
            column: "entity_definition_id",
            principalTable: "mpx_entities",
            principalColumn: "id",
            onDelete: ReferentialAction.SetNull);

        migrationBuilder.AddForeignKey(
            name: "fk_wkf_workflow_items_workflow_type_contexts_workflow_type_con",
            table: "wkf_workflow_items",
            column: "workflow_type_context_id",
            principalTable: "wkf_workflow_type_contexts",
            principalColumn: "id",
            onDelete: ReferentialAction.SetNull);

        migrationBuilder.AddForeignKey(
            name: "fk_wkf_workflow_type_config_fields_mpx_entities_entity_definit",
            table: "wkf_workflow_type_config_fields",
            column: "entity_definition_id",
            principalTable: "mpx_entities",
            principalColumn: "id",
            onDelete: ReferentialAction.SetNull);

        migrationBuilder.AddForeignKey(
            name: "fk_wkf_workflow_type_config_fields_mpx_entities_target_entity_",
            table: "wkf_workflow_type_config_fields",
            column: "target_entity_definition_id",
            principalTable: "mpx_entities",
            principalColumn: "id",
            onDelete: ReferentialAction.SetNull);

        migrationBuilder.AddForeignKey(
            name: "fk_wkf_workflow_type_config_fields_mpx_entity_properties_entit",
            table: "wkf_workflow_type_config_fields",
            column: "entity_property_id",
            principalTable: "mpx_entity_properties",
            principalColumn: "id",
            onDelete: ReferentialAction.SetNull);

        migrationBuilder.AddForeignKey(
            name: "fk_wkf_workflow_type_config_fields_workflow_type_contexts_work",
            table: "wkf_workflow_type_config_fields",
            column: "workflow_type_context_id",
            principalTable: "wkf_workflow_type_contexts",
            principalColumn: "id",
            onDelete: ReferentialAction.SetNull);

        migrationBuilder.AddForeignKey(
            name: "fk_wkf_workflow_types_mpx_entities_root_entity_definition_id",
            table: "wkf_workflow_types",
            column: "root_entity_definition_id",
            principalTable: "mpx_entities",
            principalColumn: "id",
            onDelete: ReferentialAction.SetNull);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "fk_wkf_workflow_items_mpx_entities_entity_definition_id",
            table: "wkf_workflow_items");

        migrationBuilder.DropForeignKey(
            name: "fk_wkf_workflow_items_workflow_type_contexts_workflow_type_con",
            table: "wkf_workflow_items");

        migrationBuilder.DropForeignKey(
            name: "fk_wkf_workflow_type_config_fields_mpx_entities_entity_definit",
            table: "wkf_workflow_type_config_fields");

        migrationBuilder.DropForeignKey(
            name: "fk_wkf_workflow_type_config_fields_mpx_entities_target_entity_",
            table: "wkf_workflow_type_config_fields");

        migrationBuilder.DropForeignKey(
            name: "fk_wkf_workflow_type_config_fields_mpx_entity_properties_entit",
            table: "wkf_workflow_type_config_fields");

        migrationBuilder.DropForeignKey(
            name: "fk_wkf_workflow_type_config_fields_workflow_type_contexts_work",
            table: "wkf_workflow_type_config_fields");

        migrationBuilder.DropForeignKey(
            name: "fk_wkf_workflow_types_mpx_entities_root_entity_definition_id",
            table: "wkf_workflow_types");

        migrationBuilder.DropTable(
            name: "wkf_workflow_type_contexts");

        migrationBuilder.DropTable(
            name: "mpx_entity_properties");

        migrationBuilder.DropTable(
            name: "mpx_entities");

        migrationBuilder.DropIndex(
            name: "ix_wkf_workflow_types_root_entity_definition_id",
            table: "wkf_workflow_types");

        migrationBuilder.DropIndex(
            name: "ix_wkf_workflow_type_config_fields_entity_definition_id",
            table: "wkf_workflow_type_config_fields");

        migrationBuilder.DropIndex(
            name: "ix_wkf_workflow_type_config_fields_entity_property_id",
            table: "wkf_workflow_type_config_fields");

        migrationBuilder.DropIndex(
            name: "ix_wkf_workflow_type_config_fields_target_entity_definition_id",
            table: "wkf_workflow_type_config_fields");

        migrationBuilder.DropIndex(
            name: "ix_wkf_workflow_type_config_fields_workflow_type_context_id",
            table: "wkf_workflow_type_config_fields");

        migrationBuilder.DropIndex(
            name: "ix_wkf_workflow_items_entity_definition_id",
            table: "wkf_workflow_items");

        migrationBuilder.DropIndex(
            name: "ix_wkf_workflow_items_workflow_type_context_id",
            table: "wkf_workflow_items");

        migrationBuilder.DropColumn(
            name: "root_entity_definition_id",
            table: "wkf_workflow_types");

        migrationBuilder.DropColumn(
            name: "entity_definition_id",
            table: "wkf_workflow_type_config_fields");

        migrationBuilder.DropColumn(
            name: "entity_property_id",
            table: "wkf_workflow_type_config_fields");

        migrationBuilder.DropColumn(
            name: "property_path",
            table: "wkf_workflow_type_config_fields");

        migrationBuilder.DropColumn(
            name: "target_entity_definition_id",
            table: "wkf_workflow_type_config_fields");

        migrationBuilder.DropColumn(
            name: "workflow_type_context_id",
            table: "wkf_workflow_type_config_fields");

        migrationBuilder.DropColumn(
            name: "entity_definition_id",
            table: "wkf_workflow_items");

        migrationBuilder.DropColumn(
            name: "workflow_type_context_id",
            table: "wkf_workflow_items");

        migrationBuilder.AlterColumn<string>(
            name: "property_name",
            table: "wkf_workflow_type_config_fields",
            type: "character varying(150)",
            maxLength: 150,
            nullable: false,
            defaultValue: "",
            oldClrType: typeof(string),
            oldType: "character varying(150)",
            oldMaxLength: 150,
            oldNullable: true);
    }
}
