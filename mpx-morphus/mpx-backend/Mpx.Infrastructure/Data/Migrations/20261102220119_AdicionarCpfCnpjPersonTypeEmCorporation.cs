using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Mpx.Infrastructure.Data.Migrations;

/// <inheritdoc />
public partial class _20261102220119_AdicionarCpfCnpjPersonTypeEmCorporation : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "cpf_cnpj",
            table: "corporations",
            type: "character varying(14)",
            maxLength: 14,
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "person_type",
            table: "corporations",
            type: "character varying(2)",
            maxLength: 2,
            nullable: false,
            defaultValue: "PJ");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(
            name: "cpf_cnpj",
            table: "corporations");

        migrationBuilder.DropColumn(
            name: "person_type",
            table: "corporations");
    }
}
