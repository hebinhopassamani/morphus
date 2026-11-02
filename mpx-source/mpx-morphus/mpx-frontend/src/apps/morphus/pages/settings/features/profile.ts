import { Component, inject, signal } from '@angular/core';
import { form, FormField, FormRoot, required } from '@angular/forms/signals';
import { MatButton, MatIconButton } from '@angular/material/button';
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerToggle,
} from '@angular/material/datepicker';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import {
  MatFormField,
  MatInput,
  MatLabel,
  MatPrefix,
  MatSuffix,
} from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatTooltip } from '@angular/material/tooltip';
import { Auth } from '@core/mpx-auth';
import { SettingsUnsavedChanges } from '@morphus/pages/settings/ui/unsaved-changes';
import { SettingsUpdateEmail } from '@morphus/pages/settings/ui/update-email';

@Component({
  selector: 'settings-profile',
  imports: [
    FormField,
    FormRoot,
    MatButton,
    MatDatepicker,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatDivider,
    MatFormField,
    MatIcon,
    MatIconButton,
    MatInput,
    MatLabel,
    MatOption,
    MatPrefix,
    MatSelect,
    MatSlideToggle,
    MatSuffix,
    MatTooltip,
    SettingsUnsavedChanges,
    SettingsUpdateEmail,
  ],
  host: {
    class: 'flex flex-auto flex-col',
  },
  template: `
    <form
      class="flex flex-auto flex-col gap-y-10"
      [formRoot]="profileForm"
    >
      <!-- Profile -->
      <section class="grid gap-x-10 gap-y-8 sm:grid-cols-3">
        <div class="flex flex-col gap-y-0.5">
          <div class="text-lg font-semibold">Profile</div>
          <div class="text-neutral-a11">
            How you appear to everyone else in the workspace.
          </div>
        </div>

        <div class="grid gap-6 sm:col-span-2 sm:grid-cols-6">
          <!-- Photo -->
          <div class="col-span-full flex items-center gap-x-4">
            @let hasPhoto = !!profileForm.photo().value();

            @if (hasPhoto) {
              <img
                class="size-16 shrink-0 rounded-full object-cover"
                [src]="profileForm.photo().value()"
                alt="Profile photo"
              />
            } @else {
              <div
                class="flex size-16 shrink-0 items-center justify-center rounded-xl bg-neutral-a6"
              >
                @let initial =
                  profileForm.name().value()
                    ? profileForm.name().value()[0]
                    : null;
                @if (initial) {
                  <div class="text-4xl font-semibold">
                    {{ initial }}
                  </div>
                } @else {
                  <mat-icon svgIcon="circle-user" />
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
                  @if (hasPhoto) {
                    Change photo
                  } @else {
                    Upload photo
                  }
                </button>

                @if (hasPhoto) {
                  <button
                    matButton
                    type="button"
                    class="tertiary tiny"
                    (click)="profileForm.photo().value.set('')"
                  >
                    Delete
                  </button>
                }
              </div>
              <div class="text-sm text-neutral-a11">
                Ideal image size: 128x128px. JPG/PNG under 5MB.
              </div>
            </div>
          </div>

          <!-- Name -->
          <div class="col-span-full sm:col-span-3">
            <mat-form-field class="w-full">
              <mat-label>Name</mat-label>
              <input
                matInput
                type="text"
                [formField]="profileForm.name"
              />
            </mat-form-field>
          </div>

          <!-- Username -->
          <div class="col-span-full sm:col-span-3">
            <mat-form-field class="w-full">
              <mat-label>Username</mat-label>
              <input
                matInput
                type="text"
                [formField]="profileForm.username"
              />
              <span matTextPrefix>morphus.me/&#64;</span>
            </mat-form-field>
          </div>

          <!-- Email -->
          <div class="col-span-full flex flex-col gap-y-1">
            <div class="font-medium">Email</div>
            <div class="flex items-center gap-x-2">
              <div>{{ profileForm.email().value() }}</div>
              <div
                class="inline-flex items-center gap-x-0.5 rounded-lg bg-jade-a3 px-2 py-0.5 whitespace-nowrap text-jade-a11"
              >
                <mat-icon
                  class="size-3.5 text-current"
                  svgIcon="check"
                />
                <div class="text-sm font-medium">Verified</div>
              </div>
              <button
                matIconButton
                type="button"
                class="tiny"
                matTooltip="Update email address"
                (click)="updateEmailOpen.set(true)"
              >
                <mat-icon svgIcon="square-pen" />
              </button>
            </div>
          </div>

          <!-- Title -->
          <div class="col-span-full">
            <mat-form-field class="w-full">
              <mat-label>Title</mat-label>
              <input
                matInput
                type="text"
                [formField]="profileForm.title"
              />
            </mat-form-field>
          </div>

          <!-- Bio -->
          <div class="col-span-full">
            <mat-form-field class="w-full">
              <mat-label>Bio</mat-label>
              <textarea
                matInput
                rows="3"
                [formField]="profileForm.bio"
              ></textarea>
            </mat-form-field>
          </div>
        </div>
      </section>

      <!-- Divider -->
      <mat-divider />

      <!-- Personal -->
      <section class="grid gap-x-10 gap-y-8 sm:grid-cols-3">
        <div class="flex flex-col gap-y-0.5">
          <div class="text-lg font-semibold">Personal</div>
          <div class="text-neutral-a11">
            Details your teammates see on your member profile.
          </div>
        </div>

        <div class="grid gap-6 sm:col-span-2 sm:grid-cols-6">
          <!-- Birthday -->
          <div class="col-span-full sm:col-span-3">
            <mat-form-field class="w-full">
              <mat-label>Birthday</mat-label>
              <input
                matInput
                [matDatepicker]="birthdayPicker"
                [formField]="profileForm.birthday"
              />
              <mat-datepicker-toggle
                [for]="birthdayPicker"
                matIconSuffix
              />
              <mat-datepicker #birthdayPicker />
            </mat-form-field>
          </div>

          <!-- Phone -->
          <div class="col-span-full sm:col-span-3">
            <mat-form-field class="w-full">
              <mat-label>Phone</mat-label>
              <input
                matInput
                type="tel"
                [formField]="profileForm.phone"
              />
            </mat-form-field>
          </div>

          <!-- Location -->
          <div class="col-span-full sm:col-span-3">
            <mat-form-field class="w-full">
              <mat-label>Location</mat-label>
              <input
                matInput
                type="text"
                [formField]="profileForm.location"
              />
            </mat-form-field>
          </div>

          <!-- Pronouns -->
          <div class="col-span-full sm:col-span-3">
            <mat-form-field class="w-full">
              <mat-label>Pronouns</mat-label>
              <input
                matInput
                type="text"
                [formField]="profileForm.pronouns"
              />
            </mat-form-field>
          </div>

          <!-- Website -->
          <div class="col-span-full">
            <mat-form-field class="w-full">
              <mat-label>Website</mat-label>
              <input
                matInput
                type="text"
                [formField]="profileForm.website"
              />
              <span matTextPrefix>https://</span>
            </mat-form-field>
          </div>
        </div>
      </section>

      <!-- Divider -->
      <mat-divider />

      <!-- Availability -->
      <section class="grid gap-x-10 gap-y-8 sm:grid-cols-3">
        <div class="flex flex-col gap-y-0.5">
          <div class="text-lg font-semibold">Availability</div>
          <div class="text-neutral-a11">
            When teammates can expect to hear back from you.
          </div>
        </div>

        <div class="grid gap-6 sm:col-span-2 sm:grid-cols-6">
          <!-- Status -->
          <div class="col-span-full">
            <mat-form-field class="w-full">
              <mat-label>Status</mat-label>
              <mat-select [formField]="profileForm.status">
                <mat-option value="available">Available</mat-option>
                <mat-option value="focusing">Focusing</mat-option>
                <mat-option value="in-a-meeting">In a meeting</mat-option>
                <mat-option value="away">Away</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <!-- Working hours start -->
          <div class="col-span-full sm:col-span-3">
            <mat-form-field class="w-full">
              <mat-label>Working hours start</mat-label>
              <mat-select [formField]="profileForm.workStart">
                @for (hour of hours; track hour) {
                  <mat-option [value]="hour">{{ hour }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          </div>

          <!-- Working hours end -->
          <div class="col-span-full sm:col-span-3">
            <mat-form-field class="w-full">
              <mat-label>Working hours end</mat-label>
              <mat-select [formField]="profileForm.workEnd">
                @for (hour of hours; track hour) {
                  <mat-option [value]="hour">{{ hour }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          </div>

          <!-- Out of office -->
          <mat-slide-toggle
            class="col-span-full [--slide-toggle-gap-x:1rem]"
            fullWidth
            labelPosition="before"
            [checked]="outOfOffice()"
            (change)="outOfOffice.set($event.checked)"
          >
            <div class="flex flex-col">
              <div class="font-medium">Out of office</div>
              <div class="text-sm text-neutral-a11">
                Let teammates know you are away and may reply late.
              </div>
            </div>
          </mat-slide-toggle>
        </div>
      </section>

      <!-- Unsaved changes -->
      @if (profileForm().dirty()) {
        <settings-unsaved-changes
          class="mt-auto"
          (discard)="profileForm().reset(defaults())"
        />
      }
    </form>

    <!-- Update email -->
    <settings-update-email [(open)]="updateEmailOpen" />
  `,
})
export default class SettingsProfile {
  private readonly auth = inject(Auth);

  protected readonly updateEmailOpen = signal(false);
  protected readonly outOfOffice = signal(false);
  protected readonly hours = [
    '7:00 AM',
    '8:00 AM',
    '9:00 AM',
    '10:00 AM',
    '11:00 AM',
    '12:00 PM',
    '1:00 PM',
    '2:00 PM',
    '3:00 PM',
    '4:00 PM',
    '5:00 PM',
    '6:00 PM',
    '7:00 PM',
  ];

  private profileFormModel = signal(this.defaults());
  protected profileForm = form(
    this.profileFormModel,
    (schema) => {
      required(schema.name, { message: 'Name is required.' });
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
    const user = this.auth.user();
    return {
      photo: user?.picture || '',
      name: user?.name || 'Usuário Morphus',
      username: (user?.email?.split('@')[0] || 'morphus').toLowerCase(),
      email: user?.email || 'hebinho@morphus.com',
      title: 'System Administrator',
      bio: 'Administrador do ecossistema Morphus.',
      birthday: '1990-06-12',
      phone: '+55 (27) 99999-0000',
      location: 'Brasil',
      pronouns: 'ele/dele',
      website: 'morphus.me',
      status: 'available',
      workStart: '9:00 AM',
      workEnd: '6:00 PM',
    };
  }
}

