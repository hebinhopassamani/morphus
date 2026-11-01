import { Component, inject, signal } from '@angular/core';
import { form, FormField, FormRoot, required } from '@angular/forms/signals';
import { MatDivider } from '@angular/material/divider';
import {
  MatFormField,
  MatInput,
  MatLabel,
  MatPrefix,
} from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { Auth } from '@/apps/core/auth';
import { SettingsUnsavedChanges } from '@morphus/pages/settings/ui/unsaved-changes';

@Component({
  selector: 'settings-workspace',
  imports: [
    FormField,
    FormRoot,
    MatDivider,
    MatFormField,
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
              <span matTextPrefix>morphus.me/</span>
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

      <!-- Access -->
      <section class="grid gap-x-10 gap-y-8 sm:grid-cols-3">
        <div class="flex flex-col gap-y-0.5">
          <div class="text-lg font-semibold">Access</div>
          <div class="text-neutral-a11">
            Who can join the workspace and how they sign in
          </div>
        </div>

        <div class="flex flex-col gap-y-4 sm:col-span-2">
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
  private readonly auth = inject(Auth);
  protected readonly requireTwoFactor = signal(false);
  protected readonly allowGuests = signal(true);

  private workspaceFormModel = signal(this.defaults());
  protected workspaceForm = form(
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

  protected defaults() {
    const corpName = this.auth.corporation()?.name || 'Morphus';
    return {
      name: corpName,
      slug: corpName.toLowerCase().replace(/\s+/g, '-'),
      description: 'Ecossistema Multi-Tenant Morphus.',
      industry: 'software',
    };
  }
}

