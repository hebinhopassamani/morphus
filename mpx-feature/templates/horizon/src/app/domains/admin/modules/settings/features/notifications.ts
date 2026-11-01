import { Component } from '@angular/core';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatDivider } from '@angular/material/divider';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { SettingsEyebrow } from '@/app/domains/admin/modules/settings/ui/eyebrow';

@Component({
  selector: 'notifications-settings',
  imports: [
    MatCard,
    MatCardContent,
    MatDivider,
    MatSlideToggle,
    SettingsEyebrow,
  ],
  template: `
    <div class="flex flex-col gap-y-10">
      <!-- Header -->
      <div class="flex flex-col gap-y-3">
        <settings-eyebrow />
        <div class="flex flex-col gap-y-0.5">
          <div class="text-2xl font-semibold tracking-tighter">
            Notifications
          </div>
          <div class="text-neutral-a11">
            What the help desk tells you about, and where.
          </div>
        </div>
      </div>

      <!-- Tickets -->
      <section class="flex flex-col gap-y-3">
        <div class="flex flex-col gap-y-0.5">
          <div class="text-lg font-medium">Tickets</div>
          <div class="text-neutral-a11">
            Activity on the tickets you own or follow.
          </div>
        </div>

        <mat-card>
          <mat-card-content class="flex flex-col gap-y-4">
            <!-- Assigned to me -->
            <mat-slide-toggle
              class="[--slide-toggle-gap-x:1rem]"
              fullWidth
              labelPosition="before"
              checked
            >
              <div class="flex flex-col">
                <div class="font-medium">Assigned to me</div>
                <div class="text-sm text-neutral-a11">
                  A ticket is assigned to you by a teammate or a rule
                </div>
              </div>
            </mat-slide-toggle>

            <mat-divider />

            <!-- New replies -->
            <mat-slide-toggle
              class="[--slide-toggle-gap-x:1rem]"
              fullWidth
              labelPosition="before"
              checked
            >
              <div class="flex flex-col">
                <div class="font-medium">New replies</div>
                <div class="text-sm text-neutral-a11">
                  A customer replies to one of your tickets
                </div>
              </div>
            </mat-slide-toggle>

            <mat-divider />

            <!-- Mentions -->
            <mat-slide-toggle
              class="[--slide-toggle-gap-x:1rem]"
              fullWidth
              labelPosition="before"
              checked
            >
              <div class="flex flex-col">
                <div class="font-medium">Mentions</div>
                <div class="text-sm text-neutral-a11">
                  A teammate mentions you in an internal note
                </div>
              </div>
            </mat-slide-toggle>

            <mat-divider />

            <!-- SLA warnings -->
            <mat-slide-toggle
              class="[--slide-toggle-gap-x:1rem]"
              fullWidth
              labelPosition="before"
              checked
            >
              <div class="flex flex-col">
                <div class="font-medium">SLA warnings</div>
                <div class="text-sm text-neutral-a11">
                  One of your tickets is about to breach its SLA
                </div>
              </div>
            </mat-slide-toggle>
          </mat-card-content>
        </mat-card>
      </section>

      <!-- Delivery -->
      <section class="flex flex-col gap-y-3">
        <div class="flex flex-col gap-y-0.5">
          <div class="text-lg font-medium">Delivery</div>
          <div class="text-neutral-a11">Where notifications reach you.</div>
        </div>

        <mat-card>
          <mat-card-content class="flex flex-col gap-y-4">
            <!-- In-app -->
            <mat-slide-toggle
              class="[--slide-toggle-gap-x:1rem]"
              fullWidth
              labelPosition="before"
              checked
            >
              <div class="flex flex-col">
                <div class="font-medium">In-app</div>
                <div class="text-sm text-neutral-a11">
                  The notifications panel on the rail
                </div>
              </div>
            </mat-slide-toggle>

            <mat-divider />

            <!-- Email -->
            <mat-slide-toggle
              class="[--slide-toggle-gap-x:1rem]"
              fullWidth
              labelPosition="before"
              checked
            >
              <div class="flex flex-col">
                <div class="font-medium">Email</div>
                <div class="text-sm text-neutral-a11">
                  Sent to john&#64;example.com as things happen
                </div>
              </div>
            </mat-slide-toggle>

            <mat-divider />

            <!-- Push -->
            <mat-slide-toggle
              class="[--slide-toggle-gap-x:1rem]"
              fullWidth
              labelPosition="before"
            >
              <div class="flex flex-col">
                <div class="font-medium">Push</div>
                <div class="text-sm text-neutral-a11">
                  Desktop and mobile alerts while you are away from the desk
                </div>
              </div>
            </mat-slide-toggle>
          </mat-card-content>
        </mat-card>
      </section>

      <!-- Digest -->
      <section class="flex flex-col gap-y-3">
        <div class="flex flex-col gap-y-0.5">
          <div class="text-lg font-medium">Digest</div>
          <div class="text-neutral-a11">A recap sent to your inbox.</div>
        </div>

        <mat-card>
          <mat-card-content class="flex flex-col gap-y-4">
            <!-- Daily digest -->
            <mat-slide-toggle
              class="[--slide-toggle-gap-x:1rem]"
              fullWidth
              labelPosition="before"
              checked
            >
              <div class="flex flex-col">
                <div class="font-medium">Daily digest</div>
                <div class="text-sm text-neutral-a11">
                  Your open tickets, overdue replies and yesterday's volume
                  every morning
                </div>
              </div>
            </mat-slide-toggle>
          </mat-card-content>
        </mat-card>
      </section>
    </div>
  `,
})
export default class NotificationsSettings {}
