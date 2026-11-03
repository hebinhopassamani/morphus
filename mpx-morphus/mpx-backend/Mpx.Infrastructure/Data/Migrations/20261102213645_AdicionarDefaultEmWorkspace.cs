using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Mpx.Infrastructure.Data.Migrations;

/// <inheritdoc />
public partial class _20261102213645_AdicionarDefaultEmWorkspace : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropIndex(
            name: "ix_workspaces_corporation_id",
            table: "workspaces");

        migrationBuilder.AddColumn<bool>(
            name: "default",
            table: "workspaces",
            type: "boolean",
            nullable: false,
            defaultValue: false);

        migrationBuilder.CreateIndex(
            name: "ix_workspaces_corporation_id",
            table: "workspaces",
            column: "corporation_id",
            unique: true,
            filter: "\"default\" = true");

        migrationBuilder.Sql("""
            UPDATE workspaces w
            SET "default" = true
            WHERE w.id = (
                SELECT w2.id
                FROM workspaces w2
                WHERE w2.corporation_id = w.corporation_id
                ORDER BY w2.system DESC, w2.id
                LIMIT 1
            );
            """);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropIndex(
            name: "ix_workspaces_corporation_id",
            table: "workspaces");

        migrationBuilder.DropColumn(
            name: "default",
            table: "workspaces");

        migrationBuilder.CreateIndex(
            name: "ix_workspaces_corporation_id",
            table: "workspaces",
            column: "corporation_id");
    }
}
