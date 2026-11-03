using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Mpx.Infrastructure.Data.Migrations;

/// <inheritdoc />
public partial class _20261022020210_AdicionarCorporationIcon : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "icon",
            table: "corporations",
            type: "character varying(100)",
            maxLength: 100,
            nullable: true);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(
            name: "icon",
            table: "corporations");
    }
}
