using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Mpx.Infrastructure.Data.Migrations;

/// <inheritdoc />
public partial class _20261101201946_AdicionarOnboardingEWorkspaceApplications : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AlterColumn<Guid>(
            name: "user_status_id",
            table: "users",
            type: "uuid",
            nullable: true,
            oldClrType: typeof(Guid),
            oldType: "uuid");

        migrationBuilder.AlterColumn<Guid>(
            name: "corporation_id",
            table: "users",
            type: "uuid",
            nullable: true,
            oldClrType: typeof(Guid),
            oldType: "uuid");

        migrationBuilder.AddColumn<bool>(
            name: "onboarding_completed",
            table: "users",
            type: "boolean",
            nullable: false,
            defaultValue: false);

        migrationBuilder.CreateTable(
            name: "workspace_applications",
            columns: table => new
            {
                workspace_id = table.Column<Guid>(type: "uuid", nullable: false),
                application_id = table.Column<Guid>(type: "uuid", nullable: false),
                corporation_id = table.Column<Guid>(type: "uuid", nullable: false),
                inactive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                system = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_workspace_applications", x => new { x.workspace_id, x.application_id });
                table.ForeignKey(
                    name: "fk_workspace_applications_applications_application_id",
                    column: x => x.application_id,
                    principalTable: "applications",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "fk_workspace_applications_corporations_corporation_id",
                    column: x => x.corporation_id,
                    principalTable: "corporations",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "fk_workspace_applications_workspaces_workspace_id",
                    column: x => x.workspace_id,
                    principalTable: "workspaces",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(
            name: "ix_workspace_applications_application_id",
            table: "workspace_applications",
            column: "application_id");

        migrationBuilder.CreateIndex(
            name: "ix_workspace_applications_corporation_id",
            table: "workspace_applications",
            column: "corporation_id");

        migrationBuilder.Sql("""
            INSERT INTO workspace_applications (workspace_id, application_id, corporation_id, inactive, system)
            SELECT workspace_id, id, corporation_id, inactive, system
            FROM applications
            WHERE workspace_id IS NOT NULL
            ON CONFLICT DO NOTHING;
            """);

        migrationBuilder.DropForeignKey(
            name: "fk_applications_workspaces_workspace_id",
            table: "applications");

        migrationBuilder.DropIndex(
            name: "ix_applications_workspace_id",
            table: "applications");

        migrationBuilder.DropColumn(
            name: "workspace_id",
            table: "applications");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<Guid>(
            name: "workspace_id",
            table: "applications",
            type: "uuid",
            nullable: false,
            defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

        migrationBuilder.CreateIndex(
            name: "ix_applications_workspace_id",
            table: "applications",
            column: "workspace_id");

        migrationBuilder.AddForeignKey(
            name: "fk_applications_workspaces_workspace_id",
            table: "applications",
            column: "workspace_id",
            principalTable: "workspaces",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.DropTable(
            name: "workspace_applications");

        migrationBuilder.DropColumn(
            name: "onboarding_completed",
            table: "users");

        migrationBuilder.AlterColumn<Guid>(
            name: "user_status_id",
            table: "users",
            type: "uuid",
            nullable: false,
            defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
            oldClrType: typeof(Guid),
            oldType: "uuid",
            oldNullable: true);

        migrationBuilder.AlterColumn<Guid>(
            name: "corporation_id",
            table: "users",
            type: "uuid",
            nullable: false,
            defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
            oldClrType: typeof(Guid),
            oldType: "uuid",
            oldNullable: true);
    }
}
