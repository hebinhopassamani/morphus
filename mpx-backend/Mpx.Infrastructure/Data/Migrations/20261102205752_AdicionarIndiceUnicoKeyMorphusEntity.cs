using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Mpx.Infrastructure.Data.Migrations;

/// <inheritdoc />
public partial class _20261102205752_AdicionarIndiceUnicoKeyMorphusEntity : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            UPDATE corporations SET key = UPPER(SUBSTRING(REPLACE(gen_random_uuid()::text, '-', ''), 1, 12));
            UPDATE workspaces SET key = UPPER(SUBSTRING(REPLACE(gen_random_uuid()::text, '-', ''), 1, 12));
            UPDATE applications SET key = UPPER(SUBSTRING(REPLACE(gen_random_uuid()::text, '-', ''), 1, 12));
            UPDATE modules SET key = UPPER(SUBSTRING(REPLACE(gen_random_uuid()::text, '-', ''), 1, 12));
            UPDATE sub_modules SET key = UPPER(SUBSTRING(REPLACE(gen_random_uuid()::text, '-', ''), 1, 12));
            UPDATE roles SET key = UPPER(SUBSTRING(REPLACE(gen_random_uuid()::text, '-', ''), 1, 12));
            UPDATE claims SET key = UPPER(SUBSTRING(REPLACE(gen_random_uuid()::text, '-', ''), 1, 12));
            UPDATE menus SET key = UPPER(SUBSTRING(REPLACE(gen_random_uuid()::text, '-', ''), 1, 12));
            UPDATE users SET key = UPPER(SUBSTRING(REPLACE(gen_random_uuid()::text, '-', ''), 1, 12));
            UPDATE user_status SET key = UPPER(SUBSTRING(REPLACE(gen_random_uuid()::text, '-', ''), 1, 12));
            UPDATE emails SET key = UPPER(SUBSTRING(REPLACE(gen_random_uuid()::text, '-', ''), 1, 12));
            UPDATE emails_to SET key = UPPER(SUBSTRING(REPLACE(gen_random_uuid()::text, '-', ''), 1, 12));
            UPDATE emails_from SET key = UPPER(SUBSTRING(REPLACE(gen_random_uuid()::text, '-', ''), 1, 12));
            UPDATE emails_cc SET key = UPPER(SUBSTRING(REPLACE(gen_random_uuid()::text, '-', ''), 1, 12));
            UPDATE emails_bcc SET key = UPPER(SUBSTRING(REPLACE(gen_random_uuid()::text, '-', ''), 1, 12));
            UPDATE applications SET system = true;
            """);

        migrationBuilder.CreateIndex(
            name: "ix_workspaces_key",
            table: "workspaces",
            column: "key",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_users_key",
            table: "users",
            column: "key",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_user_status_key",
            table: "user_status",
            column: "key",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_sub_modules_key",
            table: "sub_modules",
            column: "key",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_roles_key",
            table: "roles",
            column: "key",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_modules_key",
            table: "modules",
            column: "key",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_menus_key",
            table: "menus",
            column: "key",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_emails_to_key",
            table: "emails_to",
            column: "key",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_emails_from_key",
            table: "emails_from",
            column: "key",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_emails_cc_key",
            table: "emails_cc",
            column: "key",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_emails_bcc_key",
            table: "emails_bcc",
            column: "key",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_emails_key",
            table: "emails",
            column: "key",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_corporations_key",
            table: "corporations",
            column: "key",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_claims_key",
            table: "claims",
            column: "key",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_applications_key",
            table: "applications",
            column: "key",
            unique: true);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropIndex(
            name: "ix_workspaces_key",
            table: "workspaces");

        migrationBuilder.DropIndex(
            name: "ix_users_key",
            table: "users");

        migrationBuilder.DropIndex(
            name: "ix_user_status_key",
            table: "user_status");

        migrationBuilder.DropIndex(
            name: "ix_sub_modules_key",
            table: "sub_modules");

        migrationBuilder.DropIndex(
            name: "ix_roles_key",
            table: "roles");

        migrationBuilder.DropIndex(
            name: "ix_modules_key",
            table: "modules");

        migrationBuilder.DropIndex(
            name: "ix_menus_key",
            table: "menus");

        migrationBuilder.DropIndex(
            name: "ix_emails_to_key",
            table: "emails_to");

        migrationBuilder.DropIndex(
            name: "ix_emails_from_key",
            table: "emails_from");

        migrationBuilder.DropIndex(
            name: "ix_emails_cc_key",
            table: "emails_cc");

        migrationBuilder.DropIndex(
            name: "ix_emails_bcc_key",
            table: "emails_bcc");

        migrationBuilder.DropIndex(
            name: "ix_emails_key",
            table: "emails");

        migrationBuilder.DropIndex(
            name: "ix_corporations_key",
            table: "corporations");

        migrationBuilder.DropIndex(
            name: "ix_claims_key",
            table: "claims");

        migrationBuilder.DropIndex(
            name: "ix_applications_key",
            table: "applications");
    }
}
