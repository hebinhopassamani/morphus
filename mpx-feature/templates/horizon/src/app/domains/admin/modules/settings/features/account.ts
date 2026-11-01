import { NgOptimizedImage } from '@angular/common';
import { Component, effect, inject, signal, untracked } from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatTooltip } from '@angular/material/tooltip';
import { Scheme, Theming } from '@/app/core/theming';
import { ME } from '@/app/domains/admin/modules/agents/data/agents';
import { SettingsEyebrow } from '@/app/domains/admin/modules/settings/ui/eyebrow';
import { SettingsUpdateEmail } from '@/app/domains/admin/modules/settings/ui/update-email';
import { bui } from '@/app/ui/utils';

@Component({
  selector: 'account-settings',
  imports: [
    FormField,
    MatButton,
    MatCard,
    MatCardContent,
    MatDivider,
    MatFormField,
    MatIcon,
    MatInput,
    MatOption,
    MatSelect,
    MatTooltip,
    NgOptimizedImage,
    SettingsEyebrow,
  ],
  template: `
    <div class="flex flex-col gap-y-10">
      <!-- Header -->
      <div class="flex flex-col gap-y-3">
        <settings-eyebrow />
        <div class="flex flex-col gap-y-0.5">
          <div class="text-2xl font-semibold tracking-tighter">Account</div>
          <div class="text-neutral-a11">
            Your profile and how the help desk looks for you.
          </div>
        </div>
      </div>

      <!-- Profile -->
      <section class="flex flex-col gap-y-3">
        <div class="flex flex-col gap-y-0.5">
          <div class="text-lg font-medium">Profile</div>
          <div class="text-neutral-a11">
            How customers and teammates see you.
          </div>
        </div>

        <mat-card>
          <mat-card-content class="flex flex-col gap-y-4">
            <!-- Photo -->
            <div class="flex items-center gap-4">
              <div class="flex flex-auto flex-col">
                <h3 class="font-medium">Photo</h3>
                <p class="text-sm text-neutral-a11">
                  Ideal image size: 128x128px, JPG or PNG under 5MB
                </p>
              </div>

              <div class="flex shrink-0 items-center gap-x-3">
                <img
                  class="size-9 rounded-full object-cover"
                  width="36"
                  height="36"
                  [ngSrc]="me.photo"
                  [alt]="me.name"
                />
                <button
                  matButton
                  type="button"
                  class="small"
                >
                  <mat-icon svgIcon="upload" />
                  Change
                </button>
              </div>
            </div>

            <mat-divider />

            <!-- Name -->
            <div
              class="flex flex-col items-start gap-4 sm:flex-row sm:items-center"
            >
              <div class="flex flex-auto flex-col">
                <h3 class="font-medium">Name</h3>
                <p class="text-sm text-neutral-a11">
                  Signs your replies to customers
                </p>
              </div>

              <mat-form-field class="small w-full shrink-0 sm:w-56">
                <input
                  matInput
                  type="text"
                  aria-label="Name"
                  [formField]="profileForm.name"
                />
              </mat-form-field>
            </div>

            <mat-divider />

            <!-- Email -->
            <div class="flex items-center gap-4">
              <div class="flex min-w-0 flex-auto flex-col">
                <h3 class="font-medium">Email</h3>
                <p class="truncate text-sm text-neutral-a11">
                  {{ me.email }}
                </p>
              </div>

              <button
                matButton
                type="button"
                class="small shrink-0"
                (click)="openUpdateEmailDialog()"
              >
                <mat-icon svgIcon="mail-pen" />
                Update
              </button>
            </div>

            <mat-divider />

            <!-- Job title -->
            <div
              class="flex flex-col items-start gap-4 sm:flex-row sm:items-center"
            >
              <div class="flex flex-auto flex-col">
                <h3 class="font-medium">Job title</h3>
                <p class="text-sm text-neutral-a11">
                  Shown on your agent card in ticket details
                </p>
              </div>

              <mat-form-field class="small w-full shrink-0 sm:w-56">
                <input
                  matInput
                  type="text"
                  aria-label="Job title"
                  [formField]="profileForm.title"
                />
              </mat-form-field>
            </div>

            <mat-divider />

            <!-- Time zone -->
            <div
              class="flex flex-col items-start gap-4 sm:flex-row sm:items-center"
            >
              <div class="flex flex-auto flex-col">
                <h3 class="font-medium">Time zone</h3>
                <p class="text-sm text-neutral-a11">
                  Ticket times and SLA deadlines use this zone
                </p>
              </div>

              <mat-form-field class="small w-full shrink-0 sm:w-56">
                <mat-select
                  aria-label="Time zone"
                  [formField]="profileForm.timeZone"
                >
                  <mat-option value="pacific">Pacific Time (PT)</mat-option>
                  <mat-option value="mountain">Mountain Time (MT)</mat-option>
                  <mat-option value="central">Central Time (CT)</mat-option>
                  <mat-option value="eastern">Eastern Time (ET)</mat-option>
                  <mat-option value="utc"
                    >Coordinated Universal Time (UTC)</mat-option
                  >
                  <mat-option value="cet"
                    >Central European Time (CET)</mat-option
                  >
                </mat-select>
              </mat-form-field>
            </div>

            <mat-divider />

            <!-- Language -->
            <div
              class="flex flex-col items-start gap-4 sm:flex-row sm:items-center"
            >
              <div class="flex flex-auto flex-col">
                <h3 class="font-medium">Language</h3>
                <p class="text-sm text-neutral-a11">
                  The language of the help desk interface
                </p>
              </div>

              <mat-form-field class="small w-full shrink-0 sm:w-56">
                <mat-select
                  aria-label="Language"
                  [formField]="profileForm.language"
                >
                  <mat-option value="en-us">English (US)</mat-option>
                  <mat-option value="en-gb">English (UK)</mat-option>
                  <mat-option value="fr-fr">French (France)</mat-option>
                  <mat-option value="de-de">German (Germany)</mat-option>
                  <mat-option value="es-es">Spanish (Spain)</mat-option>
                </mat-select>
              </mat-form-field>
            </div>
          </mat-card-content>
        </mat-card>
      </section>

      <!-- Appearance -->
      <section class="flex flex-col gap-y-3">
        <div class="flex flex-col gap-y-0.5">
          <div class="text-lg font-medium">Appearance</div>
          <div class="text-neutral-a11">How the app looks on this device.</div>
        </div>

        <mat-card>
          <mat-card-content class="flex flex-col gap-y-4">
            <!-- Color scheme -->
            <div
              class="flex flex-col items-start gap-4 sm:flex-row sm:items-center"
            >
              <div class="flex flex-auto flex-col">
                <h3 class="font-medium">Color scheme</h3>
                <p class="text-sm text-neutral-a11">
                  Choose between light and dark mode, or let it follow your
                  system preference
                </p>
              </div>

              <mat-form-field class="small w-full shrink-0 sm:w-40">
                <mat-select
                  aria-label="Color scheme"
                  [(value)]="scheme"
                >
                  @for (item of schemes; track item.value) {
                    <mat-option [value]="item.value">
                      {{ item.label }}
                    </mat-option>
                  }
                </mat-select>
              </mat-form-field>
            </div>

            <mat-divider />

            <!-- Primary color -->
            <div
              class="flex flex-col items-start gap-4 sm:flex-row sm:items-center"
            >
              <div class="flex flex-auto flex-col">
                <h3 class="font-medium">Primary color</h3>
                <p class="text-sm text-neutral-a11">
                  The accent color of buttons, links and highlights
                </p>
              </div>

              <div class="flex shrink-0 items-center gap-x-2">
                @for (color of primaryColors; track color.value) {
                  <div
                    class="size-4 cursor-pointer rounded-full outline-offset-2"
                    role="button"
                    [matTooltip]="color.name"
                    [tabindex]="color.value === primaryColor() ? -1 : 0"
                    [style.background-color]="color.value"
                    [style.outline-color]="color.value"
                    [class.outline-2]="color.value === primaryColor()"
                    (click)="primaryColor.set(color.value)"
                    (keydown.enter)="primaryColor.set(color.value)"
                    (keydown.space)="primaryColor.set(color.value)"
                  ></div>
                }
              </div>
            </div>

            <mat-divider />

            <!-- Neutral color -->
            <div
              class="flex flex-col items-start gap-4 sm:flex-row sm:items-center"
            >
              <div class="flex flex-auto flex-col">
                <h3 class="font-medium">Neutral color</h3>
                <p class="text-sm text-neutral-a11">
                  The tint of backgrounds, surfaces and borders
                </p>
              </div>

              <div class="flex shrink-0 items-center gap-x-2">
                @for (color of neutralColors; track color.value) {
                  <div
                    class="size-4 cursor-pointer rounded-full outline-offset-2"
                    role="button"
                    [matTooltip]="color.name"
                    [tabindex]="color.value === neutralColor() ? -1 : 0"
                    [style.background-color]="color.value"
                    [style.outline-color]="color.value"
                    [class.outline-2]="color.value === neutralColor()"
                    (click)="neutralColor.set(color.value)"
                    (keydown.enter)="neutralColor.set(color.value)"
                    (keydown.space)="neutralColor.set(color.value)"
                  ></div>
                }
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </section>
    </div>
  `,
})
export default class AccountSettings {
  // Dependencies
  private matDialog = inject(MatDialog);
  private theming = inject(Theming);

  // State
  private me = ME;
  private scheme = signal(this.theming.scheme());
  private schemes: { label: string; value: Scheme }[] = [
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
    { label: 'System', value: 'system' },
  ];

  private primaryColor = signal(this.theming.theme().primary);
  private primaryColors = [
    {
      name: 'Crimson',
      value: '#E93D82',
    },
    {
      name: 'Plum',
      value: '#AB4ABA',
    },
    {
      name: 'Violet',
      value: '#6E56CF',
    },
    {
      name: 'Indigo',
      value: '#3E63DD',
    },
    {
      name: 'Cyan',
      value: '#00A2C7',
    },
    {
      name: 'Mint',
      value: '#86EAD4',
    },
    {
      name: 'Jade',
      value: '#29A383',
    },
    {
      name: 'Yellow',
      value: '#FFE629',
    },
    {
      name: 'Amber',
      value: '#FFC53D',
    },
    {
      name: 'Gold',
      value: '#978365',
    },
    {
      name: 'Brown',
      value: '#AD7F58',
    },
  ];

  private neutralColor = signal(this.theming.theme().neutral);
  private neutralColors = [
    {
      name: 'Gray',
      value: '#8D8D8D',
    },
    {
      name: 'Mauve',
      value: '#8E8C99',
    },
    {
      name: 'Slate',
      value: '#8B8D98',
    },
    {
      name: 'Sage',
      value: '#868E8B',
    },
    {
      name: 'Olive',
      value: '#898E87',
    },
    {
      name: 'Sand',
      value: '#8D8D86',
    },
  ];

  // Forms
  private profile = signal({
    name: ME.name,
    title: ME.title,
    timeZone: 'central',
    language: 'en-us',
  });
  private profileForm = form(this.profile, (schema) => {
    required(schema.name, { message: 'Name is required.' });
  });

  constructor() {
    // Sync scheme with theming service
    effect(() => {
      const scheme = this.scheme();
      untracked(() => {
        this.theming.scheme.set(scheme);
      });
    });

    // Sync primary color with theming service
    effect(() => {
      const primaryColor = this.primaryColor();
      untracked(() => {
        this.theming.theme.update((theme) => ({
          ...theme,
          primary: primaryColor,
        }));
      });
    });

    // Sync neutral color with theming service
    effect(() => {
      const neutralColor = this.neutralColor();
      untracked(() => {
        this.theming.theme.update((theme) => ({
          ...theme,
          neutral: neutralColor,
        }));
      });
    });
  }

  private openUpdateEmailDialog() {
    this.matDialog.open(SettingsUpdateEmail, {
      autoFocus: false,
      panelClass: bui('w-full max-w-sm').split(' '),
    });
  }
}
