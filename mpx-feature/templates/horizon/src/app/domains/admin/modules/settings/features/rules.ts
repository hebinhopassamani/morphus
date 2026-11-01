import { Component, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatFormField } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { SettingsEyebrow } from '@/app/domains/admin/modules/settings/ui/eyebrow';
import {
  PRIORITIES,
  TicketPriority,
} from '@/app/domains/admin/modules/tickets/data/tickets';

const FIRST_RESPONSE_TIMES = ['15 min', '30 min', '1 h', '4 h', '8 h'];

const RESOLUTION_TIMES = ['4 h', '8 h', '24 h', '48 h', '72 h'];

const TARGETS: Record<
  TicketPriority,
  { firstResponse: string; resolution: string }
> = {
  urgent: {
    firstResponse: '15 min',
    resolution: '4 h',
  },
  high: {
    firstResponse: '1 h',
    resolution: '8 h',
  },
  normal: {
    firstResponse: '4 h',
    resolution: '24 h',
  },
  low: {
    firstResponse: '8 h',
    resolution: '72 h',
  },
};

const RULES: {
  name: string;
  description: string;
  enabled: boolean;
}[] = [
  {
    name: 'Route billing questions',
    description:
      'When the subject contains "invoice", assign to the Billing specialist',
    enabled: true,
  },
  {
    name: 'Escalate urgent',
    description: 'When priority is Urgent, notify admins',
    enabled: true,
  },
  {
    name: 'Close silent tickets',
    description:
      'When a pending ticket has no customer reply for 7 days, close it',
    enabled: true,
  },
  {
    name: 'Tag widget chats',
    description: 'When channel is Widget, add the tag Chat',
    enabled: false,
  },
  {
    name: 'Round robin',
    description: 'When a ticket is created, assign to the next available agent',
    enabled: true,
  },
  {
    name: 'SLA warning',
    description:
      'When first response is 15 minutes from breach, notify the assignee',
    enabled: true,
  },
];

@Component({
  selector: 'rules-settings',
  imports: [
    MatButton,
    MatCard,
    MatCardContent,
    MatDivider,
    MatFormField,
    MatIcon,
    MatOption,
    MatSelect,
    MatSlideToggle,
    SettingsEyebrow,
  ],
  template: `
    <div class="flex flex-col gap-y-10">
      <!-- Header -->
      <div class="flex flex-col gap-y-3">
        <settings-eyebrow />
        <div class="flex flex-col gap-y-0.5">
          <div class="text-2xl font-semibold tracking-tighter">Rules</div>
          <div class="text-neutral-a11">
            SLA targets and automations that run on new tickets.
          </div>
        </div>
      </div>

      <!-- SLA targets -->
      <section class="flex flex-col gap-y-3">
        <div class="flex flex-col gap-y-0.5">
          <div class="text-lg font-medium">SLA targets</div>
          <div class="text-neutral-a11">
            How fast each priority gets a reply and a fix.
          </div>
        </div>

        <mat-card>
          <mat-card-content class="flex flex-col gap-y-4">
            @for (priority of priorities; track priority.id; let last = $last) {
              @let target = targets[priority.id];
              <div
                class="flex flex-col items-start gap-4 sm:flex-row sm:items-center"
              >
                <div class="flex flex-auto flex-col">
                  <h3 class="font-medium">{{ priority.label }}</h3>
                  <p class="text-sm text-neutral-a11">
                    First response and resolution targets
                  </p>
                </div>

                <div class="flex shrink-0 items-center gap-x-2">
                  <div class="flex flex-col gap-y-1">
                    <div
                      class="text-xs text-neutral-a11"
                      [id]="priority.id + '-first-response'"
                    >
                      First response
                    </div>
                    <mat-form-field class="small w-28">
                      <mat-select
                        [aria-labelledby]="priority.id + '-first-response'"
                        [value]="target.firstResponse"
                      >
                        @for (time of firstResponseTimes; track time) {
                          <mat-option [value]="time">{{ time }}</mat-option>
                        }
                      </mat-select>
                    </mat-form-field>
                  </div>

                  <div class="flex flex-col gap-y-1">
                    <div
                      class="text-xs text-neutral-a11"
                      [id]="priority.id + '-resolution'"
                    >
                      Resolution
                    </div>
                    <mat-form-field class="small w-28">
                      <mat-select
                        [aria-labelledby]="priority.id + '-resolution'"
                        [value]="target.resolution"
                      >
                        @for (time of resolutionTimes; track time) {
                          <mat-option [value]="time">{{ time }}</mat-option>
                        }
                      </mat-select>
                    </mat-form-field>
                  </div>
                </div>
              </div>

              @if (!last) {
                <mat-divider />
              }
            }
          </mat-card-content>
        </mat-card>
      </section>

      <!-- Automations -->
      <section class="flex flex-col gap-y-3">
        <div class="flex items-end gap-4">
          <div class="flex flex-auto flex-col gap-y-0.5">
            <div class="text-lg font-medium">Automations</div>
            <div class="text-neutral-a11">
              Actions that run on their own when a condition is met.
            </div>
          </div>

          <button
            matButton
            type="button"
            class="small shrink-0"
          >
            <mat-icon svgIcon="plus" />
            New rule
          </button>
        </div>

        <mat-card>
          <mat-card-content class="flex flex-col gap-y-4">
            @for (rule of rules; track rule.name; let last = $last) {
              <mat-slide-toggle
                class="[--slide-toggle-gap-x:1rem]"
                fullWidth
                labelPosition="before"
                [checked]="rule.enabled"
              >
                <div class="flex flex-col">
                  <div class="font-medium">{{ rule.name }}</div>
                  <div class="text-sm text-neutral-a11">
                    {{ rule.description }}
                  </div>
                </div>
              </mat-slide-toggle>

              @if (!last) {
                <mat-divider />
              }
            }
          </mat-card-content>
        </mat-card>
      </section>

      <!-- Advanced -->
      <section class="flex flex-col gap-y-3">
        <div class="flex flex-col gap-y-0.5">
          <div class="text-lg font-medium">Advanced</div>
          <div class="text-neutral-a11">
            Defaults for how tickets move between agents.
          </div>
        </div>

        <mat-card>
          <mat-card-content class="flex flex-col gap-y-4">
            <!-- Round robin skips away agents -->
            <mat-slide-toggle
              class="[--slide-toggle-gap-x:1rem]"
              fullWidth
              labelPosition="before"
              checked
            >
              <div class="flex flex-col">
                <div class="font-medium">Round robin skips away agents</div>
                <div class="text-sm text-neutral-a11">
                  Only online agents get new tickets in rotation
                </div>
              </div>
            </mat-slide-toggle>

            <mat-divider />

            <!-- Reopen on customer reply -->
            <mat-slide-toggle
              class="[--slide-toggle-gap-x:1rem]"
              fullWidth
              labelPosition="before"
              checked
            >
              <div class="flex flex-col">
                <div class="font-medium">Reopen on customer reply</div>
                <div class="text-sm text-neutral-a11">
                  A reply to a closed ticket moves it back to open
                </div>
              </div>
            </mat-slide-toggle>

            <mat-divider />

            <!-- Default priority -->
            <div
              class="flex flex-col items-start gap-4 sm:flex-row sm:items-center"
            >
              <div class="flex flex-auto flex-col">
                <h3 class="font-medium">Default priority</h3>
                <p class="text-sm text-neutral-a11">
                  Set on new tickets until an agent or a rule changes it
                </p>
              </div>

              <mat-form-field class="small w-full shrink-0 sm:w-40">
                <mat-select
                  aria-label="Default priority"
                  [(value)]="defaultPriority"
                >
                  @for (priority of priorities; track priority.id) {
                    <mat-option [value]="priority.id">
                      {{ priority.label }}
                    </mat-option>
                  }
                </mat-select>
              </mat-form-field>
            </div>
          </mat-card-content>
        </mat-card>
      </section>
    </div>
  `,
})
export default class RulesSettings {
  // State
  private priorities = PRIORITIES;
  private targets = TARGETS;
  private firstResponseTimes = FIRST_RESPONSE_TIMES;
  private resolutionTimes = RESOLUTION_TIMES;
  private rules = RULES;
  private defaultPriority = signal<TicketPriority>('normal');
}
