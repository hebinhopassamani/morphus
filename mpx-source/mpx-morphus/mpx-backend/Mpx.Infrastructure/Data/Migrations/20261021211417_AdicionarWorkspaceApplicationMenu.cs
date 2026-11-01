using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Mpx.Infrastructure.Data.Migrations;

/// <inheritdoc />
public partial class _20261021211417_AdicionarWorkspaceApplicationMenu : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(
            name: "application",
            table: "menus");

        migrationBuilder.AddColumn<Guid>(
            name: "application_id",
            table: "modules",
            type: "uuid",
            nullable: false,
            defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

        migrationBuilder.AlterColumn<string>(
            name: "url",
            table: "menus",
            type: "character varying(250)",
            maxLength: 250,
            nullable: true,
            oldClrType: typeof(string),
            oldType: "text",
            oldNullable: true);

        migrationBuilder.AlterColumn<string>(
            name: "label",
            table: "menus",
            type: "character varying(150)",
            maxLength: 150,
            nullable: false,
            oldClrType: typeof(string),
            oldType: "character varying(25)",
            oldMaxLength: 25);

        migrationBuilder.AlterColumn<string>(
            name: "icon",
            table: "menus",
            type: "character varying(100)",
            maxLength: 100,
            nullable: true,
            oldClrType: typeof(string),
            oldType: "text",
            oldNullable: true);

        migrationBuilder.AddColumn<Guid>(
            name: "application_id",
            table: "menus",
            type: "uuid",
            nullable: false,
            defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

        migrationBuilder.AddColumn<Guid>(
            name: "module_id",
            table: "menus",
            type: "uuid",
            nullable: true);

        migrationBuilder.AddColumn<int>(
            name: "order",
            table: "menus",
            type: "integer",
            nullable: false,
            defaultValue: 0);

        migrationBuilder.AddColumn<Guid>(
            name: "sub_module_id",
            table: "menus",
            type: "uuid",
            nullable: true);

        migrationBuilder.CreateTable(
            name: "workspaces",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                description = table.Column<string>(type: "text", nullable: true),
                icon = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                system = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                inactive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                corporation_id = table.Column<Guid>(type: "uuid", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_workspaces", x => x.id);
                table.ForeignKey(
                    name: "fk_workspaces_corporations_corporation_id",
                    column: x => x.corporation_id,
                    principalTable: "corporations",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateTable(
            name: "applications",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                description = table.Column<string>(type: "text", nullable: true),
                icon = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                system = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                inactive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                workspace_id = table.Column<Guid>(type: "uuid", nullable: false),
                corporation_id = table.Column<Guid>(type: "uuid", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_applications", x => x.id);
                table.ForeignKey(
                    name: "fk_applications_corporations_corporation_id",
                    column: x => x.corporation_id,
                    principalTable: "corporations",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "fk_applications_workspaces_workspace_id",
                    column: x => x.workspace_id,
                    principalTable: "workspaces",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateTable(
            name: "workspace_users",
            columns: table => new
            {
                workspace_id = table.Column<Guid>(type: "uuid", nullable: false),
                user_id = table.Column<Guid>(type: "uuid", nullable: false),
                corporation_id = table.Column<Guid>(type: "uuid", nullable: false),
                inactive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                system = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                is_owner = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_workspace_users", x => new { x.workspace_id, x.user_id });
                table.ForeignKey(
                    name: "fk_workspace_users_corporations_corporation_id",
                    column: x => x.corporation_id,
                    principalTable: "corporations",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "fk_workspace_users_users_user_id",
                    column: x => x.user_id,
                    principalTable: "users",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "fk_workspace_users_workspaces_workspace_id",
                    column: x => x.workspace_id,
                    principalTable: "workspaces",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "application_users",
            columns: table => new
            {
                application_id = table.Column<Guid>(type: "uuid", nullable: false),
                user_id = table.Column<Guid>(type: "uuid", nullable: false),
                corporation_id = table.Column<Guid>(type: "uuid", nullable: false),
                inactive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                system = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                is_owner = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_application_users", x => new { x.application_id, x.user_id });
                table.ForeignKey(
                    name: "fk_application_users_applications_application_id",
                    column: x => x.application_id,
                    principalTable: "applications",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "fk_application_users_corporations_corporation_id",
                    column: x => x.corporation_id,
                    principalTable: "corporations",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "fk_application_users_users_user_id",
                    column: x => x.user_id,
                    principalTable: "users",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(
            name: "ix_modules_application_id",
            table: "modules",
            column: "application_id");

        migrationBuilder.CreateIndex(
            name: "ix_menus_application_id",
            table: "menus",
            column: "application_id");

        migrationBuilder.CreateIndex(
            name: "ix_menus_module_id",
            table: "menus",
            column: "module_id");

        migrationBuilder.CreateIndex(
            name: "ix_menus_sub_module_id",
            table: "menus",
            column: "sub_module_id");

        migrationBuilder.CreateIndex(
            name: "ix_application_users_corporation_id",
            table: "application_users",
            column: "corporation_id");

        migrationBuilder.CreateIndex(
            name: "ix_application_users_user_id",
            table: "application_users",
            column: "user_id");

        migrationBuilder.CreateIndex(
            name: "ix_applications_corporation_id",
            table: "applications",
            column: "corporation_id");

        migrationBuilder.CreateIndex(
            name: "ix_applications_workspace_id",
            table: "applications",
            column: "workspace_id");

        migrationBuilder.CreateIndex(
            name: "ix_workspace_users_corporation_id",
            table: "workspace_users",
            column: "corporation_id");

        migrationBuilder.CreateIndex(
            name: "ix_workspace_users_user_id",
            table: "workspace_users",
            column: "user_id");

        migrationBuilder.CreateIndex(
            name: "ix_workspaces_corporation_id",
            table: "workspaces",
            column: "corporation_id");

        migrationBuilder.AddForeignKey(
            name: "fk_menus_applications_application_id",
            table: "menus",
            column: "application_id",
            principalTable: "applications",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_menus_modules_module_id",
            table: "menus",
            column: "module_id",
            principalTable: "modules",
            principalColumn: "id",
            onDelete: ReferentialAction.SetNull);

        migrationBuilder.AddForeignKey(
            name: "fk_menus_sub_modules_sub_module_id",
            table: "menus",
            column: "sub_module_id",
            principalTable: "sub_modules",
            principalColumn: "id",
            onDelete: ReferentialAction.SetNull);

        migrationBuilder.AddForeignKey(
            name: "fk_modules_applications_application_id",
            table: "modules",
            column: "application_id",
            principalTable: "applications",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "fk_menus_applications_application_id",
            table: "menus");

        migrationBuilder.DropForeignKey(
            name: "fk_menus_modules_module_id",
            table: "menus");

        migrationBuilder.DropForeignKey(
            name: "fk_menus_sub_modules_sub_module_id",
            table: "menus");

        migrationBuilder.DropForeignKey(
            name: "fk_modules_applications_application_id",
            table: "modules");

        migrationBuilder.DropTable(
            name: "application_users");

        migrationBuilder.DropTable(
            name: "workspace_users");

        migrationBuilder.DropTable(
            name: "applications");

        migrationBuilder.DropTable(
            name: "workspaces");

        migrationBuilder.DropIndex(
            name: "ix_modules_application_id",
            table: "modules");

        migrationBuilder.DropIndex(
            name: "ix_menus_application_id",
            table: "menus");

        migrationBuilder.DropIndex(
            name: "ix_menus_module_id",
            table: "menus");

        migrationBuilder.DropIndex(
            name: "ix_menus_sub_module_id",
            table: "menus");

        migrationBuilder.DropColumn(
            name: "application_id",
            table: "modules");

        migrationBuilder.DropColumn(
            name: "application_id",
            table: "menus");

        migrationBuilder.DropColumn(
            name: "module_id",
            table: "menus");

        migrationBuilder.DropColumn(
            name: "order",
            table: "menus");

        migrationBuilder.DropColumn(
            name: "sub_module_id",
            table: "menus");

        migrationBuilder.AlterColumn<string>(
            name: "url",
            table: "menus",
            type: "text",
            nullable: true,
            oldClrType: typeof(string),
            oldType: "character varying(250)",
            oldMaxLength: 250,
            oldNullable: true);

        migrationBuilder.AlterColumn<string>(
            name: "label",
            table: "menus",
            type: "character varying(25)",
            maxLength: 25,
            nullable: false,
            oldClrType: typeof(string),
            oldType: "character varying(150)",
            oldMaxLength: 150);

        migrationBuilder.AlterColumn<string>(
            name: "icon",
            table: "menus",
            type: "text",
            nullable: true,
            oldClrType: typeof(string),
            oldType: "character varying(100)",
            oldMaxLength: 100,
            oldNullable: true);

        migrationBuilder.AddColumn<string>(
            name: "application",
            table: "menus",
            type: "character varying(1)",
            maxLength: 1,
            nullable: false,
            defaultValue: "");
    }
}
