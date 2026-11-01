import { Component, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatTooltip } from '@angular/material/tooltip';
import { SettingsEyebrow } from '@/app/domains/admin/modules/settings/ui/eyebrow';

@Component({
  selector: 'channels-settings',
  imports: [
    MatButton,
    MatCard,
    MatCardContent,
    MatDivider,
    MatFormField,
    MatIcon,
    MatInput,
    MatOption,
    MatSelect,
    MatSlideToggle,
    MatTooltip,
    SettingsEyebrow,
  ],
  template: `
    <div class="flex flex-col gap-y-10">
      <!-- Header -->
      <div class="flex flex-col gap-y-3">
        <settings-eyebrow />
        <div class="flex flex-col gap-y-0.5">
          <div class="text-2xl font-semibold tracking-tighter">Channels</div>
          <div class="text-neutral-a11">
            Where customer conversations come from.
          </div>
        </div>
      </div>

      <!-- Email -->
      <section class="flex flex-col gap-y-3">
        <div class="flex flex-col gap-y-0.5">
          <div class="text-lg font-medium">Email</div>
          <div class="text-neutral-a11">
            Messages sent to your support address become tickets.
          </div>
        </div>

        <mat-card>
          <mat-card-content class="flex flex-col gap-y-4">
            <!-- Support address -->
            <div class="flex items-center gap-4">
              <div class="flex min-w-0 flex-auto flex-col">
                <h3 class="font-medium">Support address</h3>
                <p class="truncate text-sm text-neutral-a11">
                  support&#64;example.com
                </p>
              </div>

              <button
                matButton
                type="button"
                class="small shrink-0"
              >
                <mat-icon svgIcon="mail-pen" />
                Change
              </button>
            </div>

            <mat-divider />

            <!-- Forwarding -->
            <div class="flex items-center gap-4">
              <div class="flex min-w-0 flex-auto flex-col">
                <h3 class="font-medium">Forwarding</h3>
                <p class="text-sm text-neutral-a11">
                  Forward your mailbox to desk-7f3k&#64;inbound.example.com
                </p>
              </div>

              <button
                matButton
                type="button"
                class="small shrink-0"
              >
                <mat-icon svgIcon="copy" />
                Copy address
              </button>
            </div>

            <mat-divider />

            <!-- Signature -->
            <mat-slide-toggle
              class="[--slide-toggle-gap-x:1rem]"
              fullWidth
              labelPosition="before"
              checked
            >
              <div class="flex flex-col">
                <div class="font-medium">Signature</div>
                <div class="text-sm text-neutral-a11">
                  Add the agent name and team signature to email replies
                </div>
              </div>
            </mat-slide-toggle>

            <mat-divider />

            <!-- Auto-reply -->
            <mat-slide-toggle
              class="[--slide-toggle-gap-x:1rem]"
              fullWidth
              labelPosition="before"
              checked
            >
              <div class="flex flex-col">
                <div class="font-medium">Auto-reply</div>
                <div class="text-sm text-neutral-a11">
                  Confirm new tickets to the customer
                </div>
              </div>
            </mat-slide-toggle>
          </mat-card-content>
        </mat-card>
      </section>

      <!-- Widget -->
      <section class="flex flex-col gap-y-3">
        <div class="flex flex-col gap-y-0.5">
          <div class="text-lg font-medium">Widget</div>
          <div class="text-neutral-a11">
            The chat widget customers open on your site.
          </div>
        </div>

        <mat-card>
          <mat-card-content class="flex flex-col gap-y-4">
            <!-- Widget status -->
            <mat-slide-toggle
              class="[--slide-toggle-gap-x:1rem]"
              fullWidth
              labelPosition="before"
              checked
            >
              <div class="flex flex-col">
                <div class="font-medium">Widget status</div>
                <div class="text-sm text-neutral-a11">
                  Show the widget on the allowed domains
                </div>
              </div>
            </mat-slide-toggle>

            <mat-divider />

            <!-- Allowed domains -->
            <div
              class="flex flex-col items-start gap-4 sm:flex-row sm:items-center"
            >
              <div class="flex flex-auto flex-col">
                <h3 class="font-medium">Allowed domains</h3>
                <p class="text-sm text-neutral-a11">
                  The widget only loads on these sites
                </p>
              </div>

              <mat-form-field class="small w-full shrink-0 sm:w-56">
                <input
                  matInput
                  type="text"
                  aria-label="Allowed domains"
                  value="example.com"
                />
              </mat-form-field>
            </div>

            <mat-divider />

            <!-- Accent color -->
            <div
              class="flex flex-col items-start gap-4 sm:flex-row sm:items-center"
            >
              <div class="flex flex-auto flex-col">
                <h3 class="font-medium">Accent color</h3>
                <p class="text-sm text-neutral-a11">
                  The color of the launcher and the widget header
                </p>
              </div>

              <div class="flex shrink-0 items-center gap-x-2">
                @for (color of accentColors; track color.value) {
                  <div
                    class="size-4 cursor-pointer rounded-full outline-offset-2"
                    role="button"
                    [matTooltip]="color.name"
                    [tabindex]="color.value === accentColor() ? -1 : 0"
                    [style.background-color]="color.value"
                    [style.outline-color]="color.value"
                    [class.outline-2]="color.value === accentColor()"
                    (click)="accentColor.set(color.value)"
                    (keydown.enter)="accentColor.set(color.value)"
                    (keydown.space)="accentColor.set(color.value)"
                  ></div>
                }
              </div>
            </div>

            <mat-divider />

            <!-- Embed code -->
            <div class="flex items-center gap-4">
              <div class="flex flex-auto flex-col">
                <h3 class="font-medium">Embed code</h3>
                <p class="text-sm text-neutral-a11">
                  Paste the snippet before the closing body tag of your site
                </p>
              </div>

              <button
                matButton
                type="button"
                class="small shrink-0"
              >
                <mat-icon svgIcon="code-xml" />
                Copy snippet
              </button>
            </div>

            <mat-divider />

            <!-- Pre-chat form -->
            <mat-slide-toggle
              class="[--slide-toggle-gap-x:1rem]"
              fullWidth
              labelPosition="before"
            >
              <div class="flex flex-col">
                <div class="font-medium">Pre-chat form</div>
                <div class="text-sm text-neutral-a11">
                  Ask for name and email before the first message
                </div>
              </div>
            </mat-slide-toggle>
          </mat-card-content>
        </mat-card>
      </section>

      <!-- Hours -->
      <section class="flex flex-col gap-y-3">
        <div class="flex flex-col gap-y-0.5">
          <div class="text-lg font-medium">Hours</div>
          <div class="text-neutral-a11">When the team is around to answer.</div>
        </div>

        <mat-card>
          <mat-card-content class="flex flex-col gap-y-4">
            <!-- Business hours -->
            <div class="flex items-center gap-4">
              <div class="flex flex-auto flex-col">
                <h3 class="font-medium">Business hours</h3>
                <p class="text-sm text-neutral-a11">
                  Mon to Fri, 9:00 to 18:00
                </p>
              </div>

              <button
                matButton
                type="button"
                class="small shrink-0"
              >
                <mat-icon svgIcon="square-pen" />
                Edit
              </button>
            </div>

            <mat-divider />

            <!-- Time zone -->
            <div
              class="flex flex-col items-start gap-4 sm:flex-row sm:items-center"
            >
              <div class="flex flex-auto flex-col">
                <h3 class="font-medium">Time zone</h3>
                <p class="text-sm text-neutral-a11">
                  Business hours and SLA clocks run in this zone
                </p>
              </div>

              <mat-form-field class="small w-full shrink-0 sm:w-56">
                <mat-select
                  aria-label="Time zone"
                  [(value)]="timeZone"
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

            <!-- Outside hours message -->
            <mat-slide-toggle
              class="[--slide-toggle-gap-x:1rem]"
              fullWidth
              labelPosition="before"
              checked
            >
              <div class="flex flex-col">
                <div class="font-medium">Outside hours message</div>
                <div class="text-sm text-neutral-a11">
                  Tell customers when to expect a reply after hours
                </div>
              </div>
            </mat-slide-toggle>
          </mat-card-content>
        </mat-card>
      </section>
    </div>
  `,
})
export default class ChannelsSettings {
  // State
  private timeZone = signal('central');

  private accentColor = signal('#6E56CF');
  private accentColors = [
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
      name: 'Jade',
      value: '#29A383',
    },
    {
      name: 'Crimson',
      value: '#E93D82',
    },
  ];
}
