using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Mpx.Infrastructure.Data.Migrations;

/// <inheritdoc />
public partial class _20261105081218_AdicionarTrialEInstanciaEmWorkspaceApplication : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            ALTER TABLE workspace_applications ADD COLUMN IF NOT EXISTS trial_start_date timestamp with time zone NULL;
            ALTER TABLE workspace_applications ADD COLUMN IF NOT EXISTS trial_days integer NULL;
            ALTER TABLE workspace_applications ADD COLUMN IF NOT EXISTS trial_used boolean NOT NULL DEFAULT false;
            """);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
    }
}
