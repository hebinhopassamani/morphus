using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Mpx.Infrastructure.Data.Migrations;

/// <inheritdoc />
public partial class _20261021133924_AdicionarTabelasSegurancaRolesClaims : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AlterColumn<bool>(
            name: "system",
            table: "users",
            type: "boolean",
            nullable: false,
            defaultValue: false,
            oldClrType: typeof(bool),
            oldType: "boolean");

        migrationBuilder.AlterColumn<string>(
            name: "picture",
            table: "users",
            type: "character varying(250)",
            maxLength: 250,
            nullable: true,
            oldClrType: typeof(string),
            oldType: "text",
            oldNullable: true);

        migrationBuilder.AlterColumn<string>(
            name: "phone_number",
            table: "users",
            type: "character varying(30)",
            maxLength: 30,
            nullable: true,
            oldClrType: typeof(string),
            oldType: "text",
            oldNullable: true);

        migrationBuilder.AlterColumn<string>(
            name: "password_hash",
            table: "users",
            type: "character varying(250)",
            maxLength: 250,
            nullable: true,
            oldClrType: typeof(string),
            oldType: "text",
            oldNullable: true);

        migrationBuilder.AlterColumn<string>(
            name: "nick_name",
            table: "users",
            type: "character varying(100)",
            maxLength: 100,
            nullable: true,
            oldClrType: typeof(string),
            oldType: "text",
            oldNullable: true);

        migrationBuilder.AddColumn<DateTime>(
            name: "birthdate",
            table: "users",
            type: "timestamp with time zone",
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "gender",
            table: "users",
            type: "character varying(10)",
            maxLength: 10,
            nullable: true);

        migrationBuilder.AddColumn<bool>(
            name: "inactive",
            table: "users",
            type: "boolean",
            nullable: false,
            defaultValue: false);

        migrationBuilder.AddColumn<string>(
            name: "refresh_token",
            table: "users",
            type: "character varying(250)",
            maxLength: 250,
            nullable: true);

        migrationBuilder.AddColumn<DateTime>(
            name: "refresh_token_expiration",
            table: "users",
            type: "timestamp with time zone",
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "security_stamp",
            table: "users",
            type: "character varying(250)",
            maxLength: 250,
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "website",
            table: "users",
            type: "character varying(150)",
            maxLength: 150,
            nullable: true);

        migrationBuilder.CreateTable(
            name: "claims",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                claim_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                claim_value = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                system = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                corporation_id = table.Column<Guid>(type: "uuid", nullable: false),
                module_id = table.Column<Guid>(type: "uuid", nullable: false),
                sub_module_id = table.Column<Guid>(type: "uuid", nullable: false),
                description = table.Column<string>(type: "text", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_claims", x => x.id);
                table.ForeignKey(
                    name: "fk_claims_corporations_corporation_id",
                    column: x => x.corporation_id,
                    principalTable: "corporations",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "fk_claims_modules_module_id",
                    column: x => x.module_id,
                    principalTable: "modules",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "fk_claims_sub_modules_sub_module_id",
                    column: x => x.sub_module_id,
                    principalTable: "sub_modules",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "corporation_users",
            columns: table => new
            {
                corporation_id = table.Column<Guid>(type: "uuid", nullable: false),
                user_id = table.Column<Guid>(type: "uuid", nullable: false),
                inactive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                system = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                is_owner = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_corporation_users", x => new { x.corporation_id, x.user_id });
                table.ForeignKey(
                    name: "fk_corporation_users_corporations_corporation_id",
                    column: x => x.corporation_id,
                    principalTable: "corporations",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "fk_corporation_users_users_user_id",
                    column: x => x.user_id,
                    principalTable: "users",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "roles",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                system = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                corporation_id = table.Column<Guid>(type: "uuid", nullable: false),
                module_id = table.Column<Guid>(type: "uuid", nullable: false),
                sub_module_id = table.Column<Guid>(type: "uuid", nullable: false),
                description = table.Column<string>(type: "text", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_roles", x => x.id);
                table.ForeignKey(
                    name: "fk_roles_corporations_corporation_id",
                    column: x => x.corporation_id,
                    principalTable: "corporations",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "fk_roles_modules_module_id",
                    column: x => x.module_id,
                    principalTable: "modules",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "fk_roles_sub_modules_sub_module_id",
                    column: x => x.sub_module_id,
                    principalTable: "sub_modules",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "user_claims",
            columns: table => new
            {
                user_id = table.Column<Guid>(type: "uuid", nullable: false),
                claim_id = table.Column<Guid>(type: "uuid", nullable: false),
                corporation_id = table.Column<Guid>(type: "uuid", nullable: false),
                inactive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                system = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_user_claims", x => new { x.user_id, x.claim_id });
                table.ForeignKey(
                    name: "fk_user_claims_claims_claim_id",
                    column: x => x.claim_id,
                    principalTable: "claims",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "fk_user_claims_corporations_corporation_id",
                    column: x => x.corporation_id,
                    principalTable: "corporations",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "fk_user_claims_users_user_id",
                    column: x => x.user_id,
                    principalTable: "users",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "role_claims",
            columns: table => new
            {
                role_id = table.Column<Guid>(type: "uuid", nullable: false),
                claim_id = table.Column<Guid>(type: "uuid", nullable: false),
                corporation_id = table.Column<Guid>(type: "uuid", nullable: false),
                inactive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                system = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_role_claims", x => new { x.role_id, x.claim_id });
                table.ForeignKey(
                    name: "fk_role_claims_claims_claim_id",
                    column: x => x.claim_id,
                    principalTable: "claims",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "fk_role_claims_corporations_corporation_id",
                    column: x => x.corporation_id,
                    principalTable: "corporations",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "fk_role_claims_roles_role_id",
                    column: x => x.role_id,
                    principalTable: "roles",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "user_roles",
            columns: table => new
            {
                user_id = table.Column<Guid>(type: "uuid", nullable: false),
                role_id = table.Column<Guid>(type: "uuid", nullable: false),
                corporation_id = table.Column<Guid>(type: "uuid", nullable: false),
                inactive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                system = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_user_roles", x => new { x.user_id, x.role_id });
                table.ForeignKey(
                    name: "fk_user_roles_corporations_corporation_id",
                    column: x => x.corporation_id,
                    principalTable: "corporations",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "fk_user_roles_roles_role_id",
                    column: x => x.role_id,
                    principalTable: "roles",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "fk_user_roles_users_user_id",
                    column: x => x.user_id,
                    principalTable: "users",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(
            name: "ix_users_email",
            table: "users",
            column: "email",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_claims_corporation_id",
            table: "claims",
            column: "corporation_id");

        migrationBuilder.CreateIndex(
            name: "ix_claims_module_id",
            table: "claims",
            column: "module_id");

        migrationBuilder.CreateIndex(
            name: "ix_claims_sub_module_id",
            table: "claims",
            column: "sub_module_id");

        migrationBuilder.CreateIndex(
            name: "ix_corporation_users_user_id",
            table: "corporation_users",
            column: "user_id");

        migrationBuilder.CreateIndex(
            name: "ix_role_claims_claim_id",
            table: "role_claims",
            column: "claim_id");

        migrationBuilder.CreateIndex(
            name: "ix_role_claims_corporation_id",
            table: "role_claims",
            column: "corporation_id");

        migrationBuilder.CreateIndex(
            name: "ix_roles_corporation_id",
            table: "roles",
            column: "corporation_id");

        migrationBuilder.CreateIndex(
            name: "ix_roles_module_id",
            table: "roles",
            column: "module_id");

        migrationBuilder.CreateIndex(
            name: "ix_roles_sub_module_id",
            table: "roles",
            column: "sub_module_id");

        migrationBuilder.CreateIndex(
            name: "ix_user_claims_claim_id",
            table: "user_claims",
            column: "claim_id");

        migrationBuilder.CreateIndex(
            name: "ix_user_claims_corporation_id",
            table: "user_claims",
            column: "corporation_id");

        migrationBuilder.CreateIndex(
            name: "ix_user_roles_corporation_id",
            table: "user_roles",
            column: "corporation_id");

        migrationBuilder.CreateIndex(
            name: "ix_user_roles_role_id",
            table: "user_roles",
            column: "role_id");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "corporation_users");

        migrationBuilder.DropTable(
            name: "role_claims");

        migrationBuilder.DropTable(
            name: "user_claims");

        migrationBuilder.DropTable(
            name: "user_roles");

        migrationBuilder.DropTable(
            name: "claims");

        migrationBuilder.DropTable(
            name: "roles");

        migrationBuilder.DropIndex(
            name: "ix_users_email",
            table: "users");

        migrationBuilder.DropColumn(
            name: "birthdate",
            table: "users");

        migrationBuilder.DropColumn(
            name: "gender",
            table: "users");

        migrationBuilder.DropColumn(
            name: "inactive",
            table: "users");

        migrationBuilder.DropColumn(
            name: "refresh_token",
            table: "users");

        migrationBuilder.DropColumn(
            name: "refresh_token_expiration",
            table: "users");

        migrationBuilder.DropColumn(
            name: "security_stamp",
            table: "users");

        migrationBuilder.DropColumn(
            name: "website",
            table: "users");

        migrationBuilder.AlterColumn<bool>(
            name: "system",
            table: "users",
            type: "boolean",
            nullable: false,
            oldClrType: typeof(bool),
            oldType: "boolean",
            oldDefaultValue: false);

        migrationBuilder.AlterColumn<string>(
            name: "picture",
            table: "users",
            type: "text",
            nullable: true,
            oldClrType: typeof(string),
            oldType: "character varying(250)",
            oldMaxLength: 250,
            oldNullable: true);

        migrationBuilder.AlterColumn<string>(
            name: "phone_number",
            table: "users",
            type: "text",
            nullable: true,
            oldClrType: typeof(string),
            oldType: "character varying(30)",
            oldMaxLength: 30,
            oldNullable: true);

        migrationBuilder.AlterColumn<string>(
            name: "password_hash",
            table: "users",
            type: "text",
            nullable: true,
            oldClrType: typeof(string),
            oldType: "character varying(250)",
            oldMaxLength: 250,
            oldNullable: true);

        migrationBuilder.AlterColumn<string>(
            name: "nick_name",
            table: "users",
            type: "text",
            nullable: true,
            oldClrType: typeof(string),
            oldType: "character varying(100)",
            oldMaxLength: 100,
            oldNullable: true);
    }
}
