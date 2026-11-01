import { CdkCopyToClipboard } from '@angular/cdk/clipboard';
import { DatePipe, NgOptimizedImage } from '@angular/common';
import { Component, computed, inject, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import {
  MatFormField,
  MatInput,
  MatLabel,
  MatPrefix,
  MatSuffix,
} from '@angular/material/input';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatSpinner } from '@angular/material/progress-spinner';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatTooltip } from '@angular/material/tooltip';
import { differenceInMinutes, formatDistanceToNowStrict } from 'date-fns';
import {
  IntegrationCategory,
  IntegrationsService,
} from '@/app/domains/admin/modules/integrations/data/integrations';
import {
  IntegrationLevelPill,
  IntegrationStatusPill,
} from '@/app/domains/admin/modules/integrations/ui/pills';
import { IntegrationTypeTag } from '@/app/domains/admin/modules/integrations/ui/tags';
import { MembersService } from '@/app/domains/admin/modules/members/data/members';
import {
  BuiSheet,
  BuiSheetBackdrop,
  BuiSheetBody,
  BuiSheetClose,
  BuiSheetContent,
  BuiSheetFooter,
  BuiSheetHeader,
  BuiSheetPortal,
} from '@/app/ui/sheet';

const CATEGORIES: Record<IntegrationCategory, string> = {
  ai: 'AI',
  payments: 'Payments',
  shipping: 'Shipping',
  communication: 'Communication',
  analytics: 'Analytics',
  developer: 'Developer',
};

@Component({
  selector: 'integrations-integration-details',
  imports: [
    BuiSheet,
    BuiSheetBackdrop,
    BuiSheetBody,
    BuiSheetClose,
    BuiSheetContent,
    BuiSheetFooter,
    BuiSheetHeader,
    BuiSheetPortal,
    CdkCopyToClipboard,
    DatePipe,
    FormsModule,
    IntegrationLevelPill,
    IntegrationStatusPill,
    IntegrationTypeTag,
    MatButton,
    MatDivider,
    MatFormField,
    MatIcon,
    MatIconButton,
    MatInput,
    MatLabel,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    MatOption,
    MatPrefix,
    MatSelect,
    MatSlideToggle,
    MatSpinner,
    MatSuffix,
    MatTooltip,
    NgOptimizedImage,
  ],
  template: `
    <div
      buiSheet
      class="w-full sm:max-w-md"
      [open]="!!id()"
      (closed)="id.set(null)"
    >
      <ng-template buiSheetPortal>
        <div buiSheetBackdrop></div>
        <div buiSheetContent>
          @if (integration(); as integration) {
            <!-- Header -->
            <header
              buiSheetHeader
              class="flex items-center gap-x-3 border-b border-neutral-a4 py-4"
            >
              <div
                class="flex size-10 shrink-0 items-center justify-center rounded-lg"
                [class]="integration.colorClass"
              >
                <mat-icon
                  class="size-5"
                  [svgIcon]="integration.icon"
                />
              </div>
              <div class="flex min-w-0 flex-auto flex-col">
                <div class="truncate text-xl font-medium">
                  {{ integration.name }}
                </div>
                <div class="truncate text-sm text-neutral-a11">
                  {{ categories[integration.category] }}
                </div>
              </div>
              <button
                matIconButton
                buiSheetClose
                class="small"
              >
                <mat-icon svgIcon="x" />
              </button>
            </header>

            <!-- Body -->
            <div
              buiSheetBody
              class="flex flex-col py-6"
            >
              <!-- Summary -->
              <div
                class="flex justify-between gap-x-3 rounded-lg border border-neutral-a4 p-3 whitespace-nowrap"
              >
                <div class="flex min-w-0 flex-col gap-y-1">
                  <div class="text-sm text-neutral-a11">Status</div>
                  <integration-status-pill [status]="integration.status" />
                </div>
                <div class="flex min-w-0 flex-col gap-y-1">
                  <div class="text-sm text-neutral-a11">Level</div>
                  <integration-level-pill [level]="integration.level" />
                </div>
                <div class="flex min-w-0 flex-col gap-y-1">
                  <div class="text-sm text-neutral-a11">Last sync</div>
                  <div class="truncate text-sm leading-5">
                    @if (integration.syncedAt) {
                      {{ relativeDate(integration.syncedAt) }}
                    } @else {
                      <span class="text-neutral-a8">—</span>
                    }
                  </div>
                </div>
              </div>

              <div class="mt-4 text-pretty text-neutral-a11">
                {{ integration.description }}
              </div>

              <mat-divider class="my-6" />

              <!-- Details -->
              <div class="flex min-h-6 items-center gap-x-2">
                <div class="flex-auto font-medium">Details</div>
              </div>
              <div
                class="mt-2 grid grid-cols-[8rem_1fr] items-center gap-x-4 gap-y-3"
              >
                <div class="text-neutral-a11">Type</div>
                <div class="flex flex-wrap gap-1.5">
                  @for (type of integration.types; track type) {
                    <integration-type-tag [type]="type" />
                  }
                </div>

                <div class="text-neutral-a11">Access</div>
                <div>
                  @if (integration.access === 'read') {
                    Read only
                  } @else {
                    Read and write
                  }
                </div>

                @if (integration.connectedBy; as memberId) {
                  @if (membersService.byId(memberId); as member) {
                    <div class="text-neutral-a11">Connected by</div>
                    <div class="flex min-w-0 items-center gap-x-2">
                      <img
                        class="shrink-0 rounded-full object-cover"
                        width="20"
                        height="20"
                        [ngSrc]="member.photo"
                        [alt]="member.name"
                      />
                      <div class="truncate">{{ member.name }}</div>
                    </div>
                  }

                  <div class="text-neutral-a11">Connected on</div>
                  <div class="tabular-nums">
                    {{ integration.connectedAt | date: 'MMM d, y' }}
                  </div>

                  <div class="text-neutral-a11">Version</div>
                  <div>{{ integration.version }}</div>
                }
              </div>

              <mat-divider class="my-6" />

              <!-- Configuration -->
              <div class="flex min-h-6 items-center gap-x-2">
                <div class="flex-auto font-medium">Configuration</div>
                @if (integration.apiKey) {
                  <button
                    matIconButton
                    class="tiny"
                    [matMenuTriggerFor]="configurationMenu"
                  >
                    <mat-icon svgIcon="ellipsis-vertical" />
                  </button>
                  <mat-menu #configurationMenu>
                    <button mat-menu-item>
                      <mat-icon svgIcon="refresh-cw" />
                      Rotate key
                    </button>
                  </mat-menu>
                }
              </div>
              <div class="mt-3 flex flex-col gap-y-4">
                @if (integration.serverUrl; as serverUrl) {
                  <mat-form-field class="w-full">
                    <mat-label>Server URL</mat-label>
                    <input
                      matInput
                      readonly
                      [value]="serverUrl"
                    />
                    <button
                      matIconButton
                      matIconSuffix
                      matTooltip="Copy to clipboard"
                      [cdkCopyToClipboard]="serverUrl"
                    >
                      <mat-icon svgIcon="copy" />
                    </button>
                  </mat-form-field>
                }

                @if (integration.apiKey; as apiKey) {
                  <mat-form-field class="w-full">
                    <mat-label>API key</mat-label>
                    <input
                      matInput
                      type="password"
                      autocomplete="off"
                      [placeholder]="apiKey"
                    />
                  </mat-form-field>
                }

                @if (integration.models; as models) {
                  <mat-form-field class="w-full">
                    <mat-label>Default model</mat-label>
                    <mat-select
                      [value]="integration.model"
                      (valueChange)="
                        integrationsService.update(integration.id, {
                          model: $event,
                        })
                      "
                    >
                      @for (model of models; track model) {
                        <mat-option [value]="model">{{ model }}</mat-option>
                      }
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field class="w-full">
                    <mat-label>Monthly spend limit</mat-label>
                    <span matTextPrefix>$</span>
                    <input
                      matInput
                      type="number"
                      min="0"
                      [ngModel]="integration.spendLimit"
                      (ngModelChange)="
                        integrationsService.update(integration.id, {
                          spendLimit: $event,
                        })
                      "
                    />
                  </mat-form-field>
                }

                @if (integration.webhookUrl; as webhookUrl) {
                  <mat-form-field class="w-full">
                    <mat-label>Webhook URL</mat-label>
                    <input
                      matInput
                      readonly
                      [value]="webhookUrl"
                    />
                    <button
                      matIconButton
                      matIconSuffix
                      matTooltip="Copy to clipboard"
                      [cdkCopyToClipboard]="webhookUrl"
                    >
                      <mat-icon svgIcon="copy" />
                    </button>
                  </mat-form-field>
                }

                <div class="flex flex-col gap-y-3">
                  @for (setting of integration.settings; track setting.id) {
                    <mat-slide-toggle
                      fullWidth
                      labelPosition="before"
                      [checked]="setting.enabled"
                      (change)="
                        integrationsService.toggle(integration.id, setting.id)
                      "
                    >
                      {{ setting.label }}
                    </mat-slide-toggle>
                  }
                </div>
              </div>

              <mat-divider class="my-6" />

              <!-- Permissions -->
              <div class="flex min-h-6 items-center gap-x-2">
                <div class="flex-auto font-medium">Permissions</div>
              </div>
              <ul class="mt-2 flex flex-col gap-y-2">
                @for (permission of integration.permissions; track permission) {
                  <li class="flex items-center gap-x-2">
                    <mat-icon
                      class="size-4 text-neutral-a10"
                      svgIcon="check"
                    />
                    {{ permission }}
                  </li>
                }
              </ul>

              @if (integration.assistantActivity; as activity) {
                <mat-divider class="my-6" />

                <!-- Assistant activity -->
                <div class="flex min-h-6 items-center gap-x-2">
                  <div class="flex-auto font-medium">Assistant activity</div>
                </div>
                <ul class="mt-3 flex flex-col">
                  @for (entry of activity; track entry.id; let last = $last) {
                    <li class="flex gap-x-3">
                      <div class="flex flex-col items-center">
                        <div
                          class="flex size-7 shrink-0 items-center justify-center rounded-full bg-neutral-a4"
                        >
                          <mat-icon
                            class="size-3.5 text-neutral-a11"
                            [svgIcon]="entry.icon"
                          />
                        </div>

                        @if (!last) {
                          <div class="w-px flex-auto bg-neutral-a4"></div>
                        }
                      </div>

                      <div
                        class="flex flex-auto flex-col"
                        [class.pb-5]="!last"
                      >
                        <div class="leading-7 text-pretty text-neutral-a11">
                          <span class="font-medium text-neutral-12">{{
                            entry.title
                          }}</span>
                          {{ entry.text }}
                        </div>
                        <div class="text-sm text-neutral-a11">
                          {{ relativeDate(entry.date) }}
                        </div>
                      </div>
                    </li>
                  }
                </ul>
              }

              <mat-divider class="my-6" />

              <!-- Activity -->
              <div class="flex min-h-6 items-center gap-x-2">
                <div class="flex-auto font-medium">Activity</div>
                @if (integration.events.length) {
                  <button
                    matIconButton
                    class="tiny"
                    [matMenuTriggerFor]="activityMenu"
                  >
                    <mat-icon svgIcon="ellipsis-vertical" />
                  </button>
                  <mat-menu #activityMenu>
                    <button
                      mat-menu-item
                      (click)="integrationsService.clearHistory(integration.id)"
                    >
                      <mat-icon svgIcon="trash" />
                      Clear history
                    </button>
                  </mat-menu>
                }
              </div>
              <ul class="mt-3 flex flex-col">
                @for (
                  entry of integration.events;
                  track entry.id;
                  let last = $last
                ) {
                  <li class="flex gap-x-3">
                    <div class="flex flex-col items-center">
                      <div
                        class="flex size-7 shrink-0 items-center justify-center rounded-full"
                        [class.bg-jade-a4]="entry.kind === 'success'"
                        [class.bg-red-a4]="entry.kind === 'failure'"
                        [class.bg-neutral-a4]="
                          entry.kind === 'running' || entry.kind === 'neutral'
                        "
                      >
                        @switch (entry.kind) {
                          @case ('success') {
                            <mat-icon
                              class="size-3.5 text-jade-a11"
                              svgIcon="check"
                            />
                          }
                          @case ('failure') {
                            <mat-icon
                              class="size-3.5 text-red-a11"
                              svgIcon="triangle-alert"
                            />
                          }
                          @case ('neutral') {
                            <mat-icon
                              class="size-3.5 text-neutral-a11"
                              svgIcon="unplug"
                            />
                          }
                          @default {
                            <mat-spinner diameter="14" />
                          }
                        }
                      </div>

                      @if (!last) {
                        <div class="w-px flex-auto bg-neutral-a4"></div>
                      }
                    </div>

                    <div
                      class="flex flex-auto flex-col"
                      [class.pb-5]="!last"
                    >
                      <div class="leading-7 text-pretty text-neutral-a11">
                        <span class="font-medium text-neutral-12">{{
                          entry.title
                        }}</span>
                        {{ entry.text }}
                      </div>
                      <div class="text-sm text-neutral-a11">
                        {{ relativeDate(entry.date) }}
                      </div>
                    </div>
                  </li>
                } @empty {
                  <li class="text-neutral-a11">No activity yet.</li>
                }
              </ul>
            </div>

            <!-- Footer -->
            <div
              buiSheetFooter
              class="border-t border-neutral-a4 py-4"
            >
              @switch (integration.status) {
                @case ('not-connected') {
                  <button
                    matButton
                    class="primary"
                    (click)="integrationsService.connect(integration)"
                  >
                    Connect
                  </button>
                }
                @default {
                  <button
                    matButton
                    class="me-auto"
                    (click)="integrationsService.disconnect(integration)"
                  >
                    Disconnect
                  </button>
                  <button matButton>View docs</button>
                  @if (integration.status === 'needs-attention') {
                    <button
                      matButton
                      class="primary"
                      (click)="integrationsService.connect(integration)"
                    >
                      Reconnect
                    </button>
                  } @else {
                    <button
                      matButton
                      class="primary"
                      [disabled]="integration.events.at(0)?.kind === 'running'"
                      (click)="integrationsService.sync(integration)"
                    >
                      Sync now
                    </button>
                  }
                }
              }
            </div>
          }
        </div>
      </ng-template>
    </div>
  `,
})
export class IntegrationsIntegrationDetails {
  // Dependencies
  private integrationsService = inject(IntegrationsService);
  private membersService = inject(MembersService);

  // Inputs / Outputs
  readonly id = model<string | null>(null);

  // Data
  private categories = CATEGORIES;

  // Computed state
  private integration = computed(() => {
    const id = this.id();
    return id && this.integrationsService.byId(id);
  });

  private relativeDate(date: string) {
    return differenceInMinutes(new Date(), date) < 1
      ? 'Just now'
      : `${formatDistanceToNowStrict(date)} ago`;
  }
}
