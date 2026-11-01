import { Component, signal } from '@angular/core';
import { form, FormField, FormRoot, required } from '@angular/forms/signals';
import { MatButton } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import {
  MatFormField,
  MatInput,
  MatLabel,
  MatPrefix,
} from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MemberRole } from '@/app/domains/admin/modules/members/data/members';
import { SettingsUnsavedChanges } from '@/app/domains/admin/modules/settings/ui/unsaved-changes';

@Component({
  selector: 'settings-workspace',
  imports: [
    FormField,
    FormRoot,
    MatButton,
    MatDivider,
    MatFormField,
    MatIcon,
    MatInput,
    MatLabel,
    MatOption,
    MatPrefix,
    MatSelect,
    MatSlideToggle,
    SettingsUnsavedChanges,
  ],
  host: {
    class: 'flex flex-auto flex-col',
  },
  template: `
    <form
      class="flex flex-auto flex-col gap-y-10"
      [formRoot]="workspaceForm"
    >
      <!-- General -->
      <section class="grid gap-x-10 gap-y-8 sm:grid-cols-3">
        <div class="flex flex-col gap-y-0.5">
          <div class="text-lg font-semibold">General</div>
          <div class="text-neutral-a11">
            The name and address everyone uses to reach the workspace
          </div>
        </div>

        <div class="grid gap-6 sm:col-span-2 sm:grid-cols-6">
          <!-- Logo -->
          <div class="col-span-full flex items-center gap-x-4">
            @let hasLogo = !!workspaceForm.logo().value();

            @if (hasLogo) {
              <img
                class="size-16 shrink-0 rounded-xl object-cover"
                [src]="workspaceForm.logo().value()"
                alt="Workspace logo"
              />
            } @else {
              <div
                class="flex size-16 shrink-0 items-center justify-center rounded-xl bg-neutral-a6"
              >
                @let initial =
                  workspaceForm.name().value()
                    ? workspaceForm.name().value()[0]
                    : null;
                @if (initial) {
                  <div class="text-4xl font-semibold">
                    {{ initial }}
                  </div>
                } @else {
                  <mat-icon svgIcon="building" />
                }
              </div>
            }

            <div class="flex flex-col gap-y-2">
              <div class="flex items-center gap-x-1">
                <button
                  matButton
                  type="button"
                  class="tiny"
                >
                  <mat-icon svgIcon="upload" />
                  @if (hasLogo) {
                    Change logo
                  } @else {
                    Upload logo
                  }
                </button>

                @if (hasLogo) {
                  <button
                    matButton
                    type="button"
                    class="tertiary tiny"
                    (click)="workspaceForm.logo().value.set('')"
                  >
                    Delete
                  </button>
                }
              </div>
              <div class="text-sm text-neutral-a11">
                Ideal image size: 128x128px. SVG/PNG under 2MB.
              </div>
            </div>
          </div>

          <!-- Workspace name -->
          <div class="col-span-full">
            <mat-form-field class="w-full">
              <mat-label>Workspace name</mat-label>
              <input
                matInput
                type="text"
                [formField]="workspaceForm.name"
              />
            </mat-form-field>
          </div>

          <!-- Workspace URL -->
          <div class="col-span-full">
            <mat-form-field class="w-full">
              <mat-label>Workspace URL</mat-label>
              <input
                matInput
                type="text"
                [formField]="workspaceForm.slug"
              />
              <span matTextPrefix>fuse.example.com/</span>
            </mat-form-field>
          </div>

          <!-- Description -->
          <div class="col-span-full">
            <mat-form-field class="w-full">
              <mat-label>Description</mat-label>
              <textarea
                matInput
                rows="3"
                [formField]="workspaceForm.description"
              ></textarea>
            </mat-form-field>
          </div>

          <!-- Industry -->
          <div class="col-span-full">
            <mat-form-field class="w-full">
              <mat-label>Industry</mat-label>
              <mat-select [formField]="workspaceForm.industry">
                <mat-option value="software">Software</mat-option>
                <mat-option value="design">Design and creative</mat-option>
                <mat-option value="marketing">Marketing and media</mat-option>
                <mat-option value="finance">Finance</mat-option>
                <mat-option value="education">Education</mat-option>
                <mat-option value="healthcare">Healthcare</mat-option>
                <mat-option value="other">Other</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        </div>
      </section>

      <!-- Divider -->
      <mat-divider />

      <!-- Defaults -->
      <section class="grid gap-x-10 gap-y-8 sm:grid-cols-3">
        <div class="flex flex-col gap-y-0.5">
          <div class="text-lg font-semibold">Defaults</div>
          <div class="text-neutral-a11">
            Where new members and new projects start from
          </div>
        </div>

        <div class="grid gap-6 sm:col-span-2 sm:grid-cols-6">
          <!-- Default role -->
          <div class="col-span-full sm:col-span-3">
            <mat-form-field class="w-full">
              <mat-label>Default role for new members</mat-label>
              <mat-select [formField]="workspaceForm.defaultRole">
                <mat-option value="owner">Owner</mat-option>
                <mat-option value="admin">Admin</mat-option>
                <mat-option value="member">Member</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <!-- Default project view -->
          <div class="col-span-full sm:col-span-3">
            <mat-form-field class="w-full">
              <mat-label>Default project view</mat-label>
              <mat-select [formField]="workspaceForm.projectView">
                <mat-option value="table">Table</mat-option>
                <mat-option value="board">Board</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <!-- Default time zone -->
          <div class="col-span-full sm:col-span-3">
            <mat-form-field class="w-full">
              <mat-label>Default time zone</mat-label>
              <mat-select [formField]="workspaceForm.timeZone">
                <mat-option value="pacific">Pacific Time (PT)</mat-option>
                <mat-option value="central">Central Time (CT)</mat-option>
                <mat-option value="eastern">Eastern Time (ET)</mat-option>
                <mat-option value="utc"
                  >Coordinated Universal Time (UTC)</mat-option
                >
                <mat-option value="cet">Central European Time (CET)</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <!-- Week starts on -->
          <div class="col-span-full sm:col-span-3">
            <mat-form-field class="w-full">
              <mat-label>Week starts on</mat-label>
              <mat-select [formField]="workspaceForm.weekStart">
                <mat-option value="sunday">Sunday</mat-option>
                <mat-option value="monday">Monday</mat-option>
                <mat-option value="saturday">Saturday</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        </div>
      </section>

      <!-- Divider -->
      <mat-divider />

      <!-- Access -->
      <section class="grid gap-x-10 gap-y-8 sm:grid-cols-3">
        <div class="flex flex-col gap-y-0.5">
          <div class="text-lg font-semibold">Access</div>
          <div class="text-neutral-a11">
            Who can join the workspace and how they sign in
          </div>
        </div>

        <div class="flex flex-col gap-y-4 sm:col-span-2">
          <!-- Allowed email domains -->
          <div
            class="flex flex-col items-start gap-4 sm:flex-row sm:items-center"
          >
            <div class="flex flex-auto flex-col">
              <h3 class="font-medium">Allowed email domains</h3>
              <p class="text-sm text-neutral-a11">
                Anyone with an email at these domains can join without an invite
              </p>
            </div>

            <mat-form-field class="w-full shrink-0 sm:w-56">
              <input
                matInput
                type="text"
                aria-label="Allowed email domains"
                [formField]="workspaceForm.allowedDomains"
              />
            </mat-form-field>
          </div>

          <mat-divider />

          <!-- Require two-factor authentication -->
          <mat-slide-toggle
            class="[--slide-toggle-gap-x:1rem]"
            fullWidth
            labelPosition="before"
            [checked]="requireTwoFactor()"
            (change)="requireTwoFactor.set($event.checked)"
          >
            <div class="flex flex-col">
              <div class="font-medium">Require two-factor authentication</div>
              <div class="text-sm text-neutral-a11">
                Members set up a second step before they can open the workspace
              </div>
            </div>
          </mat-slide-toggle>

          <mat-divider />

          <!-- Allow members to invite guests -->
          <mat-slide-toggle
            class="[--slide-toggle-gap-x:1rem]"
            fullWidth
            labelPosition="before"
            [checked]="allowGuests()"
            (change)="allowGuests.set($event.checked)"
          >
            <div class="flex flex-col">
              <div class="font-medium">Allow members to invite guests</div>
              <div class="text-sm text-neutral-a11">
                Guests see only the projects they are invited to
              </div>
            </div>
          </mat-slide-toggle>
        </div>
      </section>

      <!-- Divider -->
      <mat-divider />

      <!-- Data -->
      <section class="grid gap-x-10 gap-y-8 sm:grid-cols-3">
        <div class="flex flex-col gap-y-0.5">
          <div class="text-lg font-semibold">Data</div>
          <div class="text-neutral-a11">
            What the workspace keeps and how to take it with you
          </div>
        </div>

        <div class="flex flex-col gap-y-4 sm:col-span-2">
          <!-- Data retention -->
          <div
            class="flex flex-col items-start gap-4 sm:flex-row sm:items-center"
          >
            <div class="flex flex-auto flex-col">
              <h3 class="font-medium">Data retention</h3>
              <p class="text-sm text-neutral-a11">
                How long deleted projects and files stay recoverable
              </p>
            </div>

            <mat-form-field class="w-full shrink-0 sm:w-40">
              <mat-select
                aria-label="Data retention"
                [formField]="workspaceForm.retention"
              >
                <mat-option value="30-days">30 days</mat-option>
                <mat-option value="90-days">90 days</mat-option>
                <mat-option value="1-year">1 year</mat-option>
                <mat-option value="forever">Forever</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <mat-divider />

          <!-- Export workspace data -->
          <div class="flex items-center gap-4">
            <div class="flex flex-auto flex-col">
              <h3 class="font-medium">Export workspace data</h3>
              <p class="text-sm text-neutral-a11">
                Every project, task and comment as a JSON archive
              </p>
            </div>

            <button
              matButton
              type="button"
              class="small shrink-0"
            >
              <mat-icon svgIcon="download" />
              Export
            </button>
          </div>
        </div>
      </section>

      <!-- Divider -->
      <mat-divider />

      <!-- Workspace -->
      <section class="grid gap-x-10 gap-y-8 sm:grid-cols-3">
        <div class="flex flex-col gap-y-0.5">
          <div class="text-lg font-semibold">Workspace</div>
          <div class="text-neutral-a11">
            Transfer the workspace or delete it
          </div>
        </div>

        <div class="flex flex-col gap-y-4 sm:col-span-2">
          <!-- Transfer ownership -->
          <div class="flex items-center gap-4">
            <div class="flex flex-auto flex-col">
              <h3 class="font-medium">Transfer ownership</h3>
              <p class="text-sm text-neutral-a11">
                Make another admin the owner of this workspace
              </p>
            </div>

            <button
              matButton
              type="button"
              class="small shrink-0"
            >
              <mat-icon svgIcon="arrow-right-left" />
              Transfer
            </button>
          </div>

          <mat-divider />

          <!-- Delete workspace -->
          <div class="flex items-center gap-4">
            <div class="flex flex-auto flex-col">
              <h3 class="font-medium">Delete workspace</h3>
              <p class="text-sm text-neutral-a11">
                Removes every project, team and member along with their history.
                This cannot be undone
              </p>
            </div>

            <button
              matButton
              type="button"
              class="primary destructive small shrink-0"
            >
              <mat-icon svgIcon="trash" />
              Delete
            </button>
          </div>
        </div>
      </section>

      <!-- Unsaved changes -->
      @if (workspaceForm().dirty()) {
        <settings-unsaved-changes
          class="mt-auto"
          (discard)="workspaceForm().reset(defaults())"
        />
      }
    </form>
  `,
})
export default class SettingsWorkspace {
  // State
  private requireTwoFactor = signal(false);
  private allowGuests = signal(true);

  // Forms
  private workspaceFormModel = signal(this.defaults());
  private workspaceForm = form(
    this.workspaceFormModel,
    (schema) => {
      required(schema.name, { message: 'Workspace name is required.' });
      required(schema.slug, { message: 'Workspace URL is required.' });
    },
    {
      submission: {
        action: async (field) => {
          field().reset();
        },
      },
    }
  );

  private defaults() {
    return {
      logo: '/images/logo/logomark.svg',
      name: 'Fuse',
      slug: 'fuse',
      description:
        'Where the product, design and engineering teams plan and ship their work.',
      industry: 'software',
      defaultRole: 'member' as MemberRole,
      projectView: 'table',
      timeZone: 'central',
      weekStart: 'sunday',
      allowedDomains: 'example.com',
      retention: '90-days',
    };
  }
}
