using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Mpx.Infrastructure.Data.Migrations;

/// <inheritdoc />
public partial class _20261021045918_InicializarBancoTenant : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "corporations",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                email = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                system = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                full_name = table.Column<string>(type: "text", nullable: true),
                description = table.Column<string>(type: "text", nullable: true),
                corporation_id = table.Column<Guid>(type: "uuid", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_corporations", x => x.id);
                table.ForeignKey(
                    name: "fk_corporations_corporations_corporation_id",
                    column: x => x.corporation_id,
                    principalTable: "corporations",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateTable(
            name: "emails",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                subject = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: true),
                html_body = table.Column<string>(type: "text", nullable: true),
                text_body = table.Column<string>(type: "text", nullable: true),
                is_html_body = table.Column<bool>(type: "boolean", nullable: false),
                mail_sent = table.Column<bool>(type: "boolean", nullable: false),
                corporation_id = table.Column<Guid>(type: "uuid", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_emails", x => x.id);
                table.ForeignKey(
                    name: "fk_emails_corporations_corporation_id",
                    column: x => x.corporation_id,
                    principalTable: "corporations",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateTable(
            name: "menus",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                label = table.Column<string>(type: "character varying(25)", maxLength: 25, nullable: false),
                application = table.Column<string>(type: "character varying(1)", maxLength: 1, nullable: false),
                system = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                corporation_id = table.Column<Guid>(type: "uuid", nullable: false),
                url = table.Column<string>(type: "text", nullable: true),
                icon = table.Column<string>(type: "text", nullable: true),
                description = table.Column<string>(type: "text", nullable: true),
                menu_id = table.Column<Guid>(type: "uuid", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_menus", x => x.id);
                table.ForeignKey(
                    name: "fk_menus_corporations_corporation_id",
                    column: x => x.corporation_id,
                    principalTable: "corporations",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "fk_menus_menus_menu_id",
                    column: x => x.menu_id,
                    principalTable: "menus",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateTable(
            name: "modules",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                system = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                corporation_id = table.Column<Guid>(type: "uuid", nullable: false),
                description = table.Column<string>(type: "text", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_modules", x => x.id);
                table.ForeignKey(
                    name: "fk_modules_corporations_corporation_id",
                    column: x => x.corporation_id,
                    principalTable: "corporations",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateTable(
            name: "user_status",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                key = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                system = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                corporation_id = table.Column<Guid>(type: "uuid", nullable: false),
                description = table.Column<string>(type: "text", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_user_status", x => x.id);
                table.ForeignKey(
                    name: "fk_user_status_corporations_corporation_id",
                    column: x => x.corporation_id,
                    principalTable: "corporations",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateTable(
            name: "emails_bcc",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                mail = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                email_id = table.Column<Guid>(type: "uuid", nullable: false),
                corporation_id = table.Column<Guid>(type: "uuid", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_emails_bcc", x => x.id);
                table.ForeignKey(
                    name: "fk_emails_bcc_corporations_corporation_id",
                    column: x => x.corporation_id,
                    principalTable: "corporations",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "fk_emails_bcc_emails_email_id",
                    column: x => x.email_id,
                    principalTable: "emails",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "emails_cc",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                mail = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                email_id = table.Column<Guid>(type: "uuid", nullable: false),
                corporation_id = table.Column<Guid>(type: "uuid", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_emails_cc", x => x.id);
                table.ForeignKey(
                    name: "fk_emails_cc_corporations_corporation_id",
                    column: x => x.corporation_id,
                    principalTable: "corporations",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "fk_emails_cc_emails_email_id",
                    column: x => x.email_id,
                    principalTable: "emails",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "emails_from",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                mail = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                email_id = table.Column<Guid>(type: "uuid", nullable: false),
                corporation_id = table.Column<Guid>(type: "uuid", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_emails_from", x => x.id);
                table.ForeignKey(
                    name: "fk_emails_from_corporations_corporation_id",
                    column: x => x.corporation_id,
                    principalTable: "corporations",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "fk_emails_from_emails_email_id",
                    column: x => x.email_id,
                    principalTable: "emails",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "emails_to",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                mail = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                email_id = table.Column<Guid>(type: "uuid", nullable: false),
                corporation_id = table.Column<Guid>(type: "uuid", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_emails_to", x => x.id);
                table.ForeignKey(
                    name: "fk_emails_to_corporations_corporation_id",
                    column: x => x.corporation_id,
                    principalTable: "corporations",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "fk_emails_to_emails_email_id",
                    column: x => x.email_id,
                    principalTable: "emails",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "sub_modules",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                system = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                module_id = table.Column<Guid>(type: "uuid", nullable: false),
                corporation_id = table.Column<Guid>(type: "uuid", nullable: false),
                description = table.Column<string>(type: "text", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_sub_modules", x => x.id);
                table.ForeignKey(
                    name: "fk_sub_modules_corporations_corporation_id",
                    column: x => x.corporation_id,
                    principalTable: "corporations",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "fk_sub_modules_modules_module_id",
                    column: x => x.module_id,
                    principalTable: "modules",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateTable(
            name: "users",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                email = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                email_confirmed = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                phone_confirmed = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                terms_confirmed = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                system = table.Column<bool>(type: "boolean", nullable: false),
                user_status_id = table.Column<Guid>(type: "uuid", nullable: false),
                corporation_id = table.Column<Guid>(type: "uuid", nullable: false),
                password_hash = table.Column<string>(type: "text", nullable: true),
                nick_name = table.Column<string>(type: "text", nullable: true),
                picture = table.Column<string>(type: "text", nullable: true),
                phone_number = table.Column<string>(type: "text", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_users", x => x.id);
                table.ForeignKey(
                    name: "fk_users_corporations_corporation_id",
                    column: x => x.corporation_id,
                    principalTable: "corporations",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "fk_users_user_status_user_status_id",
                    column: x => x.user_status_id,
                    principalTable: "user_status",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateIndex(
            name: "ix_corporations_corporation_id",
            table: "corporations",
            column: "corporation_id");

        migrationBuilder.CreateIndex(
            name: "ix_emails_corporation_id",
            table: "emails",
            column: "corporation_id");

        migrationBuilder.CreateIndex(
            name: "ix_emails_bcc_corporation_id",
            table: "emails_bcc",
            column: "corporation_id");

        migrationBuilder.CreateIndex(
            name: "ix_emails_bcc_email_id",
            table: "emails_bcc",
            column: "email_id");

        migrationBuilder.CreateIndex(
            name: "ix_emails_cc_corporation_id",
            table: "emails_cc",
            column: "corporation_id");

        migrationBuilder.CreateIndex(
            name: "ix_emails_cc_email_id",
            table: "emails_cc",
            column: "email_id");

        migrationBuilder.CreateIndex(
            name: "ix_emails_from_corporation_id",
            table: "emails_from",
            column: "corporation_id");

        migrationBuilder.CreateIndex(
            name: "ix_emails_from_email_id",
            table: "emails_from",
            column: "email_id");

        migrationBuilder.CreateIndex(
            name: "ix_emails_to_corporation_id",
            table: "emails_to",
            column: "corporation_id");

        migrationBuilder.CreateIndex(
            name: "ix_emails_to_email_id",
            table: "emails_to",
            column: "email_id");

        migrationBuilder.CreateIndex(
            name: "ix_menus_corporation_id",
            table: "menus",
            column: "corporation_id");

        migrationBuilder.CreateIndex(
            name: "ix_menus_menu_id",
            table: "menus",
            column: "menu_id");

        migrationBuilder.CreateIndex(
            name: "ix_modules_corporation_id",
            table: "modules",
            column: "corporation_id");

        migrationBuilder.CreateIndex(
            name: "ix_sub_modules_corporation_id",
            table: "sub_modules",
            column: "corporation_id");

        migrationBuilder.CreateIndex(
            name: "ix_sub_modules_module_id",
            table: "sub_modules",
            column: "module_id");

        migrationBuilder.CreateIndex(
            name: "ix_user_status_corporation_id",
            table: "user_status",
            column: "corporation_id");

        migrationBuilder.CreateIndex(
            name: "ix_users_corporation_id",
            table: "users",
            column: "corporation_id");

        migrationBuilder.CreateIndex(
            name: "ix_users_user_status_id",
            table: "users",
            column: "user_status_id");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "emails_bcc");

        migrationBuilder.DropTable(
            name: "emails_cc");

        migrationBuilder.DropTable(
            name: "emails_from");

        migrationBuilder.DropTable(
            name: "emails_to");

        migrationBuilder.DropTable(
            name: "menus");

        migrationBuilder.DropTable(
            name: "sub_modules");

        migrationBuilder.DropTable(
            name: "users");

        migrationBuilder.DropTable(
            name: "emails");

        migrationBuilder.DropTable(
            name: "modules");

        migrationBuilder.DropTable(
            name: "user_status");

        migrationBuilder.DropTable(
            name: "corporations");
    }
}
