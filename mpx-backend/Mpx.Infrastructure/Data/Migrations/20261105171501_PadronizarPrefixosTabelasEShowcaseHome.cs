using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Mpx.Infrastructure.Data.Migrations;

/// <inheritdoc />
public partial class _20261105171501_PadronizarPrefixosTabelasEShowcaseHome : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "fk_application_modules_applications_application_id",
            table: "application_modules");

        migrationBuilder.DropForeignKey(
            name: "fk_application_modules_corporations_corporation_id",
            table: "application_modules");

        migrationBuilder.DropForeignKey(
            name: "fk_application_statuses_corporations_corporation_id",
            table: "application_statuses");

        migrationBuilder.DropForeignKey(
            name: "fk_application_sub_modules_application_modules_application_mod",
            table: "application_sub_modules");

        migrationBuilder.DropForeignKey(
            name: "fk_application_sub_modules_corporations_corporation_id",
            table: "application_sub_modules");

        migrationBuilder.DropForeignKey(
            name: "fk_application_users_applications_application_id",
            table: "application_users");

        migrationBuilder.DropForeignKey(
            name: "fk_application_users_corporations_corporation_id",
            table: "application_users");

        migrationBuilder.DropForeignKey(
            name: "fk_application_users_users_user_id",
            table: "application_users");

        migrationBuilder.DropForeignKey(
            name: "fk_applications_application_statuses_application_status_id",
            table: "applications");

        migrationBuilder.DropForeignKey(
            name: "fk_applications_categories_category_id",
            table: "applications");

        migrationBuilder.DropForeignKey(
            name: "fk_applications_corporations_corporation_id",
            table: "applications");

        migrationBuilder.DropForeignKey(
            name: "fk_categories_corporations_corporation_id",
            table: "categories");

        migrationBuilder.DropForeignKey(
            name: "fk_claims_corporations_corporation_id",
            table: "claims");

        migrationBuilder.DropForeignKey(
            name: "fk_claims_modules_module_id",
            table: "claims");

        migrationBuilder.DropForeignKey(
            name: "fk_claims_sub_modules_sub_module_id",
            table: "claims");

        migrationBuilder.DropForeignKey(
            name: "fk_corporation_users_corporations_corporation_id",
            table: "corporation_users");

        migrationBuilder.DropForeignKey(
            name: "fk_corporation_users_users_user_id",
            table: "corporation_users");

        migrationBuilder.DropForeignKey(
            name: "fk_corporations_corporations_corporation_id",
            table: "corporations");

        migrationBuilder.DropForeignKey(
            name: "fk_emails_corporations_corporation_id",
            table: "emails");

        migrationBuilder.DropForeignKey(
            name: "fk_emails_bcc_corporations_corporation_id",
            table: "emails_bcc");

        migrationBuilder.DropForeignKey(
            name: "fk_emails_bcc_emails_email_id",
            table: "emails_bcc");

        migrationBuilder.DropForeignKey(
            name: "fk_emails_cc_corporations_corporation_id",
            table: "emails_cc");

        migrationBuilder.DropForeignKey(
            name: "fk_emails_cc_emails_email_id",
            table: "emails_cc");

        migrationBuilder.DropForeignKey(
            name: "fk_emails_from_corporations_corporation_id",
            table: "emails_from");

        migrationBuilder.DropForeignKey(
            name: "fk_emails_from_emails_email_id",
            table: "emails_from");

        migrationBuilder.DropForeignKey(
            name: "fk_emails_to_corporations_corporation_id",
            table: "emails_to");

        migrationBuilder.DropForeignKey(
            name: "fk_emails_to_emails_email_id",
            table: "emails_to");

        migrationBuilder.DropForeignKey(
            name: "fk_menus_applications_application_id",
            table: "menus");

        migrationBuilder.DropForeignKey(
            name: "fk_menus_corporations_corporation_id",
            table: "menus");

        migrationBuilder.DropForeignKey(
            name: "fk_menus_menus_menu_id",
            table: "menus");

        migrationBuilder.DropForeignKey(
            name: "fk_menus_modules_module_id",
            table: "menus");

        migrationBuilder.DropForeignKey(
            name: "fk_menus_sub_modules_sub_module_id",
            table: "menus");

        migrationBuilder.DropForeignKey(
            name: "fk_role_claims_claims_claim_id",
            table: "role_claims");

        migrationBuilder.DropForeignKey(
            name: "fk_role_claims_corporations_corporation_id",
            table: "role_claims");

        migrationBuilder.DropForeignKey(
            name: "fk_role_claims_roles_role_id",
            table: "role_claims");

        migrationBuilder.DropForeignKey(
            name: "fk_roles_corporations_corporation_id",
            table: "roles");

        migrationBuilder.DropForeignKey(
            name: "fk_roles_modules_module_id",
            table: "roles");

        migrationBuilder.DropForeignKey(
            name: "fk_roles_sub_modules_sub_module_id",
            table: "roles");

        migrationBuilder.DropForeignKey(
            name: "fk_security_modules_applications_application_id",
            table: "security_modules");

        migrationBuilder.DropForeignKey(
            name: "fk_security_modules_corporations_corporation_id",
            table: "security_modules");

        migrationBuilder.DropForeignKey(
            name: "fk_security_sub_modules_corporations_corporation_id",
            table: "security_sub_modules");

        migrationBuilder.DropForeignKey(
            name: "fk_security_sub_modules_security_modules_module_id",
            table: "security_sub_modules");

        migrationBuilder.DropForeignKey(
            name: "fk_user_claims_claims_claim_id",
            table: "user_claims");

        migrationBuilder.DropForeignKey(
            name: "fk_user_claims_corporations_corporation_id",
            table: "user_claims");

        migrationBuilder.DropForeignKey(
            name: "fk_user_claims_users_user_id",
            table: "user_claims");

        migrationBuilder.DropForeignKey(
            name: "fk_user_roles_corporations_corporation_id",
            table: "user_roles");

        migrationBuilder.DropForeignKey(
            name: "fk_user_roles_roles_role_id",
            table: "user_roles");

        migrationBuilder.DropForeignKey(
            name: "fk_user_roles_users_user_id",
            table: "user_roles");

        migrationBuilder.DropForeignKey(
            name: "fk_user_status_corporations_corporation_id",
            table: "user_status");

        migrationBuilder.DropForeignKey(
            name: "fk_users_corporations_corporation_id",
            table: "users");

        migrationBuilder.DropForeignKey(
            name: "fk_users_user_status_user_status_id",
            table: "users");

        migrationBuilder.DropForeignKey(
            name: "fk_workspace_applications_applications_application_id",
            table: "workspace_applications");

        migrationBuilder.DropForeignKey(
            name: "fk_workspace_applications_corporations_corporation_id",
            table: "workspace_applications");

        migrationBuilder.DropForeignKey(
            name: "fk_workspace_applications_workspaces_workspace_id",
            table: "workspace_applications");

        migrationBuilder.DropForeignKey(
            name: "fk_workspace_users_corporations_corporation_id",
            table: "workspace_users");

        migrationBuilder.DropForeignKey(
            name: "fk_workspace_users_users_user_id",
            table: "workspace_users");

        migrationBuilder.DropForeignKey(
            name: "fk_workspace_users_workspaces_workspace_id",
            table: "workspace_users");

        migrationBuilder.DropForeignKey(
            name: "fk_workspaces_corporations_corporation_id",
            table: "workspaces");

        migrationBuilder.DropPrimaryKey(
            name: "pk_workspaces",
            table: "workspaces");

        migrationBuilder.DropPrimaryKey(
            name: "pk_workspace_users",
            table: "workspace_users");

        migrationBuilder.DropPrimaryKey(
            name: "pk_workspace_applications",
            table: "workspace_applications");

        migrationBuilder.DropPrimaryKey(
            name: "pk_users",
            table: "users");

        migrationBuilder.DropPrimaryKey(
            name: "pk_user_status",
            table: "user_status");

        migrationBuilder.DropPrimaryKey(
            name: "pk_user_roles",
            table: "user_roles");

        migrationBuilder.DropPrimaryKey(
            name: "pk_user_claims",
            table: "user_claims");

        migrationBuilder.DropPrimaryKey(
            name: "pk_security_sub_modules",
            table: "security_sub_modules");

        migrationBuilder.DropPrimaryKey(
            name: "pk_security_modules",
            table: "security_modules");

        migrationBuilder.DropPrimaryKey(
            name: "pk_roles",
            table: "roles");

        migrationBuilder.DropPrimaryKey(
            name: "pk_role_claims",
            table: "role_claims");

        migrationBuilder.DropPrimaryKey(
            name: "pk_menus",
            table: "menus");

        migrationBuilder.DropPrimaryKey(
            name: "pk_emails_to",
            table: "emails_to");

        migrationBuilder.DropPrimaryKey(
            name: "pk_emails_from",
            table: "emails_from");

        migrationBuilder.DropPrimaryKey(
            name: "pk_emails_cc",
            table: "emails_cc");

        migrationBuilder.DropPrimaryKey(
            name: "pk_emails_bcc",
            table: "emails_bcc");

        migrationBuilder.DropPrimaryKey(
            name: "pk_emails",
            table: "emails");

        migrationBuilder.DropPrimaryKey(
            name: "pk_corporations",
            table: "corporations");

        migrationBuilder.DropPrimaryKey(
            name: "pk_corporation_users",
            table: "corporation_users");

        migrationBuilder.DropPrimaryKey(
            name: "pk_claims",
            table: "claims");

        migrationBuilder.DropPrimaryKey(
            name: "pk_categories",
            table: "categories");

        migrationBuilder.DropPrimaryKey(
            name: "pk_applications",
            table: "applications");

        migrationBuilder.DropIndex(
            name: "ix_applications_corporation_id",
            table: "applications");

        migrationBuilder.DropPrimaryKey(
            name: "pk_application_users",
            table: "application_users");

        migrationBuilder.DropPrimaryKey(
            name: "pk_application_sub_modules",
            table: "application_sub_modules");

        migrationBuilder.DropPrimaryKey(
            name: "pk_application_statuses",
            table: "application_statuses");

        migrationBuilder.DropPrimaryKey(
            name: "pk_application_modules",
            table: "application_modules");

        migrationBuilder.RenameTable(
            name: "workspaces",
            newName: "mpx_workspaces");

        migrationBuilder.RenameTable(
            name: "workspace_users",
            newName: "mpx_workspace_users");

        migrationBuilder.RenameTable(
            name: "workspace_applications",
            newName: "mpx_workspace_applications");

        migrationBuilder.RenameTable(
            name: "users",
            newName: "sec_users");

        migrationBuilder.RenameTable(
            name: "user_status",
            newName: "sec_user_statuses");

        migrationBuilder.RenameTable(
            name: "user_roles",
            newName: "sec_user_roles");

        migrationBuilder.RenameTable(
            name: "user_claims",
            newName: "sec_user_claims");

        migrationBuilder.RenameTable(
            name: "security_sub_modules",
            newName: "sec_sub_modules");

        migrationBuilder.RenameTable(
            name: "security_modules",
            newName: "sec_modules");

        migrationBuilder.RenameTable(
            name: "roles",
            newName: "sec_roles");

        migrationBuilder.RenameTable(
            name: "role_claims",
            newName: "sec_role_claims");

        migrationBuilder.RenameTable(
            name: "menus",
            newName: "mpx_menus");

        migrationBuilder.RenameTable(
            name: "emails_to",
            newName: "mpx_emails_to");

        migrationBuilder.RenameTable(
            name: "emails_from",
            newName: "mpx_emails_from");

        migrationBuilder.RenameTable(
            name: "emails_cc",
            newName: "mpx_emails_cc");

        migrationBuilder.RenameTable(
            name: "emails_bcc",
            newName: "mpx_emails_bcc");

        migrationBuilder.RenameTable(
            name: "emails",
            newName: "mpx_emails");

        migrationBuilder.RenameTable(
            name: "corporations",
            newName: "mpx_corporations");

        migrationBuilder.RenameTable(
            name: "corporation_users",
            newName: "mpx_corporation_users");

        migrationBuilder.RenameTable(
            name: "claims",
            newName: "sec_claims");

        migrationBuilder.RenameTable(
            name: "categories",
            newName: "mpx_categories");

        migrationBuilder.RenameTable(
            name: "applications",
            newName: "mpx_applications");

        migrationBuilder.RenameTable(
            name: "application_users",
            newName: "mpx_application_users");

        migrationBuilder.RenameTable(
            name: "application_sub_modules",
            newName: "mpx_application_sub_modules");

        migrationBuilder.RenameTable(
            name: "application_statuses",
            newName: "mpx_application_statuses");

        migrationBuilder.RenameTable(
            name: "application_modules",
            newName: "mpx_application_modules");

        migrationBuilder.RenameIndex(
            name: "ix_workspaces_key",
            table: "mpx_workspaces",
            newName: "ix_mpx_workspaces_key");

        migrationBuilder.RenameIndex(
            name: "ix_workspaces_corporation_id",
            table: "mpx_workspaces",
            newName: "ix_mpx_workspaces_corporation_id");

        migrationBuilder.RenameIndex(
            name: "ix_workspace_users_user_id",
            table: "mpx_workspace_users",
            newName: "ix_mpx_workspace_users_user_id");

        migrationBuilder.RenameIndex(
            name: "ix_workspace_users_corporation_id",
            table: "mpx_workspace_users",
            newName: "ix_mpx_workspace_users_corporation_id");

        migrationBuilder.RenameIndex(
            name: "ix_workspace_applications_corporation_id",
            table: "mpx_workspace_applications",
            newName: "ix_mpx_workspace_applications_corporation_id");

        migrationBuilder.RenameIndex(
            name: "ix_workspace_applications_application_id",
            table: "mpx_workspace_applications",
            newName: "ix_mpx_workspace_applications_application_id");

        migrationBuilder.RenameIndex(
            name: "ix_users_user_status_id",
            table: "sec_users",
            newName: "ix_sec_users_user_status_id");

        migrationBuilder.RenameIndex(
            name: "ix_users_key",
            table: "sec_users",
            newName: "ix_sec_users_key");

        migrationBuilder.RenameIndex(
            name: "ix_users_email",
            table: "sec_users",
            newName: "ix_sec_users_email");

        migrationBuilder.RenameIndex(
            name: "ix_users_corporation_id",
            table: "sec_users",
            newName: "ix_sec_users_corporation_id");

        migrationBuilder.RenameIndex(
            name: "ix_user_status_key",
            table: "sec_user_statuses",
            newName: "ix_sec_user_statuses_key");

        migrationBuilder.RenameIndex(
            name: "ix_user_status_corporation_id",
            table: "sec_user_statuses",
            newName: "ix_sec_user_statuses_corporation_id");

        migrationBuilder.RenameIndex(
            name: "ix_user_roles_role_id",
            table: "sec_user_roles",
            newName: "ix_sec_user_roles_role_id");

        migrationBuilder.RenameIndex(
            name: "ix_user_roles_corporation_id",
            table: "sec_user_roles",
            newName: "ix_sec_user_roles_corporation_id");

        migrationBuilder.RenameIndex(
            name: "ix_user_claims_corporation_id",
            table: "sec_user_claims",
            newName: "ix_sec_user_claims_corporation_id");

        migrationBuilder.RenameIndex(
            name: "ix_user_claims_claim_id",
            table: "sec_user_claims",
            newName: "ix_sec_user_claims_claim_id");

        migrationBuilder.RenameIndex(
            name: "ix_security_sub_modules_module_id",
            table: "sec_sub_modules",
            newName: "ix_sec_sub_modules_module_id");

        migrationBuilder.RenameIndex(
            name: "ix_security_sub_modules_key",
            table: "sec_sub_modules",
            newName: "ix_sec_sub_modules_key");

        migrationBuilder.RenameIndex(
            name: "ix_security_sub_modules_corporation_id",
            table: "sec_sub_modules",
            newName: "ix_sec_sub_modules_corporation_id");

        migrationBuilder.RenameIndex(
            name: "ix_security_modules_key",
            table: "sec_modules",
            newName: "ix_sec_modules_key");

        migrationBuilder.RenameIndex(
            name: "ix_security_modules_corporation_id",
            table: "sec_modules",
            newName: "ix_sec_modules_corporation_id");

        migrationBuilder.RenameIndex(
            name: "ix_security_modules_application_id",
            table: "sec_modules",
            newName: "ix_sec_modules_application_id");

        migrationBuilder.RenameIndex(
            name: "ix_roles_sub_module_id",
            table: "sec_roles",
            newName: "ix_sec_roles_sub_module_id");

        migrationBuilder.RenameIndex(
            name: "ix_roles_module_id",
            table: "sec_roles",
            newName: "ix_sec_roles_module_id");

        migrationBuilder.RenameIndex(
            name: "ix_roles_key",
            table: "sec_roles",
            newName: "ix_sec_roles_key");

        migrationBuilder.RenameIndex(
            name: "ix_roles_corporation_id",
            table: "sec_roles",
            newName: "ix_sec_roles_corporation_id");

        migrationBuilder.RenameIndex(
            name: "ix_role_claims_corporation_id",
            table: "sec_role_claims",
            newName: "ix_sec_role_claims_corporation_id");

        migrationBuilder.RenameIndex(
            name: "ix_role_claims_claim_id",
            table: "sec_role_claims",
            newName: "ix_sec_role_claims_claim_id");

        migrationBuilder.RenameIndex(
            name: "ix_menus_sub_module_id",
            table: "mpx_menus",
            newName: "ix_mpx_menus_sub_module_id");

        migrationBuilder.RenameIndex(
            name: "ix_menus_module_id",
            table: "mpx_menus",
            newName: "ix_mpx_menus_module_id");

        migrationBuilder.RenameIndex(
            name: "ix_menus_menu_id",
            table: "mpx_menus",
            newName: "ix_mpx_menus_menu_id");

        migrationBuilder.RenameIndex(
            name: "ix_menus_key",
            table: "mpx_menus",
            newName: "ix_mpx_menus_key");

        migrationBuilder.RenameIndex(
            name: "ix_menus_corporation_id",
            table: "mpx_menus",
            newName: "ix_mpx_menus_corporation_id");

        migrationBuilder.RenameIndex(
            name: "ix_menus_application_id",
            table: "mpx_menus",
            newName: "ix_mpx_menus_application_id");

        migrationBuilder.RenameIndex(
            name: "ix_emails_to_key",
            table: "mpx_emails_to",
            newName: "ix_mpx_emails_to_key");

        migrationBuilder.RenameIndex(
            name: "ix_emails_to_email_id",
            table: "mpx_emails_to",
            newName: "ix_mpx_emails_to_email_id");

        migrationBuilder.RenameIndex(
            name: "ix_emails_to_corporation_id",
            table: "mpx_emails_to",
            newName: "ix_mpx_emails_to_corporation_id");

        migrationBuilder.RenameIndex(
            name: "ix_emails_from_key",
            table: "mpx_emails_from",
            newName: "ix_mpx_emails_from_key");

        migrationBuilder.RenameIndex(
            name: "ix_emails_from_email_id",
            table: "mpx_emails_from",
            newName: "ix_mpx_emails_from_email_id");

        migrationBuilder.RenameIndex(
            name: "ix_emails_from_corporation_id",
            table: "mpx_emails_from",
            newName: "ix_mpx_emails_from_corporation_id");

        migrationBuilder.RenameIndex(
            name: "ix_emails_cc_key",
            table: "mpx_emails_cc",
            newName: "ix_mpx_emails_cc_key");

        migrationBuilder.RenameIndex(
            name: "ix_emails_cc_email_id",
            table: "mpx_emails_cc",
            newName: "ix_mpx_emails_cc_email_id");

        migrationBuilder.RenameIndex(
            name: "ix_emails_cc_corporation_id",
            table: "mpx_emails_cc",
            newName: "ix_mpx_emails_cc_corporation_id");

        migrationBuilder.RenameIndex(
            name: "ix_emails_bcc_key",
            table: "mpx_emails_bcc",
            newName: "ix_mpx_emails_bcc_key");

        migrationBuilder.RenameIndex(
            name: "ix_emails_bcc_email_id",
            table: "mpx_emails_bcc",
            newName: "ix_mpx_emails_bcc_email_id");

        migrationBuilder.RenameIndex(
            name: "ix_emails_bcc_corporation_id",
            table: "mpx_emails_bcc",
            newName: "ix_mpx_emails_bcc_corporation_id");

        migrationBuilder.RenameIndex(
            name: "ix_emails_key",
            table: "mpx_emails",
            newName: "ix_mpx_emails_key");

        migrationBuilder.RenameIndex(
            name: "ix_emails_corporation_id",
            table: "mpx_emails",
            newName: "ix_mpx_emails_corporation_id");

        migrationBuilder.RenameIndex(
            name: "ix_corporations_key",
            table: "mpx_corporations",
            newName: "ix_mpx_corporations_key");

        migrationBuilder.RenameIndex(
            name: "ix_corporations_corporation_id",
            table: "mpx_corporations",
            newName: "ix_mpx_corporations_corporation_id");

        migrationBuilder.RenameIndex(
            name: "ix_corporation_users_user_id",
            table: "mpx_corporation_users",
            newName: "ix_mpx_corporation_users_user_id");

        migrationBuilder.RenameIndex(
            name: "ix_claims_sub_module_id",
            table: "sec_claims",
            newName: "ix_sec_claims_sub_module_id");

        migrationBuilder.RenameIndex(
            name: "ix_claims_module_id",
            table: "sec_claims",
            newName: "ix_sec_claims_module_id");

        migrationBuilder.RenameIndex(
            name: "ix_claims_key",
            table: "sec_claims",
            newName: "ix_sec_claims_key");

        migrationBuilder.RenameIndex(
            name: "ix_claims_corporation_id",
            table: "sec_claims",
            newName: "ix_sec_claims_corporation_id");

        migrationBuilder.RenameIndex(
            name: "ix_categories_key",
            table: "mpx_categories",
            newName: "ix_mpx_categories_key");

        migrationBuilder.RenameIndex(
            name: "ix_categories_corporation_id",
            table: "mpx_categories",
            newName: "ix_mpx_categories_corporation_id");

        migrationBuilder.RenameIndex(
            name: "ix_applications_key",
            table: "mpx_applications",
            newName: "ix_mpx_applications_key");

        migrationBuilder.RenameIndex(
            name: "ix_applications_category_id",
            table: "mpx_applications",
            newName: "ix_mpx_applications_category_id");

        migrationBuilder.RenameIndex(
            name: "ix_applications_application_status_id",
            table: "mpx_applications",
            newName: "ix_mpx_applications_application_status_id");

        migrationBuilder.RenameIndex(
            name: "ix_application_users_user_id",
            table: "mpx_application_users",
            newName: "ix_mpx_application_users_user_id");

        migrationBuilder.RenameIndex(
            name: "ix_application_users_corporation_id",
            table: "mpx_application_users",
            newName: "ix_mpx_application_users_corporation_id");

        migrationBuilder.RenameIndex(
            name: "ix_application_sub_modules_key",
            table: "mpx_application_sub_modules",
            newName: "ix_mpx_application_sub_modules_key");

        migrationBuilder.RenameIndex(
            name: "ix_application_sub_modules_corporation_id",
            table: "mpx_application_sub_modules",
            newName: "ix_mpx_application_sub_modules_corporation_id");

        migrationBuilder.RenameIndex(
            name: "ix_application_sub_modules_application_module_id",
            table: "mpx_application_sub_modules",
            newName: "ix_mpx_application_sub_modules_application_module_id");

        migrationBuilder.RenameIndex(
            name: "ix_application_statuses_key",
            table: "mpx_application_statuses",
            newName: "ix_mpx_application_statuses_key");

        migrationBuilder.RenameIndex(
            name: "ix_application_statuses_corporation_id",
            table: "mpx_application_statuses",
            newName: "ix_mpx_application_statuses_corporation_id");

        migrationBuilder.RenameIndex(
            name: "ix_application_modules_key",
            table: "mpx_application_modules",
            newName: "ix_mpx_application_modules_key");

        migrationBuilder.RenameIndex(
            name: "ix_application_modules_corporation_id",
            table: "mpx_application_modules",
            newName: "ix_mpx_application_modules_corporation_id");

        migrationBuilder.RenameIndex(
            name: "ix_application_modules_application_id",
            table: "mpx_application_modules",
            newName: "ix_mpx_application_modules_application_id");

        migrationBuilder.AddColumn<Guid>(
            name: "shared_with_workspace_id",
            table: "mpx_workspace_applications",
            type: "uuid",
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "prefix",
            table: "mpx_applications",
            type: "character varying(3)",
            maxLength: 3,
            nullable: false,
            defaultValue: "");

        migrationBuilder.AddPrimaryKey(
            name: "pk_mpx_workspaces",
            table: "mpx_workspaces",
            column: "id");

        migrationBuilder.AddPrimaryKey(
            name: "pk_mpx_workspace_users",
            table: "mpx_workspace_users",
            columns: new[] { "workspace_id", "user_id" });

        migrationBuilder.AddPrimaryKey(
            name: "pk_mpx_workspace_applications",
            table: "mpx_workspace_applications",
            columns: new[] { "workspace_id", "application_id" });

        migrationBuilder.AddPrimaryKey(
            name: "pk_sec_users",
            table: "sec_users",
            column: "id");

        migrationBuilder.AddPrimaryKey(
            name: "pk_sec_user_statuses",
            table: "sec_user_statuses",
            column: "id");

        migrationBuilder.AddPrimaryKey(
            name: "pk_sec_user_roles",
            table: "sec_user_roles",
            columns: new[] { "user_id", "role_id" });

        migrationBuilder.AddPrimaryKey(
            name: "pk_sec_user_claims",
            table: "sec_user_claims",
            columns: new[] { "user_id", "claim_id" });

        migrationBuilder.AddPrimaryKey(
            name: "pk_sec_sub_modules",
            table: "sec_sub_modules",
            column: "id");

        migrationBuilder.AddPrimaryKey(
            name: "pk_sec_modules",
            table: "sec_modules",
            column: "id");

        migrationBuilder.AddPrimaryKey(
            name: "pk_sec_roles",
            table: "sec_roles",
            column: "id");

        migrationBuilder.AddPrimaryKey(
            name: "pk_sec_role_claims",
            table: "sec_role_claims",
            columns: new[] { "role_id", "claim_id" });

        migrationBuilder.AddPrimaryKey(
            name: "pk_mpx_menus",
            table: "mpx_menus",
            column: "id");

        migrationBuilder.AddPrimaryKey(
            name: "pk_mpx_emails_to",
            table: "mpx_emails_to",
            column: "id");

        migrationBuilder.AddPrimaryKey(
            name: "pk_mpx_emails_from",
            table: "mpx_emails_from",
            column: "id");

        migrationBuilder.AddPrimaryKey(
            name: "pk_mpx_emails_cc",
            table: "mpx_emails_cc",
            column: "id");

        migrationBuilder.AddPrimaryKey(
            name: "pk_mpx_emails_bcc",
            table: "mpx_emails_bcc",
            column: "id");

        migrationBuilder.AddPrimaryKey(
            name: "pk_mpx_emails",
            table: "mpx_emails",
            column: "id");

        migrationBuilder.AddPrimaryKey(
            name: "pk_mpx_corporations",
            table: "mpx_corporations",
            column: "id");

        migrationBuilder.AddPrimaryKey(
            name: "pk_mpx_corporation_users",
            table: "mpx_corporation_users",
            columns: new[] { "corporation_id", "user_id" });

        migrationBuilder.AddPrimaryKey(
            name: "pk_sec_claims",
            table: "sec_claims",
            column: "id");

        migrationBuilder.AddPrimaryKey(
            name: "pk_mpx_categories",
            table: "mpx_categories",
            column: "id");

        migrationBuilder.AddPrimaryKey(
            name: "pk_mpx_applications",
            table: "mpx_applications",
            column: "id");

        migrationBuilder.AddPrimaryKey(
            name: "pk_mpx_application_users",
            table: "mpx_application_users",
            columns: new[] { "application_id", "user_id" });

        migrationBuilder.AddPrimaryKey(
            name: "pk_mpx_application_sub_modules",
            table: "mpx_application_sub_modules",
            column: "id");

        migrationBuilder.AddPrimaryKey(
            name: "pk_mpx_application_statuses",
            table: "mpx_application_statuses",
            column: "id");

        migrationBuilder.AddPrimaryKey(
            name: "pk_mpx_application_modules",
            table: "mpx_application_modules",
            column: "id");

        migrationBuilder.CreateTable(
            name: "mpx_features",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                highlight_phrase = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                description = table.Column<string>(type: "text", nullable: false),
                order = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false, defaultValue: ""),
                system = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                inactive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_mpx_features", x => x.id);
            });

        migrationBuilder.CreateTable(
            name: "mpx_module_categories",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                color = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                order = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false, defaultValue: ""),
                system = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                inactive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_mpx_module_categories", x => x.id);
            });

        migrationBuilder.CreateTable(
            name: "mpx_feature_highlights",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                feature_id = table.Column<Guid>(type: "uuid", nullable: false),
                title = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                title_icon = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                highlight = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                highlight_icon = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                order = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false, defaultValue: ""),
                system = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                inactive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_mpx_feature_highlights", x => x.id);
                table.ForeignKey(
                    name: "fk_mpx_feature_highlights_mpx_features_feature_id",
                    column: x => x.feature_id,
                    principalTable: "mpx_features",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "mpx_modules",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                category_id = table.Column<Guid>(type: "uuid", nullable: false),
                icon = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                title = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                description = table.Column<string>(type: "text", nullable: false),
                action_text = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                order = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false, defaultValue: ""),
                system = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                inactive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_mpx_modules", x => x.id);
                table.ForeignKey(
                    name: "fk_mpx_modules_mpx_module_categories_category_id",
                    column: x => x.category_id,
                    principalTable: "mpx_module_categories",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateIndex(
            name: "ix_mpx_applications_corporation_id_prefix",
            table: "mpx_applications",
            columns: new[] { "corporation_id", "prefix" },
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_mpx_feature_highlights_feature_id",
            table: "mpx_feature_highlights",
            column: "feature_id");

        migrationBuilder.CreateIndex(
            name: "ix_mpx_feature_highlights_key",
            table: "mpx_feature_highlights",
            column: "key",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_mpx_features_key",
            table: "mpx_features",
            column: "key",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_mpx_module_categories_key",
            table: "mpx_module_categories",
            column: "key",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_mpx_modules_category_id",
            table: "mpx_modules",
            column: "category_id");

        migrationBuilder.CreateIndex(
            name: "ix_mpx_modules_key",
            table: "mpx_modules",
            column: "key",
            unique: true);

        migrationBuilder.AddForeignKey(
            name: "fk_mpx_application_modules_corporations_corporation_id",
            table: "mpx_application_modules",
            column: "corporation_id",
            principalTable: "mpx_corporations",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_mpx_application_modules_mpx_applications_application_id",
            table: "mpx_application_modules",
            column: "application_id",
            principalTable: "mpx_applications",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_mpx_application_statuses_corporations_corporation_id",
            table: "mpx_application_statuses",
            column: "corporation_id",
            principalTable: "mpx_corporations",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_mpx_application_sub_modules_corporations_corporation_id",
            table: "mpx_application_sub_modules",
            column: "corporation_id",
            principalTable: "mpx_corporations",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_mpx_application_sub_modules_mpx_application_modules_applica",
            table: "mpx_application_sub_modules",
            column: "application_module_id",
            principalTable: "mpx_application_modules",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_mpx_application_users_corporations_corporation_id",
            table: "mpx_application_users",
            column: "corporation_id",
            principalTable: "mpx_corporations",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_mpx_application_users_mpx_applications_application_id",
            table: "mpx_application_users",
            column: "application_id",
            principalTable: "mpx_applications",
            principalColumn: "id",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "fk_mpx_application_users_users_user_id",
            table: "mpx_application_users",
            column: "user_id",
            principalTable: "sec_users",
            principalColumn: "id",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "fk_mpx_applications_application_statuses_application_status_id",
            table: "mpx_applications",
            column: "application_status_id",
            principalTable: "mpx_application_statuses",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_mpx_applications_categories_category_id",
            table: "mpx_applications",
            column: "category_id",
            principalTable: "mpx_categories",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_mpx_applications_corporations_corporation_id",
            table: "mpx_applications",
            column: "corporation_id",
            principalTable: "mpx_corporations",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_mpx_categories_corporations_corporation_id",
            table: "mpx_categories",
            column: "corporation_id",
            principalTable: "mpx_corporations",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_mpx_corporation_users_mpx_corporations_corporation_id",
            table: "mpx_corporation_users",
            column: "corporation_id",
            principalTable: "mpx_corporations",
            principalColumn: "id",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "fk_mpx_corporation_users_users_user_id",
            table: "mpx_corporation_users",
            column: "user_id",
            principalTable: "sec_users",
            principalColumn: "id",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "fk_mpx_corporations_mpx_corporations_corporation_id",
            table: "mpx_corporations",
            column: "corporation_id",
            principalTable: "mpx_corporations",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_mpx_emails_mpx_corporations_corporation_id",
            table: "mpx_emails",
            column: "corporation_id",
            principalTable: "mpx_corporations",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_mpx_emails_bcc_emails_email_id",
            table: "mpx_emails_bcc",
            column: "email_id",
            principalTable: "mpx_emails",
            principalColumn: "id",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "fk_mpx_emails_bcc_mpx_corporations_corporation_id",
            table: "mpx_emails_bcc",
            column: "corporation_id",
            principalTable: "mpx_corporations",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_mpx_emails_cc_emails_email_id",
            table: "mpx_emails_cc",
            column: "email_id",
            principalTable: "mpx_emails",
            principalColumn: "id",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "fk_mpx_emails_cc_mpx_corporations_corporation_id",
            table: "mpx_emails_cc",
            column: "corporation_id",
            principalTable: "mpx_corporations",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_mpx_emails_from_mpx_corporations_corporation_id",
            table: "mpx_emails_from",
            column: "corporation_id",
            principalTable: "mpx_corporations",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_mpx_emails_from_mpx_emails_email_id",
            table: "mpx_emails_from",
            column: "email_id",
            principalTable: "mpx_emails",
            principalColumn: "id",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "fk_mpx_emails_to_mpx_corporations_corporation_id",
            table: "mpx_emails_to",
            column: "corporation_id",
            principalTable: "mpx_corporations",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_mpx_emails_to_mpx_emails_email_id",
            table: "mpx_emails_to",
            column: "email_id",
            principalTable: "mpx_emails",
            principalColumn: "id",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "fk_mpx_menus_modules_module_id",
            table: "mpx_menus",
            column: "module_id",
            principalTable: "sec_modules",
            principalColumn: "id",
            onDelete: ReferentialAction.SetNull);

        migrationBuilder.AddForeignKey(
            name: "fk_mpx_menus_mpx_applications_application_id",
            table: "mpx_menus",
            column: "application_id",
            principalTable: "mpx_applications",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_mpx_menus_mpx_corporations_corporation_id",
            table: "mpx_menus",
            column: "corporation_id",
            principalTable: "mpx_corporations",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_mpx_menus_mpx_menus_menu_id",
            table: "mpx_menus",
            column: "menu_id",
            principalTable: "mpx_menus",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_mpx_menus_sub_modules_sub_module_id",
            table: "mpx_menus",
            column: "sub_module_id",
            principalTable: "sec_sub_modules",
            principalColumn: "id",
            onDelete: ReferentialAction.SetNull);

        migrationBuilder.AddForeignKey(
            name: "fk_mpx_workspace_applications_mpx_applications_application_id",
            table: "mpx_workspace_applications",
            column: "application_id",
            principalTable: "mpx_applications",
            principalColumn: "id",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "fk_mpx_workspace_applications_mpx_corporations_corporation_id",
            table: "mpx_workspace_applications",
            column: "corporation_id",
            principalTable: "mpx_corporations",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_mpx_workspace_applications_workspaces_workspace_id",
            table: "mpx_workspace_applications",
            column: "workspace_id",
            principalTable: "mpx_workspaces",
            principalColumn: "id",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "fk_mpx_workspace_users_mpx_corporations_corporation_id",
            table: "mpx_workspace_users",
            column: "corporation_id",
            principalTable: "mpx_corporations",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_mpx_workspace_users_mpx_workspaces_workspace_id",
            table: "mpx_workspace_users",
            column: "workspace_id",
            principalTable: "mpx_workspaces",
            principalColumn: "id",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "fk_mpx_workspace_users_sec_users_user_id",
            table: "mpx_workspace_users",
            column: "user_id",
            principalTable: "sec_users",
            principalColumn: "id",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "fk_mpx_workspaces_mpx_corporations_corporation_id",
            table: "mpx_workspaces",
            column: "corporation_id",
            principalTable: "mpx_corporations",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_sec_claims_corporations_corporation_id",
            table: "sec_claims",
            column: "corporation_id",
            principalTable: "mpx_corporations",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_sec_claims_modules_module_id",
            table: "sec_claims",
            column: "module_id",
            principalTable: "sec_modules",
            principalColumn: "id",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "fk_sec_claims_sub_modules_sub_module_id",
            table: "sec_claims",
            column: "sub_module_id",
            principalTable: "sec_sub_modules",
            principalColumn: "id",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "fk_sec_modules_mpx_applications_application_id",
            table: "sec_modules",
            column: "application_id",
            principalTable: "mpx_applications",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_sec_modules_mpx_corporations_corporation_id",
            table: "sec_modules",
            column: "corporation_id",
            principalTable: "mpx_corporations",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_sec_role_claims_mpx_corporations_corporation_id",
            table: "sec_role_claims",
            column: "corporation_id",
            principalTable: "mpx_corporations",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_sec_role_claims_roles_role_id",
            table: "sec_role_claims",
            column: "role_id",
            principalTable: "sec_roles",
            principalColumn: "id",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "fk_sec_role_claims_sec_claims_claim_id",
            table: "sec_role_claims",
            column: "claim_id",
            principalTable: "sec_claims",
            principalColumn: "id",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "fk_sec_roles_mpx_corporations_corporation_id",
            table: "sec_roles",
            column: "corporation_id",
            principalTable: "mpx_corporations",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_sec_roles_sec_modules_module_id",
            table: "sec_roles",
            column: "module_id",
            principalTable: "sec_modules",
            principalColumn: "id",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "fk_sec_roles_sub_modules_sub_module_id",
            table: "sec_roles",
            column: "sub_module_id",
            principalTable: "sec_sub_modules",
            principalColumn: "id",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "fk_sec_sub_modules_mpx_corporations_corporation_id",
            table: "sec_sub_modules",
            column: "corporation_id",
            principalTable: "mpx_corporations",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_sec_sub_modules_sec_modules_module_id",
            table: "sec_sub_modules",
            column: "module_id",
            principalTable: "sec_modules",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_sec_user_claims_mpx_corporations_corporation_id",
            table: "sec_user_claims",
            column: "corporation_id",
            principalTable: "mpx_corporations",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_sec_user_claims_sec_claims_claim_id",
            table: "sec_user_claims",
            column: "claim_id",
            principalTable: "sec_claims",
            principalColumn: "id",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "fk_sec_user_claims_users_user_id",
            table: "sec_user_claims",
            column: "user_id",
            principalTable: "sec_users",
            principalColumn: "id",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "fk_sec_user_roles_mpx_corporations_corporation_id",
            table: "sec_user_roles",
            column: "corporation_id",
            principalTable: "mpx_corporations",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_sec_user_roles_sec_roles_role_id",
            table: "sec_user_roles",
            column: "role_id",
            principalTable: "sec_roles",
            principalColumn: "id",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "fk_sec_user_roles_sec_users_user_id",
            table: "sec_user_roles",
            column: "user_id",
            principalTable: "sec_users",
            principalColumn: "id",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "fk_sec_user_statuses_mpx_corporations_corporation_id",
            table: "sec_user_statuses",
            column: "corporation_id",
            principalTable: "mpx_corporations",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_sec_users_mpx_corporations_corporation_id",
            table: "sec_users",
            column: "corporation_id",
            principalTable: "mpx_corporations",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_sec_users_user_status_user_status_id",
            table: "sec_users",
            column: "user_status_id",
            principalTable: "sec_user_statuses",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "fk_mpx_application_modules_corporations_corporation_id",
            table: "mpx_application_modules");

        migrationBuilder.DropForeignKey(
            name: "fk_mpx_application_modules_mpx_applications_application_id",
            table: "mpx_application_modules");

        migrationBuilder.DropForeignKey(
            name: "fk_mpx_application_statuses_corporations_corporation_id",
            table: "mpx_application_statuses");

        migrationBuilder.DropForeignKey(
            name: "fk_mpx_application_sub_modules_corporations_corporation_id",
            table: "mpx_application_sub_modules");

        migrationBuilder.DropForeignKey(
            name: "fk_mpx_application_sub_modules_mpx_application_modules_applica",
            table: "mpx_application_sub_modules");

        migrationBuilder.DropForeignKey(
            name: "fk_mpx_application_users_corporations_corporation_id",
            table: "mpx_application_users");

        migrationBuilder.DropForeignKey(
            name: "fk_mpx_application_users_mpx_applications_application_id",
            table: "mpx_application_users");

        migrationBuilder.DropForeignKey(
            name: "fk_mpx_application_users_users_user_id",
            table: "mpx_application_users");

        migrationBuilder.DropForeignKey(
            name: "fk_mpx_applications_application_statuses_application_status_id",
            table: "mpx_applications");

        migrationBuilder.DropForeignKey(
            name: "fk_mpx_applications_categories_category_id",
            table: "mpx_applications");

        migrationBuilder.DropForeignKey(
            name: "fk_mpx_applications_corporations_corporation_id",
            table: "mpx_applications");

        migrationBuilder.DropForeignKey(
            name: "fk_mpx_categories_corporations_corporation_id",
            table: "mpx_categories");

        migrationBuilder.DropForeignKey(
            name: "fk_mpx_corporation_users_mpx_corporations_corporation_id",
            table: "mpx_corporation_users");

        migrationBuilder.DropForeignKey(
            name: "fk_mpx_corporation_users_users_user_id",
            table: "mpx_corporation_users");

        migrationBuilder.DropForeignKey(
            name: "fk_mpx_corporations_mpx_corporations_corporation_id",
            table: "mpx_corporations");

        migrationBuilder.DropForeignKey(
            name: "fk_mpx_emails_mpx_corporations_corporation_id",
            table: "mpx_emails");

        migrationBuilder.DropForeignKey(
            name: "fk_mpx_emails_bcc_emails_email_id",
            table: "mpx_emails_bcc");

        migrationBuilder.DropForeignKey(
            name: "fk_mpx_emails_bcc_mpx_corporations_corporation_id",
            table: "mpx_emails_bcc");

        migrationBuilder.DropForeignKey(
            name: "fk_mpx_emails_cc_emails_email_id",
            table: "mpx_emails_cc");

        migrationBuilder.DropForeignKey(
            name: "fk_mpx_emails_cc_mpx_corporations_corporation_id",
            table: "mpx_emails_cc");

        migrationBuilder.DropForeignKey(
            name: "fk_mpx_emails_from_mpx_corporations_corporation_id",
            table: "mpx_emails_from");

        migrationBuilder.DropForeignKey(
            name: "fk_mpx_emails_from_mpx_emails_email_id",
            table: "mpx_emails_from");

        migrationBuilder.DropForeignKey(
            name: "fk_mpx_emails_to_mpx_corporations_corporation_id",
            table: "mpx_emails_to");

        migrationBuilder.DropForeignKey(
            name: "fk_mpx_emails_to_mpx_emails_email_id",
            table: "mpx_emails_to");

        migrationBuilder.DropForeignKey(
            name: "fk_mpx_menus_modules_module_id",
            table: "mpx_menus");

        migrationBuilder.DropForeignKey(
            name: "fk_mpx_menus_mpx_applications_application_id",
            table: "mpx_menus");

        migrationBuilder.DropForeignKey(
            name: "fk_mpx_menus_mpx_corporations_corporation_id",
            table: "mpx_menus");

        migrationBuilder.DropForeignKey(
            name: "fk_mpx_menus_mpx_menus_menu_id",
            table: "mpx_menus");

        migrationBuilder.DropForeignKey(
            name: "fk_mpx_menus_sub_modules_sub_module_id",
            table: "mpx_menus");

        migrationBuilder.DropForeignKey(
            name: "fk_mpx_workspace_applications_mpx_applications_application_id",
            table: "mpx_workspace_applications");

        migrationBuilder.DropForeignKey(
            name: "fk_mpx_workspace_applications_mpx_corporations_corporation_id",
            table: "mpx_workspace_applications");

        migrationBuilder.DropForeignKey(
            name: "fk_mpx_workspace_applications_workspaces_workspace_id",
            table: "mpx_workspace_applications");

        migrationBuilder.DropForeignKey(
            name: "fk_mpx_workspace_users_mpx_corporations_corporation_id",
            table: "mpx_workspace_users");

        migrationBuilder.DropForeignKey(
            name: "fk_mpx_workspace_users_mpx_workspaces_workspace_id",
            table: "mpx_workspace_users");

        migrationBuilder.DropForeignKey(
            name: "fk_mpx_workspace_users_sec_users_user_id",
            table: "mpx_workspace_users");

        migrationBuilder.DropForeignKey(
            name: "fk_mpx_workspaces_mpx_corporations_corporation_id",
            table: "mpx_workspaces");

        migrationBuilder.DropForeignKey(
            name: "fk_sec_claims_corporations_corporation_id",
            table: "sec_claims");

        migrationBuilder.DropForeignKey(
            name: "fk_sec_claims_modules_module_id",
            table: "sec_claims");

        migrationBuilder.DropForeignKey(
            name: "fk_sec_claims_sub_modules_sub_module_id",
            table: "sec_claims");

        migrationBuilder.DropForeignKey(
            name: "fk_sec_modules_mpx_applications_application_id",
            table: "sec_modules");

        migrationBuilder.DropForeignKey(
            name: "fk_sec_modules_mpx_corporations_corporation_id",
            table: "sec_modules");

        migrationBuilder.DropForeignKey(
            name: "fk_sec_role_claims_mpx_corporations_corporation_id",
            table: "sec_role_claims");

        migrationBuilder.DropForeignKey(
            name: "fk_sec_role_claims_roles_role_id",
            table: "sec_role_claims");

        migrationBuilder.DropForeignKey(
            name: "fk_sec_role_claims_sec_claims_claim_id",
            table: "sec_role_claims");

        migrationBuilder.DropForeignKey(
            name: "fk_sec_roles_mpx_corporations_corporation_id",
            table: "sec_roles");

        migrationBuilder.DropForeignKey(
            name: "fk_sec_roles_sec_modules_module_id",
            table: "sec_roles");

        migrationBuilder.DropForeignKey(
            name: "fk_sec_roles_sub_modules_sub_module_id",
            table: "sec_roles");

        migrationBuilder.DropForeignKey(
            name: "fk_sec_sub_modules_mpx_corporations_corporation_id",
            table: "sec_sub_modules");

        migrationBuilder.DropForeignKey(
            name: "fk_sec_sub_modules_sec_modules_module_id",
            table: "sec_sub_modules");

        migrationBuilder.DropForeignKey(
            name: "fk_sec_user_claims_mpx_corporations_corporation_id",
            table: "sec_user_claims");

        migrationBuilder.DropForeignKey(
            name: "fk_sec_user_claims_sec_claims_claim_id",
            table: "sec_user_claims");

        migrationBuilder.DropForeignKey(
            name: "fk_sec_user_claims_users_user_id",
            table: "sec_user_claims");

        migrationBuilder.DropForeignKey(
            name: "fk_sec_user_roles_mpx_corporations_corporation_id",
            table: "sec_user_roles");

        migrationBuilder.DropForeignKey(
            name: "fk_sec_user_roles_sec_roles_role_id",
            table: "sec_user_roles");

        migrationBuilder.DropForeignKey(
            name: "fk_sec_user_roles_sec_users_user_id",
            table: "sec_user_roles");

        migrationBuilder.DropForeignKey(
            name: "fk_sec_user_statuses_mpx_corporations_corporation_id",
            table: "sec_user_statuses");

        migrationBuilder.DropForeignKey(
            name: "fk_sec_users_mpx_corporations_corporation_id",
            table: "sec_users");

        migrationBuilder.DropForeignKey(
            name: "fk_sec_users_user_status_user_status_id",
            table: "sec_users");

        migrationBuilder.DropTable(
            name: "mpx_feature_highlights");

        migrationBuilder.DropTable(
            name: "mpx_modules");

        migrationBuilder.DropTable(
            name: "mpx_features");

        migrationBuilder.DropTable(
            name: "mpx_module_categories");

        migrationBuilder.DropPrimaryKey(
            name: "pk_sec_users",
            table: "sec_users");

        migrationBuilder.DropPrimaryKey(
            name: "pk_sec_user_statuses",
            table: "sec_user_statuses");

        migrationBuilder.DropPrimaryKey(
            name: "pk_sec_user_roles",
            table: "sec_user_roles");

        migrationBuilder.DropPrimaryKey(
            name: "pk_sec_user_claims",
            table: "sec_user_claims");

        migrationBuilder.DropPrimaryKey(
            name: "pk_sec_sub_modules",
            table: "sec_sub_modules");

        migrationBuilder.DropPrimaryKey(
            name: "pk_sec_roles",
            table: "sec_roles");

        migrationBuilder.DropPrimaryKey(
            name: "pk_sec_role_claims",
            table: "sec_role_claims");

        migrationBuilder.DropPrimaryKey(
            name: "pk_sec_modules",
            table: "sec_modules");

        migrationBuilder.DropPrimaryKey(
            name: "pk_sec_claims",
            table: "sec_claims");

        migrationBuilder.DropPrimaryKey(
            name: "pk_mpx_workspaces",
            table: "mpx_workspaces");

        migrationBuilder.DropPrimaryKey(
            name: "pk_mpx_workspace_users",
            table: "mpx_workspace_users");

        migrationBuilder.DropPrimaryKey(
            name: "pk_mpx_workspace_applications",
            table: "mpx_workspace_applications");

        migrationBuilder.DropPrimaryKey(
            name: "pk_mpx_menus",
            table: "mpx_menus");

        migrationBuilder.DropPrimaryKey(
            name: "pk_mpx_emails_to",
            table: "mpx_emails_to");

        migrationBuilder.DropPrimaryKey(
            name: "pk_mpx_emails_from",
            table: "mpx_emails_from");

        migrationBuilder.DropPrimaryKey(
            name: "pk_mpx_emails_cc",
            table: "mpx_emails_cc");

        migrationBuilder.DropPrimaryKey(
            name: "pk_mpx_emails_bcc",
            table: "mpx_emails_bcc");

        migrationBuilder.DropPrimaryKey(
            name: "pk_mpx_emails",
            table: "mpx_emails");

        migrationBuilder.DropPrimaryKey(
            name: "pk_mpx_corporations",
            table: "mpx_corporations");

        migrationBuilder.DropPrimaryKey(
            name: "pk_mpx_corporation_users",
            table: "mpx_corporation_users");

        migrationBuilder.DropPrimaryKey(
            name: "pk_mpx_categories",
            table: "mpx_categories");

        migrationBuilder.DropPrimaryKey(
            name: "pk_mpx_applications",
            table: "mpx_applications");

        migrationBuilder.DropIndex(
            name: "ix_mpx_applications_corporation_id_prefix",
            table: "mpx_applications");

        migrationBuilder.DropPrimaryKey(
            name: "pk_mpx_application_users",
            table: "mpx_application_users");

        migrationBuilder.DropPrimaryKey(
            name: "pk_mpx_application_sub_modules",
            table: "mpx_application_sub_modules");

        migrationBuilder.DropPrimaryKey(
            name: "pk_mpx_application_statuses",
            table: "mpx_application_statuses");

        migrationBuilder.DropPrimaryKey(
            name: "pk_mpx_application_modules",
            table: "mpx_application_modules");

        migrationBuilder.DropColumn(
            name: "shared_with_workspace_id",
            table: "mpx_workspace_applications");

        migrationBuilder.DropColumn(
            name: "prefix",
            table: "mpx_applications");

        migrationBuilder.RenameTable(
            name: "sec_users",
            newName: "users");

        migrationBuilder.RenameTable(
            name: "sec_user_statuses",
            newName: "user_status");

        migrationBuilder.RenameTable(
            name: "sec_user_roles",
            newName: "user_roles");

        migrationBuilder.RenameTable(
            name: "sec_user_claims",
            newName: "user_claims");

        migrationBuilder.RenameTable(
            name: "sec_sub_modules",
            newName: "security_sub_modules");

        migrationBuilder.RenameTable(
            name: "sec_roles",
            newName: "roles");

        migrationBuilder.RenameTable(
            name: "sec_role_claims",
            newName: "role_claims");

        migrationBuilder.RenameTable(
            name: "sec_modules",
            newName: "security_modules");

        migrationBuilder.RenameTable(
            name: "sec_claims",
            newName: "claims");

        migrationBuilder.RenameTable(
            name: "mpx_workspaces",
            newName: "workspaces");

        migrationBuilder.RenameTable(
            name: "mpx_workspace_users",
            newName: "workspace_users");

        migrationBuilder.RenameTable(
            name: "mpx_workspace_applications",
            newName: "workspace_applications");

        migrationBuilder.RenameTable(
            name: "mpx_menus",
            newName: "menus");

        migrationBuilder.RenameTable(
            name: "mpx_emails_to",
            newName: "emails_to");

        migrationBuilder.RenameTable(
            name: "mpx_emails_from",
            newName: "emails_from");

        migrationBuilder.RenameTable(
            name: "mpx_emails_cc",
            newName: "emails_cc");

        migrationBuilder.RenameTable(
            name: "mpx_emails_bcc",
            newName: "emails_bcc");

        migrationBuilder.RenameTable(
            name: "mpx_emails",
            newName: "emails");

        migrationBuilder.RenameTable(
            name: "mpx_corporations",
            newName: "corporations");

        migrationBuilder.RenameTable(
            name: "mpx_corporation_users",
            newName: "corporation_users");

        migrationBuilder.RenameTable(
            name: "mpx_categories",
            newName: "categories");

        migrationBuilder.RenameTable(
            name: "mpx_applications",
            newName: "applications");

        migrationBuilder.RenameTable(
            name: "mpx_application_users",
            newName: "application_users");

        migrationBuilder.RenameTable(
            name: "mpx_application_sub_modules",
            newName: "application_sub_modules");

        migrationBuilder.RenameTable(
            name: "mpx_application_statuses",
            newName: "application_statuses");

        migrationBuilder.RenameTable(
            name: "mpx_application_modules",
            newName: "application_modules");

        migrationBuilder.RenameIndex(
            name: "ix_sec_users_user_status_id",
            table: "users",
            newName: "ix_users_user_status_id");

        migrationBuilder.RenameIndex(
            name: "ix_sec_users_key",
            table: "users",
            newName: "ix_users_key");

        migrationBuilder.RenameIndex(
            name: "ix_sec_users_email",
            table: "users",
            newName: "ix_users_email");

        migrationBuilder.RenameIndex(
            name: "ix_sec_users_corporation_id",
            table: "users",
            newName: "ix_users_corporation_id");

        migrationBuilder.RenameIndex(
            name: "ix_sec_user_statuses_key",
            table: "user_status",
            newName: "ix_user_status_key");

        migrationBuilder.RenameIndex(
            name: "ix_sec_user_statuses_corporation_id",
            table: "user_status",
            newName: "ix_user_status_corporation_id");

        migrationBuilder.RenameIndex(
            name: "ix_sec_user_roles_role_id",
            table: "user_roles",
            newName: "ix_user_roles_role_id");

        migrationBuilder.RenameIndex(
            name: "ix_sec_user_roles_corporation_id",
            table: "user_roles",
            newName: "ix_user_roles_corporation_id");

        migrationBuilder.RenameIndex(
            name: "ix_sec_user_claims_corporation_id",
            table: "user_claims",
            newName: "ix_user_claims_corporation_id");

        migrationBuilder.RenameIndex(
            name: "ix_sec_user_claims_claim_id",
            table: "user_claims",
            newName: "ix_user_claims_claim_id");

        migrationBuilder.RenameIndex(
            name: "ix_sec_sub_modules_module_id",
            table: "security_sub_modules",
            newName: "ix_security_sub_modules_module_id");

        migrationBuilder.RenameIndex(
            name: "ix_sec_sub_modules_key",
            table: "security_sub_modules",
            newName: "ix_security_sub_modules_key");

        migrationBuilder.RenameIndex(
            name: "ix_sec_sub_modules_corporation_id",
            table: "security_sub_modules",
            newName: "ix_security_sub_modules_corporation_id");

        migrationBuilder.RenameIndex(
            name: "ix_sec_roles_sub_module_id",
            table: "roles",
            newName: "ix_roles_sub_module_id");

        migrationBuilder.RenameIndex(
            name: "ix_sec_roles_module_id",
            table: "roles",
            newName: "ix_roles_module_id");

        migrationBuilder.RenameIndex(
            name: "ix_sec_roles_key",
            table: "roles",
            newName: "ix_roles_key");

        migrationBuilder.RenameIndex(
            name: "ix_sec_roles_corporation_id",
            table: "roles",
            newName: "ix_roles_corporation_id");

        migrationBuilder.RenameIndex(
            name: "ix_sec_role_claims_corporation_id",
            table: "role_claims",
            newName: "ix_role_claims_corporation_id");

        migrationBuilder.RenameIndex(
            name: "ix_sec_role_claims_claim_id",
            table: "role_claims",
            newName: "ix_role_claims_claim_id");

        migrationBuilder.RenameIndex(
            name: "ix_sec_modules_key",
            table: "security_modules",
            newName: "ix_security_modules_key");

        migrationBuilder.RenameIndex(
            name: "ix_sec_modules_corporation_id",
            table: "security_modules",
            newName: "ix_security_modules_corporation_id");

        migrationBuilder.RenameIndex(
            name: "ix_sec_modules_application_id",
            table: "security_modules",
            newName: "ix_security_modules_application_id");

        migrationBuilder.RenameIndex(
            name: "ix_sec_claims_sub_module_id",
            table: "claims",
            newName: "ix_claims_sub_module_id");

        migrationBuilder.RenameIndex(
            name: "ix_sec_claims_module_id",
            table: "claims",
            newName: "ix_claims_module_id");

        migrationBuilder.RenameIndex(
            name: "ix_sec_claims_key",
            table: "claims",
            newName: "ix_claims_key");

        migrationBuilder.RenameIndex(
            name: "ix_sec_claims_corporation_id",
            table: "claims",
            newName: "ix_claims_corporation_id");

        migrationBuilder.RenameIndex(
            name: "ix_mpx_workspaces_key",
            table: "workspaces",
            newName: "ix_workspaces_key");

        migrationBuilder.RenameIndex(
            name: "ix_mpx_workspaces_corporation_id",
            table: "workspaces",
            newName: "ix_workspaces_corporation_id");

        migrationBuilder.RenameIndex(
            name: "ix_mpx_workspace_users_user_id",
            table: "workspace_users",
            newName: "ix_workspace_users_user_id");

        migrationBuilder.RenameIndex(
            name: "ix_mpx_workspace_users_corporation_id",
            table: "workspace_users",
            newName: "ix_workspace_users_corporation_id");

        migrationBuilder.RenameIndex(
            name: "ix_mpx_workspace_applications_corporation_id",
            table: "workspace_applications",
            newName: "ix_workspace_applications_corporation_id");

        migrationBuilder.RenameIndex(
            name: "ix_mpx_workspace_applications_application_id",
            table: "workspace_applications",
            newName: "ix_workspace_applications_application_id");

        migrationBuilder.RenameIndex(
            name: "ix_mpx_menus_sub_module_id",
            table: "menus",
            newName: "ix_menus_sub_module_id");

        migrationBuilder.RenameIndex(
            name: "ix_mpx_menus_module_id",
            table: "menus",
            newName: "ix_menus_module_id");

        migrationBuilder.RenameIndex(
            name: "ix_mpx_menus_menu_id",
            table: "menus",
            newName: "ix_menus_menu_id");

        migrationBuilder.RenameIndex(
            name: "ix_mpx_menus_key",
            table: "menus",
            newName: "ix_menus_key");

        migrationBuilder.RenameIndex(
            name: "ix_mpx_menus_corporation_id",
            table: "menus",
            newName: "ix_menus_corporation_id");

        migrationBuilder.RenameIndex(
            name: "ix_mpx_menus_application_id",
            table: "menus",
            newName: "ix_menus_application_id");

        migrationBuilder.RenameIndex(
            name: "ix_mpx_emails_to_key",
            table: "emails_to",
            newName: "ix_emails_to_key");

        migrationBuilder.RenameIndex(
            name: "ix_mpx_emails_to_email_id",
            table: "emails_to",
            newName: "ix_emails_to_email_id");

        migrationBuilder.RenameIndex(
            name: "ix_mpx_emails_to_corporation_id",
            table: "emails_to",
            newName: "ix_emails_to_corporation_id");

        migrationBuilder.RenameIndex(
            name: "ix_mpx_emails_from_key",
            table: "emails_from",
            newName: "ix_emails_from_key");

        migrationBuilder.RenameIndex(
            name: "ix_mpx_emails_from_email_id",
            table: "emails_from",
            newName: "ix_emails_from_email_id");

        migrationBuilder.RenameIndex(
            name: "ix_mpx_emails_from_corporation_id",
            table: "emails_from",
            newName: "ix_emails_from_corporation_id");

        migrationBuilder.RenameIndex(
            name: "ix_mpx_emails_cc_key",
            table: "emails_cc",
            newName: "ix_emails_cc_key");

        migrationBuilder.RenameIndex(
            name: "ix_mpx_emails_cc_email_id",
            table: "emails_cc",
            newName: "ix_emails_cc_email_id");

        migrationBuilder.RenameIndex(
            name: "ix_mpx_emails_cc_corporation_id",
            table: "emails_cc",
            newName: "ix_emails_cc_corporation_id");

        migrationBuilder.RenameIndex(
            name: "ix_mpx_emails_bcc_key",
            table: "emails_bcc",
            newName: "ix_emails_bcc_key");

        migrationBuilder.RenameIndex(
            name: "ix_mpx_emails_bcc_email_id",
            table: "emails_bcc",
            newName: "ix_emails_bcc_email_id");

        migrationBuilder.RenameIndex(
            name: "ix_mpx_emails_bcc_corporation_id",
            table: "emails_bcc",
            newName: "ix_emails_bcc_corporation_id");

        migrationBuilder.RenameIndex(
            name: "ix_mpx_emails_key",
            table: "emails",
            newName: "ix_emails_key");

        migrationBuilder.RenameIndex(
            name: "ix_mpx_emails_corporation_id",
            table: "emails",
            newName: "ix_emails_corporation_id");

        migrationBuilder.RenameIndex(
            name: "ix_mpx_corporations_key",
            table: "corporations",
            newName: "ix_corporations_key");

        migrationBuilder.RenameIndex(
            name: "ix_mpx_corporations_corporation_id",
            table: "corporations",
            newName: "ix_corporations_corporation_id");

        migrationBuilder.RenameIndex(
            name: "ix_mpx_corporation_users_user_id",
            table: "corporation_users",
            newName: "ix_corporation_users_user_id");

        migrationBuilder.RenameIndex(
            name: "ix_mpx_categories_key",
            table: "categories",
            newName: "ix_categories_key");

        migrationBuilder.RenameIndex(
            name: "ix_mpx_categories_corporation_id",
            table: "categories",
            newName: "ix_categories_corporation_id");

        migrationBuilder.RenameIndex(
            name: "ix_mpx_applications_key",
            table: "applications",
            newName: "ix_applications_key");

        migrationBuilder.RenameIndex(
            name: "ix_mpx_applications_category_id",
            table: "applications",
            newName: "ix_applications_category_id");

        migrationBuilder.RenameIndex(
            name: "ix_mpx_applications_application_status_id",
            table: "applications",
            newName: "ix_applications_application_status_id");

        migrationBuilder.RenameIndex(
            name: "ix_mpx_application_users_user_id",
            table: "application_users",
            newName: "ix_application_users_user_id");

        migrationBuilder.RenameIndex(
            name: "ix_mpx_application_users_corporation_id",
            table: "application_users",
            newName: "ix_application_users_corporation_id");

        migrationBuilder.RenameIndex(
            name: "ix_mpx_application_sub_modules_key",
            table: "application_sub_modules",
            newName: "ix_application_sub_modules_key");

        migrationBuilder.RenameIndex(
            name: "ix_mpx_application_sub_modules_corporation_id",
            table: "application_sub_modules",
            newName: "ix_application_sub_modules_corporation_id");

        migrationBuilder.RenameIndex(
            name: "ix_mpx_application_sub_modules_application_module_id",
            table: "application_sub_modules",
            newName: "ix_application_sub_modules_application_module_id");

        migrationBuilder.RenameIndex(
            name: "ix_mpx_application_statuses_key",
            table: "application_statuses",
            newName: "ix_application_statuses_key");

        migrationBuilder.RenameIndex(
            name: "ix_mpx_application_statuses_corporation_id",
            table: "application_statuses",
            newName: "ix_application_statuses_corporation_id");

        migrationBuilder.RenameIndex(
            name: "ix_mpx_application_modules_key",
            table: "application_modules",
            newName: "ix_application_modules_key");

        migrationBuilder.RenameIndex(
            name: "ix_mpx_application_modules_corporation_id",
            table: "application_modules",
            newName: "ix_application_modules_corporation_id");

        migrationBuilder.RenameIndex(
            name: "ix_mpx_application_modules_application_id",
            table: "application_modules",
            newName: "ix_application_modules_application_id");

        migrationBuilder.AddPrimaryKey(
            name: "pk_users",
            table: "users",
            column: "id");

        migrationBuilder.AddPrimaryKey(
            name: "pk_user_status",
            table: "user_status",
            column: "id");

        migrationBuilder.AddPrimaryKey(
            name: "pk_user_roles",
            table: "user_roles",
            columns: new[] { "user_id", "role_id" });

        migrationBuilder.AddPrimaryKey(
            name: "pk_user_claims",
            table: "user_claims",
            columns: new[] { "user_id", "claim_id" });

        migrationBuilder.AddPrimaryKey(
            name: "pk_security_sub_modules",
            table: "security_sub_modules",
            column: "id");

        migrationBuilder.AddPrimaryKey(
            name: "pk_roles",
            table: "roles",
            column: "id");

        migrationBuilder.AddPrimaryKey(
            name: "pk_role_claims",
            table: "role_claims",
            columns: new[] { "role_id", "claim_id" });

        migrationBuilder.AddPrimaryKey(
            name: "pk_security_modules",
            table: "security_modules",
            column: "id");

        migrationBuilder.AddPrimaryKey(
            name: "pk_claims",
            table: "claims",
            column: "id");

        migrationBuilder.AddPrimaryKey(
            name: "pk_workspaces",
            table: "workspaces",
            column: "id");

        migrationBuilder.AddPrimaryKey(
            name: "pk_workspace_users",
            table: "workspace_users",
            columns: new[] { "workspace_id", "user_id" });

        migrationBuilder.AddPrimaryKey(
            name: "pk_workspace_applications",
            table: "workspace_applications",
            columns: new[] { "workspace_id", "application_id" });

        migrationBuilder.AddPrimaryKey(
            name: "pk_menus",
            table: "menus",
            column: "id");

        migrationBuilder.AddPrimaryKey(
            name: "pk_emails_to",
            table: "emails_to",
            column: "id");

        migrationBuilder.AddPrimaryKey(
            name: "pk_emails_from",
            table: "emails_from",
            column: "id");

        migrationBuilder.AddPrimaryKey(
            name: "pk_emails_cc",
            table: "emails_cc",
            column: "id");

        migrationBuilder.AddPrimaryKey(
            name: "pk_emails_bcc",
            table: "emails_bcc",
            column: "id");

        migrationBuilder.AddPrimaryKey(
            name: "pk_emails",
            table: "emails",
            column: "id");

        migrationBuilder.AddPrimaryKey(
            name: "pk_corporations",
            table: "corporations",
            column: "id");

        migrationBuilder.AddPrimaryKey(
            name: "pk_corporation_users",
            table: "corporation_users",
            columns: new[] { "corporation_id", "user_id" });

        migrationBuilder.AddPrimaryKey(
            name: "pk_categories",
            table: "categories",
            column: "id");

        migrationBuilder.AddPrimaryKey(
            name: "pk_applications",
            table: "applications",
            column: "id");

        migrationBuilder.AddPrimaryKey(
            name: "pk_application_users",
            table: "application_users",
            columns: new[] { "application_id", "user_id" });

        migrationBuilder.AddPrimaryKey(
            name: "pk_application_sub_modules",
            table: "application_sub_modules",
            column: "id");

        migrationBuilder.AddPrimaryKey(
            name: "pk_application_statuses",
            table: "application_statuses",
            column: "id");

        migrationBuilder.AddPrimaryKey(
            name: "pk_application_modules",
            table: "application_modules",
            column: "id");

        migrationBuilder.CreateIndex(
            name: "ix_applications_corporation_id",
            table: "applications",
            column: "corporation_id");

        migrationBuilder.AddForeignKey(
            name: "fk_application_modules_applications_application_id",
            table: "application_modules",
            column: "application_id",
            principalTable: "applications",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_application_modules_corporations_corporation_id",
            table: "application_modules",
            column: "corporation_id",
            principalTable: "corporations",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_application_statuses_corporations_corporation_id",
            table: "application_statuses",
            column: "corporation_id",
            principalTable: "corporations",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_application_sub_modules_application_modules_application_mod",
            table: "application_sub_modules",
            column: "application_module_id",
            principalTable: "application_modules",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_application_sub_modules_corporations_corporation_id",
            table: "application_sub_modules",
            column: "corporation_id",
            principalTable: "corporations",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_application_users_applications_application_id",
            table: "application_users",
            column: "application_id",
            principalTable: "applications",
            principalColumn: "id",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "fk_application_users_corporations_corporation_id",
            table: "application_users",
            column: "corporation_id",
            principalTable: "corporations",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_application_users_users_user_id",
            table: "application_users",
            column: "user_id",
            principalTable: "users",
            principalColumn: "id",
            onDelete: ReferentialAction.Cascade);

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

        migrationBuilder.AddForeignKey(
            name: "fk_applications_corporations_corporation_id",
            table: "applications",
            column: "corporation_id",
            principalTable: "corporations",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_categories_corporations_corporation_id",
            table: "categories",
            column: "corporation_id",
            principalTable: "corporations",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_claims_corporations_corporation_id",
            table: "claims",
            column: "corporation_id",
            principalTable: "corporations",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_claims_modules_module_id",
            table: "claims",
            column: "module_id",
            principalTable: "security_modules",
            principalColumn: "id",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "fk_claims_sub_modules_sub_module_id",
            table: "claims",
            column: "sub_module_id",
            principalTable: "security_sub_modules",
            principalColumn: "id",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "fk_corporation_users_corporations_corporation_id",
            table: "corporation_users",
            column: "corporation_id",
            principalTable: "corporations",
            principalColumn: "id",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "fk_corporation_users_users_user_id",
            table: "corporation_users",
            column: "user_id",
            principalTable: "users",
            principalColumn: "id",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "fk_corporations_corporations_corporation_id",
            table: "corporations",
            column: "corporation_id",
            principalTable: "corporations",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_emails_corporations_corporation_id",
            table: "emails",
            column: "corporation_id",
            principalTable: "corporations",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_emails_bcc_corporations_corporation_id",
            table: "emails_bcc",
            column: "corporation_id",
            principalTable: "corporations",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_emails_bcc_emails_email_id",
            table: "emails_bcc",
            column: "email_id",
            principalTable: "emails",
            principalColumn: "id",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "fk_emails_cc_corporations_corporation_id",
            table: "emails_cc",
            column: "corporation_id",
            principalTable: "corporations",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_emails_cc_emails_email_id",
            table: "emails_cc",
            column: "email_id",
            principalTable: "emails",
            principalColumn: "id",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "fk_emails_from_corporations_corporation_id",
            table: "emails_from",
            column: "corporation_id",
            principalTable: "corporations",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_emails_from_emails_email_id",
            table: "emails_from",
            column: "email_id",
            principalTable: "emails",
            principalColumn: "id",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "fk_emails_to_corporations_corporation_id",
            table: "emails_to",
            column: "corporation_id",
            principalTable: "corporations",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_emails_to_emails_email_id",
            table: "emails_to",
            column: "email_id",
            principalTable: "emails",
            principalColumn: "id",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "fk_menus_applications_application_id",
            table: "menus",
            column: "application_id",
            principalTable: "applications",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_menus_corporations_corporation_id",
            table: "menus",
            column: "corporation_id",
            principalTable: "corporations",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_menus_menus_menu_id",
            table: "menus",
            column: "menu_id",
            principalTable: "menus",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_menus_modules_module_id",
            table: "menus",
            column: "module_id",
            principalTable: "security_modules",
            principalColumn: "id",
            onDelete: ReferentialAction.SetNull);

        migrationBuilder.AddForeignKey(
            name: "fk_menus_sub_modules_sub_module_id",
            table: "menus",
            column: "sub_module_id",
            principalTable: "security_sub_modules",
            principalColumn: "id",
            onDelete: ReferentialAction.SetNull);

        migrationBuilder.AddForeignKey(
            name: "fk_role_claims_claims_claim_id",
            table: "role_claims",
            column: "claim_id",
            principalTable: "claims",
            principalColumn: "id",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "fk_role_claims_corporations_corporation_id",
            table: "role_claims",
            column: "corporation_id",
            principalTable: "corporations",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_role_claims_roles_role_id",
            table: "role_claims",
            column: "role_id",
            principalTable: "roles",
            principalColumn: "id",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "fk_roles_corporations_corporation_id",
            table: "roles",
            column: "corporation_id",
            principalTable: "corporations",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_roles_modules_module_id",
            table: "roles",
            column: "module_id",
            principalTable: "security_modules",
            principalColumn: "id",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "fk_roles_sub_modules_sub_module_id",
            table: "roles",
            column: "sub_module_id",
            principalTable: "security_sub_modules",
            principalColumn: "id",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "fk_security_modules_applications_application_id",
            table: "security_modules",
            column: "application_id",
            principalTable: "applications",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_security_modules_corporations_corporation_id",
            table: "security_modules",
            column: "corporation_id",
            principalTable: "corporations",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_security_sub_modules_corporations_corporation_id",
            table: "security_sub_modules",
            column: "corporation_id",
            principalTable: "corporations",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_security_sub_modules_security_modules_module_id",
            table: "security_sub_modules",
            column: "module_id",
            principalTable: "security_modules",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_user_claims_claims_claim_id",
            table: "user_claims",
            column: "claim_id",
            principalTable: "claims",
            principalColumn: "id",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "fk_user_claims_corporations_corporation_id",
            table: "user_claims",
            column: "corporation_id",
            principalTable: "corporations",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_user_claims_users_user_id",
            table: "user_claims",
            column: "user_id",
            principalTable: "users",
            principalColumn: "id",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "fk_user_roles_corporations_corporation_id",
            table: "user_roles",
            column: "corporation_id",
            principalTable: "corporations",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_user_roles_roles_role_id",
            table: "user_roles",
            column: "role_id",
            principalTable: "roles",
            principalColumn: "id",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "fk_user_roles_users_user_id",
            table: "user_roles",
            column: "user_id",
            principalTable: "users",
            principalColumn: "id",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "fk_user_status_corporations_corporation_id",
            table: "user_status",
            column: "corporation_id",
            principalTable: "corporations",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_users_corporations_corporation_id",
            table: "users",
            column: "corporation_id",
            principalTable: "corporations",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_users_user_status_user_status_id",
            table: "users",
            column: "user_status_id",
            principalTable: "user_status",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_workspace_applications_applications_application_id",
            table: "workspace_applications",
            column: "application_id",
            principalTable: "applications",
            principalColumn: "id",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "fk_workspace_applications_corporations_corporation_id",
            table: "workspace_applications",
            column: "corporation_id",
            principalTable: "corporations",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_workspace_applications_workspaces_workspace_id",
            table: "workspace_applications",
            column: "workspace_id",
            principalTable: "workspaces",
            principalColumn: "id",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "fk_workspace_users_corporations_corporation_id",
            table: "workspace_users",
            column: "corporation_id",
            principalTable: "corporations",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "fk_workspace_users_users_user_id",
            table: "workspace_users",
            column: "user_id",
            principalTable: "users",
            principalColumn: "id",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "fk_workspace_users_workspaces_workspace_id",
            table: "workspace_users",
            column: "workspace_id",
            principalTable: "workspaces",
            principalColumn: "id",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "fk_workspaces_corporations_corporation_id",
            table: "workspaces",
            column: "corporation_id",
            principalTable: "corporations",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);
    }
}
