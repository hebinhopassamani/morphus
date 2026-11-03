using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Mpx.Infrastructure.Data.Migrations;

/// <inheritdoc />
public partial class _20261103184314_SepararSecurityModulesEApplicationModules : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "fk_modules_applications_application_id",
            table: "modules");

        migrationBuilder.DropForeignKey(
            name: "fk_modules_corporations_corporation_id",
            table: "modules");

        migrationBuilder.DropForeignKey(
            name: "fk_sub_modules_corporations_corporation_id",
            table: "sub_modules");

        migrationBuilder.DropForeignKey(
            name: "fk_sub_modules_modules_module_id",
            table: "sub_modules");

        migrationBuilder.RenameTable(
            name: "sub_modules",
            newName: "security_sub_modules");

        migrationBuilder.RenameTable(
            name: "modules",
            newName: "security_modules");

        migrationBuilder.Sql("""
            ALTER INDEX pk_sub_modules RENAME TO pk_security_sub_modules;
            ALTER INDEX pk_modules RENAME TO pk_security_modules;
            """);

        migrationBuilder.RenameIndex(
            name: "ix_sub_modules_module_id",
            table: "security_sub_modules",
            newName: "ix_security_sub_modules_module_id");

        migrationBuilder.RenameIndex(
            name: "ix_sub_modules_key",
            table: "security_sub_modules",
            newName: "ix_security_sub_modules_key");

        migrationBuilder.RenameIndex(
            name: "ix_sub_modules_corporation_id",
            table: "security_sub_modules",
            newName: "ix_security_sub_modules_corporation_id");

        migrationBuilder.RenameIndex(
            name: "ix_modules_key",
            table: "security_modules",
            newName: "ix_security_modules_key");

        migrationBuilder.RenameIndex(
            name: "ix_modules_corporation_id",
            table: "security_modules",
            newName: "ix_security_modules_corporation_id");

        migrationBuilder.RenameIndex(
            name: "ix_modules_application_id",
            table: "security_modules",
            newName: "ix_security_modules_application_id");

        migrationBuilder.CreateTable(
            name: "application_modules",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                label = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                icon = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                color = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                order = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                application_id = table.Column<Guid>(type: "uuid", nullable: false),
                corporation_id = table.Column<Guid>(type: "uuid", nullable: false),
                description = table.Column<string>(type: "text", nullable: true),
                key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false, defaultValue: ""),
                system = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                inactive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_application_modules", x => x.id);
                table.ForeignKey(
                    name: "fk_application_modules_applications_application_id",
                    column: x => x.application_id,
                    principalTable: "applications",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "fk_application_modules_corporations_corporation_id",
                    column: x => x.corporation_id,
                    principalTable: "corporations",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateTable(
            name: "application_sub_modules",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                label = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                icon = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                color = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                order = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                application_module_id = table.Column<Guid>(type: "uuid", nullable: false),
                corporation_id = table.Column<Guid>(type: "uuid", nullable: false),
                description = table.Column<string>(type: "text", nullable: true),
                key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false, defaultValue: ""),
                system = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                inactive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_application_sub_modules", x => x.id);
                table.ForeignKey(
                    name: "fk_application_sub_modules_application_modules_application_mod",
                    column: x => x.application_module_id,
                    principalTable: "application_modules",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "fk_application_sub_modules_corporations_corporation_id",
                    column: x => x.corporation_id,
                    principalTable: "corporations",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateIndex(
            name: "ix_application_modules_application_id",
            table: "application_modules",
            column: "application_id");

        migrationBuilder.CreateIndex(
            name: "ix_application_modules_corporation_id",
            table: "application_modules",
            column: "corporation_id");

        migrationBuilder.CreateIndex(
            name: "ix_application_modules_key",
            table: "application_modules",
            column: "key",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_application_sub_modules_application_module_id",
            table: "application_sub_modules",
            column: "application_module_id");

        migrationBuilder.CreateIndex(
            name: "ix_application_sub_modules_corporation_id",
            table: "application_sub_modules",
            column: "corporation_id");

        migrationBuilder.CreateIndex(
            name: "ix_application_sub_modules_key",
            table: "application_sub_modules",
            column: "key",
            unique: true);

        migrationBuilder.AddForeignKey(
            name: "fk_security_modules_applications_application_id",
            table: "security_modules",
            column: "application_id",
            principalTable: "applications",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_security_modules_corporations_corporation_id",
            table: "security_modules",
            column: "corporation_id",
            principalTable: "corporations",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_security_sub_modules_corporations_corporation_id",
            table: "security_sub_modules",
            column: "corporation_id",
            principalTable: "corporations",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_security_sub_modules_security_modules_module_id",
            table: "security_sub_modules",
            column: "module_id",
            principalTable: "security_modules",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "fk_security_modules_applications_application_id",
            table: "security_modules");

        migrationBuilder.DropForeignKey(
            name: "fk_security_modules_corporations_corporation_id",
            table: "security_modules");

        migrationBuilder.DropForeignKey(
            name: "fk_security_sub_modules_corporations_corporation_id",
            table: "security_sub_modules");

        migrationBuilder.DropForeignKey(
            name: "fk_security_sub_modules_security_modules_module_id",
            table: "security_sub_modules");

        migrationBuilder.DropTable(
            name: "application_sub_modules");

        migrationBuilder.DropTable(
            name: "application_modules");

        migrationBuilder.RenameTable(
            name: "security_sub_modules",
            newName: "sub_modules");

        migrationBuilder.RenameTable(
            name: "security_modules",
            newName: "modules");

        migrationBuilder.Sql("""
            ALTER INDEX pk_security_sub_modules RENAME TO pk_sub_modules;
            ALTER INDEX pk_security_modules RENAME TO pk_modules;
            """);

        migrationBuilder.RenameIndex(
            name: "ix_security_sub_modules_module_id",
            table: "sub_modules",
            newName: "ix_sub_modules_module_id");

        migrationBuilder.RenameIndex(
            name: "ix_security_sub_modules_key",
            table: "sub_modules",
            newName: "ix_sub_modules_key");

        migrationBuilder.RenameIndex(
            name: "ix_security_sub_modules_corporation_id",
            table: "sub_modules",
            newName: "ix_sub_modules_corporation_id");

        migrationBuilder.RenameIndex(
            name: "ix_security_modules_key",
            table: "modules",
            newName: "ix_modules_key");

        migrationBuilder.RenameIndex(
            name: "ix_security_modules_corporation_id",
            table: "modules",
            newName: "ix_modules_corporation_id");

        migrationBuilder.RenameIndex(
            name: "ix_security_modules_application_id",
            table: "modules",
            newName: "ix_modules_application_id");

        migrationBuilder.AddForeignKey(
            name: "fk_modules_applications_application_id",
            table: "modules",
            column: "application_id",
            principalTable: "applications",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_modules_corporations_corporation_id",
            table: "modules",
            column: "corporation_id",
            principalTable: "corporations",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_sub_modules_corporations_corporation_id",
            table: "sub_modules",
            column: "corporation_id",
            principalTable: "corporations",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_sub_modules_modules_module_id",
            table: "sub_modules",
            column: "module_id",
            principalTable: "modules",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);
    }
}
