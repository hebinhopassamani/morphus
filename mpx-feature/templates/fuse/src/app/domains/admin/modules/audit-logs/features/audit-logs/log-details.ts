import { CdkCopyToClipboard } from '@angular/cdk/clipboard';
import { NgOptimizedImage, TitleCasePipe } from '@angular/common';
import { Component, inject, model } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { format } from 'date-fns';
import {
  AuditLog,
  AuditLogTarget,
} from '@/app/domains/admin/modules/audit-logs/data/audit-logs';
import { MembersService } from '@/app/domains/admin/modules/members/data/members';
import { ProjectsService } from '@/app/domains/admin/modules/projects/data/projects';
import { TeamsService } from '@/app/domains/admin/modules/teams/data/teams';
import {
  BuiDialog,
  BuiDialogBackdrop,
  BuiDialogBody,
  BuiDialogClose,
  BuiDialogContent,
  BuiDialogDescription,
  BuiDialogFooter,
  BuiDialogHeader,
  BuiDialogPortal,
  BuiDialogTitle,
} from '@/app/ui/dialog';

@Component({
  selector: 'audit-logs-log-details',
  imports: [
    BuiDialog,
    BuiDialogBackdrop,
    BuiDialogBody,
    BuiDialogClose,
    BuiDialogContent,
    BuiDialogDescription,
    BuiDialogFooter,
    BuiDialogHeader,
    BuiDialogPortal,
    BuiDialogTitle,
    CdkCopyToClipboard,
    MatButton,
    MatIcon,
    MatIconButton,
    MatTooltip,
    NgOptimizedImage,
    RouterLink,
    TitleCasePipe,
  ],
  template: `
    <div
      buiDialog
      class="w-full max-w-lg"
      [open]="!!log()"
      (closed)="log.set(null)"
    >
      <ng-template buiDialogPortal>
        <div buiDialogBackdrop></div>
        <div
          buiDialogContent
          class="max-w-none"
        >
          @if (log(); as log) {
            <!-- Header -->
            <div buiDialogHeader>
              <div buiDialogTitle>{{ event(log) }}</div>
              <div buiDialogDescription>{{ formatDate(log.date) }}</div>
            </div>

            <!-- Body -->
            <div
              buiDialogBody
              class="flex flex-col"
            >
              <!-- Details -->
              <div
                class="grid grid-cols-[8rem_1fr] items-center gap-x-4 gap-y-3"
              >
                <div class="text-neutral-a11">Category</div>
                <div>
                  <div
                    class="inline-flex items-center rounded-lg bg-neutral-a3 px-2 py-0.5 text-sm font-medium text-neutral-a11"
                  >
                    {{ log.category | titlecase }}
                  </div>
                </div>

                <div class="text-neutral-a11">Status</div>
                <div class="flex items-center gap-x-1.5">
                  <div
                    class="size-1.5 rounded-full"
                    [class.bg-jade-9]="log.status === 'success'"
                    [class.bg-red-9]="log.status === 'failure'"
                  ></div>
                  {{ log.status | titlecase }}
                </div>

                <div class="text-neutral-a11">Actor</div>
                <div class="flex items-center gap-x-2">
                  @switch (log.actor.type) {
                    @case ('member') {
                      @if (membersService.byId(log.actor.id); as member) {
                        <img
                          class="shrink-0 rounded-full object-cover"
                          width="20"
                          height="20"
                          [ngSrc]="member.photo"
                          [alt]="member.name"
                        />
                        <a
                          class="hover:underline"
                          [routerLink]="['/members', member.id]"
                        >
                          {{ member.name }}
                        </a>
                      }
                    }
                    @case ('system') {
                      <mat-icon
                        class="size-4 text-neutral-a11"
                        svgIcon="server"
                      />
                      System
                    }
                    @case ('api-key') {
                      <mat-icon
                        class="size-4 text-neutral-a11"
                        svgIcon="key-round"
                      />
                      {{ log.actor.name }}
                    }
                  }
                </div>

                @if (log.target; as target) {
                  <div class="text-neutral-a11">Target</div>
                  <div>
                    <a
                      class="hover:underline"
                      [routerLink]="['/', target.type, target.id]"
                    >
                      {{ targetName(target) }}
                    </a>
                  </div>
                }

                @if (log.change; as change) {
                  <div class="text-neutral-a11">Change</div>
                  <div>
                    {{ change.field }}: {{ change.from }} to {{ change.to }}
                  </div>
                }

                <div class="text-neutral-a11">Event ID</div>
                <div class="flex items-center gap-x-1">
                  <div class="truncate">{{ log.id }}</div>
                  <button
                    matIconButton
                    type="button"
                    class="tiny"
                    matTooltip="Copy to clipboard"
                    [cdkCopyToClipboard]="log.id"
                  >
                    <mat-icon svgIcon="copy" />
                  </button>
                </div>
              </div>

              @if (log.request; as request) {
                <!-- Request -->
                <div class="mt-6 font-medium">Request</div>
                <div
                  class="mt-2 grid grid-cols-[8rem_1fr] items-center gap-x-4 gap-y-3"
                >
                  <div class="text-neutral-a11">IP address</div>
                  <div class="flex items-center gap-x-1">
                    <div>{{ request.ipAddress }}</div>
                    <button
                      matIconButton
                      type="button"
                      class="tiny"
                      matTooltip="Copy to clipboard"
                      [cdkCopyToClipboard]="request.ipAddress"
                    >
                      <mat-icon svgIcon="copy" />
                    </button>
                  </div>

                  <div class="text-neutral-a11">Location</div>
                  <div>{{ request.location }}</div>

                  <div class="text-neutral-a11">Device</div>
                  <div>{{ request.device }}</div>

                  <div class="text-neutral-a11">Browser</div>
                  <div>{{ request.browser }}</div>

                  <div class="text-neutral-a11">Operating system</div>
                  <div>{{ request.os }}</div>
                </div>
              }
            </div>

            <!-- Footer -->
            <div buiDialogFooter>
              <button
                matButton
                type="button"
                buiDialogClose
              >
                Close
              </button>
            </div>
          }
        </div>
      </ng-template>
    </div>
  `,
})
export class AuditLogsLogDetails {
  // Dependencies
  private membersService = inject(MembersService);
  private projectsService = inject(ProjectsService);
  private teamsService = inject(TeamsService);

  // Inputs / Outputs
  readonly log = model<AuditLog | null>(null);

  private event(log: AuditLog) {
    const target = log.target ? ` ${this.targetName(log.target)}` : '';
    const change = log.change ? ` to ${log.change.to}` : '';
    return `${log.action}${target}${change}`;
  }

  private targetName(target: AuditLogTarget) {
    const services = {
      members: this.membersService,
      projects: this.projectsService,
      teams: this.teamsService,
    };
    return services[target.type].byId(target.id)?.name;
  }

  private formatDate(date: string) {
    return format(date, "MMMM d, yyyy 'at' h:mm a");
  }
}
