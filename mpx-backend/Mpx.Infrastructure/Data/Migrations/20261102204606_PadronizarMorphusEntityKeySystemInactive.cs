using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Mpx.Infrastructure.Data.Migrations;

/// <inheritdoc />
public partial class _20261102204606_PadronizarMorphusEntityKeySystemInactive : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AlterColumn<string>(
            name: "key",
            table: "workspaces",
            type: "character varying(100)",
            maxLength: 100,
            nullable: false,
            defaultValue: "",
            oldClrType: typeof(string),
            oldType: "character varying(100)",
            oldMaxLength: 100);

        migrationBuilder.AddColumn<string>(
            name: "key",
            table: "users",
            type: "character varying(100)",
            maxLength: 100,
            nullable: false,
            defaultValue: "");

        migrationBuilder.AlterColumn<string>(
            name: "key",
            table: "user_status",
            type: "character varying(100)",
            maxLength: 100,
            nullable: false,
            defaultValue: "",
            oldClrType: typeof(string),
            oldType: "character varying(150)",
            oldMaxLength: 150);

        migrationBuilder.AddColumn<bool>(
            name: "inactive",
            table: "user_status",
            type: "boolean",
            nullable: false,
            defaultValue: false);

        migrationBuilder.AlterColumn<string>(
            name: "key",
            table: "sub_modules",
            type: "character varying(100)",
            maxLength: 100,
            nullable: false,
            defaultValue: "",
            oldClrType: typeof(string),
            oldType: "character varying(100)",
            oldMaxLength: 100);

        migrationBuilder.AddColumn<bool>(
            name: "inactive",
            table: "sub_modules",
            type: "boolean",
            nullable: false,
            defaultValue: false);

        migrationBuilder.AlterColumn<string>(
            name: "key",
            table: "roles",
            type: "character varying(100)",
            maxLength: 100,
            nullable: false,
            defaultValue: "",
            oldClrType: typeof(string),
            oldType: "character varying(100)",
            oldMaxLength: 100);

        migrationBuilder.AddColumn<bool>(
            name: "inactive",
            table: "roles",
            type: "boolean",
            nullable: false,
            defaultValue: false);

        migrationBuilder.AlterColumn<string>(
            name: "key",
            table: "modules",
            type: "character varying(100)",
            maxLength: 100,
            nullable: false,
            defaultValue: "",
            oldClrType: typeof(string),
            oldType: "character varying(100)",
            oldMaxLength: 100);

        migrationBuilder.AddColumn<bool>(
            name: "inactive",
            table: "modules",
            type: "boolean",
            nullable: false,
            defaultValue: false);

        migrationBuilder.AddColumn<bool>(
            name: "inactive",
            table: "menus",
            type: "boolean",
            nullable: false,
            defaultValue: false);

        migrationBuilder.AddColumn<string>(
            name: "key",
            table: "menus",
            type: "character varying(100)",
            maxLength: 100,
            nullable: false,
            defaultValue: "");

        migrationBuilder.AddColumn<bool>(
            name: "inactive",
            table: "emails_to",
            type: "boolean",
            nullable: false,
            defaultValue: false);

        migrationBuilder.AddColumn<string>(
            name: "key",
            table: "emails_to",
            type: "character varying(100)",
            maxLength: 100,
            nullable: false,
            defaultValue: "");

        migrationBuilder.AddColumn<bool>(
            name: "system",
            table: "emails_to",
            type: "boolean",
            nullable: false,
            defaultValue: false);

        migrationBuilder.AddColumn<bool>(
            name: "inactive",
            table: "emails_from",
            type: "boolean",
            nullable: false,
            defaultValue: false);

        migrationBuilder.AddColumn<string>(
            name: "key",
            table: "emails_from",
            type: "character varying(100)",
            maxLength: 100,
            nullable: false,
            defaultValue: "");

        migrationBuilder.AddColumn<bool>(
            name: "system",
            table: "emails_from",
            type: "boolean",
            nullable: false,
            defaultValue: false);

        migrationBuilder.AddColumn<bool>(
            name: "inactive",
            table: "emails_cc",
            type: "boolean",
            nullable: false,
            defaultValue: false);

        migrationBuilder.AddColumn<string>(
            name: "key",
            table: "emails_cc",
            type: "character varying(100)",
            maxLength: 100,
            nullable: false,
            defaultValue: "");

        migrationBuilder.AddColumn<bool>(
            name: "system",
            table: "emails_cc",
            type: "boolean",
            nullable: false,
            defaultValue: false);

        migrationBuilder.AddColumn<bool>(
            name: "inactive",
            table: "emails_bcc",
            type: "boolean",
            nullable: false,
            defaultValue: false);

        migrationBuilder.AddColumn<string>(
            name: "key",
            table: "emails_bcc",
            type: "character varying(100)",
            maxLength: 100,
            nullable: false,
            defaultValue: "");

        migrationBuilder.AddColumn<bool>(
            name: "system",
            table: "emails_bcc",
            type: "boolean",
            nullable: false,
            defaultValue: false);

        migrationBuilder.AddColumn<bool>(
            name: "inactive",
            table: "emails",
            type: "boolean",
            nullable: false,
            defaultValue: false);

        migrationBuilder.AddColumn<string>(
            name: "key",
            table: "emails",
            type: "character varying(100)",
            maxLength: 100,
            nullable: false,
            defaultValue: "");

        migrationBuilder.AddColumn<bool>(
            name: "system",
            table: "emails",
            type: "boolean",
            nullable: false,
            defaultValue: false);

        migrationBuilder.AlterColumn<string>(
            name: "key",
            table: "corporations",
            type: "character varying(100)",
            maxLength: 100,
            nullable: false,
            defaultValue: "",
            oldClrType: typeof(string),
            oldType: "character varying(100)",
            oldMaxLength: 100);

        migrationBuilder.AddColumn<bool>(
            name: "inactive",
            table: "corporations",
            type: "boolean",
            nullable: false,
            defaultValue: false);

        migrationBuilder.AddColumn<bool>(
            name: "inactive",
            table: "claims",
            type: "boolean",
            nullable: false,
            defaultValue: false);

        migrationBuilder.AddColumn<string>(
            name: "key",
            table: "claims",
            type: "character varying(100)",
            maxLength: 100,
            nullable: false,
            defaultValue: "");

        migrationBuilder.AlterColumn<string>(
            name: "key",
            table: "applications",
            type: "character varying(100)",
            maxLength: 100,
            nullable: false,
            defaultValue: "",
            oldClrType: typeof(string),
            oldType: "character varying(100)",
            oldMaxLength: 100);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(
            name: "key",
            table: "users");

        migrationBuilder.DropColumn(
            name: "inactive",
            table: "user_status");

        migrationBuilder.DropColumn(
            name: "inactive",
            table: "sub_modules");

        migrationBuilder.DropColumn(
            name: "inactive",
            table: "roles");

        migrationBuilder.DropColumn(
            name: "inactive",
            table: "modules");

        migrationBuilder.DropColumn(
            name: "inactive",
            table: "menus");

        migrationBuilder.DropColumn(
            name: "key",
            table: "menus");

        migrationBuilder.DropColumn(
            name: "inactive",
            table: "emails_to");

        migrationBuilder.DropColumn(
            name: "key",
            table: "emails_to");

        migrationBuilder.DropColumn(
            name: "system",
            table: "emails_to");

        migrationBuilder.DropColumn(
            name: "inactive",
            table: "emails_from");

        migrationBuilder.DropColumn(
            name: "key",
            table: "emails_from");

        migrationBuilder.DropColumn(
            name: "system",
            table: "emails_from");

        migrationBuilder.DropColumn(
            name: "inactive",
            table: "emails_cc");

        migrationBuilder.DropColumn(
            name: "key",
            table: "emails_cc");

        migrationBuilder.DropColumn(
            name: "system",
            table: "emails_cc");

        migrationBuilder.DropColumn(
            name: "inactive",
            table: "emails_bcc");

        migrationBuilder.DropColumn(
            name: "key",
            table: "emails_bcc");

        migrationBuilder.DropColumn(
            name: "system",
            table: "emails_bcc");

        migrationBuilder.DropColumn(
            name: "inactive",
            table: "emails");

        migrationBuilder.DropColumn(
            name: "key",
            table: "emails");

        migrationBuilder.DropColumn(
            name: "system",
            table: "emails");

        migrationBuilder.DropColumn(
            name: "inactive",
            table: "corporations");

        migrationBuilder.DropColumn(
            name: "inactive",
            table: "claims");

        migrationBuilder.DropColumn(
            name: "key",
            table: "claims");

        migrationBuilder.AlterColumn<string>(
            name: "key",
            table: "workspaces",
            type: "character varying(100)",
            maxLength: 100,
            nullable: false,
            oldClrType: typeof(string),
            oldType: "character varying(100)",
            oldMaxLength: 100,
            oldDefaultValue: "");

        migrationBuilder.AlterColumn<string>(
            name: "key",
            table: "user_status",
            type: "character varying(150)",
            maxLength: 150,
            nullable: false,
            oldClrType: typeof(string),
            oldType: "character varying(100)",
            oldMaxLength: 100,
            oldDefaultValue: "");

        migrationBuilder.AlterColumn<string>(
            name: "key",
            table: "sub_modules",
            type: "character varying(100)",
            maxLength: 100,
            nullable: false,
            oldClrType: typeof(string),
            oldType: "character varying(100)",
            oldMaxLength: 100,
            oldDefaultValue: "");

        migrationBuilder.AlterColumn<string>(
            name: "key",
            table: "roles",
            type: "character varying(100)",
            maxLength: 100,
            nullable: false,
            oldClrType: typeof(string),
            oldType: "character varying(100)",
            oldMaxLength: 100,
            oldDefaultValue: "");

        migrationBuilder.AlterColumn<string>(
            name: "key",
            table: "modules",
            type: "character varying(100)",
            maxLength: 100,
            nullable: false,
            oldClrType: typeof(string),
            oldType: "character varying(100)",
            oldMaxLength: 100,
            oldDefaultValue: "");

        migrationBuilder.AlterColumn<string>(
            name: "key",
            table: "corporations",
            type: "character varying(100)",
            maxLength: 100,
            nullable: false,
            oldClrType: typeof(string),
            oldType: "character varying(100)",
            oldMaxLength: 100,
            oldDefaultValue: "");

        migrationBuilder.AlterColumn<string>(
            name: "key",
            table: "applications",
            type: "character varying(100)",
            maxLength: 100,
            nullable: false,
            oldClrType: typeof(string),
            oldType: "character varying(100)",
            oldMaxLength: 100,
            oldDefaultValue: "");
    }
}
