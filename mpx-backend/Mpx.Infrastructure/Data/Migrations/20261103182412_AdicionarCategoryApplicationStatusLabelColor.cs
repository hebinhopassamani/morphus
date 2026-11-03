using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Mpx.Infrastructure.Data.Migrations;

/// <inheritdoc />
public partial class _20261103182412_AdicionarCategoryApplicationStatusLabelColor : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "color",
            table: "workspaces",
            type: "character varying(50)",
            maxLength: 50,
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "color",
            table: "user_status",
            type: "character varying(50)",
            maxLength: 50,
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "label",
            table: "user_status",
            type: "character varying(100)",
            maxLength: 100,
            nullable: false,
            defaultValue: "");

        migrationBuilder.AddColumn<string>(
            name: "color",
            table: "corporations",
            type: "character varying(50)",
            maxLength: 50,
            nullable: true);

        migrationBuilder.AddColumn<Guid>(
            name: "application_status_id",
            table: "applications",
            type: "uuid",
            nullable: true);

        migrationBuilder.AddColumn<Guid>(
            name: "category_id",
            table: "applications",
            type: "uuid",
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "color",
            table: "applications",
            type: "character varying(50)",
            maxLength: 50,
            nullable: true);

        migrationBuilder.CreateTable(
            name: "application_statuses",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                label = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false, defaultValue: ""),
                color = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                corporation_id = table.Column<Guid>(type: "uuid", nullable: false),
                description = table.Column<string>(type: "text", nullable: true),
                key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false, defaultValue: ""),
                system = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                inactive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_application_statuses", x => x.id);
                table.ForeignKey(
                    name: "fk_application_statuses_corporations_corporation_id",
                    column: x => x.corporation_id,
                    principalTable: "corporations",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateTable(
            name: "categories",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                label = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false, defaultValue: ""),
                color = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                corporation_id = table.Column<Guid>(type: "uuid", nullable: false),
                description = table.Column<string>(type: "text", nullable: true),
                key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false, defaultValue: ""),
                system = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                inactive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_categories", x => x.id);
                table.ForeignKey(
                    name: "fk_categories_corporations_corporation_id",
                    column: x => x.corporation_id,
                    principalTable: "corporations",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateIndex(
            name: "ix_applications_application_status_id",
            table: "applications",
            column: "application_status_id");

        migrationBuilder.CreateIndex(
            name: "ix_applications_category_id",
            table: "applications",
            column: "category_id");

        migrationBuilder.CreateIndex(
            name: "ix_application_statuses_corporation_id",
            table: "application_statuses",
            column: "corporation_id");

        migrationBuilder.CreateIndex(
            name: "ix_application_statuses_key",
            table: "application_statuses",
            column: "key",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_categories_corporation_id",
            table: "categories",
            column: "corporation_id");

        migrationBuilder.CreateIndex(
            name: "ix_categories_key",
            table: "categories",
            column: "key",
            unique: true);

        migrationBuilder.AddForeignKey(
            name: "fk_applications_application_statuses_application_status_id",
            table: "applications",
            column: "application_status_id",
            principalTable: "application_statuses",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_applications_categories_category_id",
            table: "applications",
            column: "category_id",
            principalTable: "categories",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "fk_applications_application_statuses_application_status_id",
            table: "applications");

        migrationBuilder.DropForeignKey(
            name: "fk_applications_categories_category_id",
            table: "applications");

        migrationBuilder.DropTable(
            name: "application_statuses");

        migrationBuilder.DropTable(
            name: "categories");

        migrationBuilder.DropIndex(
            name: "ix_applications_application_status_id",
            table: "applications");

        migrationBuilder.DropIndex(
            name: "ix_applications_category_id",
            table: "applications");

        migrationBuilder.DropColumn(
            name: "color",
            table: "workspaces");

        migrationBuilder.DropColumn(
            name: "color",
            table: "user_status");

        migrationBuilder.DropColumn(
            name: "label",
            table: "user_status");

        migrationBuilder.DropColumn(
            name: "color",
            table: "corporations");

        migrationBuilder.DropColumn(
            name: "application_status_id",
            table: "applications");

        migrationBuilder.DropColumn(
            name: "category_id",
            table: "applications");

        migrationBuilder.DropColumn(
            name: "color",
            table: "applications");
    }
}
