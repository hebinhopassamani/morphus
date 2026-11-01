import { DatePipe, NgOptimizedImage, TitleCasePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatPseudoCheckbox } from '@angular/material/core';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { add } from 'date-fns';
import {
  AgentRole,
  AgentsService,
  AgentStatus,
} from '@/app/domains/admin/modules/agents/data/agents';
import { SettingsEyebrow } from '@/app/domains/admin/modules/settings/ui/eyebrow';

const ROLES: { id: AgentRole; label: string }[] = [
  {
    id: 'admin',
    label: 'Admin',
  },
  {
    id: 'agent',
    label: 'Agent',
  },
];

const STATUSES: Record<AgentStatus, { label: string; color: string }> = {
  online: {
    label: 'Online',
    color: 'bg-green-a9',
  },
  away: {
    label: 'Away',
    color: 'bg-amber-a9',
  },
  offline: {
    label: 'Offline',
    color: 'bg-neutral-a9',
  },
};

const now = new Date();

const INVITATIONS: { email: string; role: AgentRole; invitedAt: string }[] = [
  {
    email: 'dana.whitfield@example.com',
    role: 'agent',
    invitedAt: add(now, { days: -2 }).toISOString(),
  },
  {
    email: 'tomas.lindqvist@example.com',
    role: 'agent',
    invitedAt: add(now, { days: -5 }).toISOString(),
  },
  {
    email: 'grace.okafor@example.com',
    role: 'admin',
    invitedAt: add(now, { days: -9 }).toISOString(),
  },
];

@Component({
  selector: 'team-settings',
  imports: [
    DatePipe,
    MatButton,
    MatCard,
    MatCardContent,
    MatDivider,
    MatIcon,
    MatIconButton,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    MatPseudoCheckbox,
    NgOptimizedImage,
    SettingsEyebrow,
    TitleCasePipe,
  ],
  template: `
    <div class="flex flex-col gap-y-10">
      <!-- Header -->
      <div class="flex flex-col gap-y-3">
        <settings-eyebrow />
        <div class="flex flex-col gap-y-0.5">
          <div class="text-2xl font-semibold tracking-tighter">
            Team and agents
          </div>
          <div class="text-neutral-a11">
            Who answers tickets and what they can change.
          </div>
        </div>
      </div>

      <!-- Invite -->
      <section class="flex flex-col gap-y-3">
        <div class="flex flex-col gap-y-0.5">
          <div class="text-lg font-medium">Invite</div>
          <div class="text-neutral-a11">Bring new agents into the desk.</div>
        </div>

        <mat-card>
          <mat-card-content class="flex flex-col gap-y-4">
            <!-- Invite by email -->
            <div class="flex items-center gap-4">
              <div class="flex flex-auto flex-col">
                <h3 class="font-medium">Invite by email</h3>
                <p class="text-sm text-neutral-a11">
                  Send an invitation with the role picked up front
                </p>
              </div>

              <button
                matButton
                type="button"
                class="small shrink-0"
              >
                <mat-icon svgIcon="user-round-plus" />
                Invite
              </button>
            </div>

            <mat-divider />

            <!-- Invitation link -->
            <div class="flex items-center gap-4">
              <div class="flex flex-auto flex-col">
                <h3 class="font-medium">Invitation link</h3>
                <p class="text-sm text-neutral-a11">
                  Anyone with the link joins as an agent
                </p>
              </div>

              <button
                matButton
                type="button"
                class="small shrink-0"
              >
                <mat-icon svgIcon="link" />
                Copy link
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </section>

      <!-- Agents -->
      <section class="flex flex-col gap-y-3">
        <div class="flex flex-col gap-y-0.5">
          <div class="text-lg font-medium">Agents</div>
          <div class="text-neutral-a11">
            Everyone who can be assigned tickets.
          </div>
        </div>

        <mat-card>
          <mat-card-content class="flex flex-col gap-y-4">
            @for (agent of agents(); track agent.id; let last = $last) {
              @let status = statuses[agent.status];
              <div class="flex items-center gap-4">
                <div class="flex min-w-0 flex-auto items-center gap-x-3">
                  <img
                    class="size-9 shrink-0 rounded-full object-cover"
                    width="36"
                    height="36"
                    [ngSrc]="agent.photo"
                    [alt]="agent.name"
                  />
                  <div class="flex min-w-0 flex-col">
                    <h3 class="font-medium">{{ agent.name }}</h3>
                    <p class="truncate text-sm text-neutral-a11">
                      {{ agent.email }}
                    </p>
                  </div>
                </div>

                <div class="flex shrink-0 items-center gap-x-3">
                  <div
                    class="flex items-center gap-x-1.5 text-sm text-neutral-a11"
                  >
                    <div
                      class="size-1.5 rounded-full"
                      [class]="status.color"
                    ></div>
                    {{ status.label }}
                  </div>
                  <div class="text-sm">{{ agent.role | titlecase }}</div>
                  <button
                    matIconButton
                    class="tiny"
                    [matMenuTriggerFor]="agentActions"
                  >
                    <mat-icon svgIcon="ellipsis-vertical" />
                  </button>
                </div>
              </div>
              <mat-menu
                xPosition="before"
                #agentActions="matMenu"
              >
                <button
                  mat-menu-item
                  [matMenuTriggerFor]="roleMenu"
                >
                  <mat-icon svgIcon="user-round-cog" />
                  Change role
                </button>
                <mat-divider />
                <button
                  mat-menu-item
                  class="text-red-a11 hover:bg-red-a3"
                >
                  <mat-icon
                    class="text-red-a11"
                    svgIcon="user-round-x"
                  />
                  Deactivate
                </button>
              </mat-menu>
              <mat-menu #roleMenu="matMenu">
                @for (option of roleOptions; track option.id) {
                  <button
                    mat-menu-item
                    (click)="agentsService.setRole(agent.id, option.id)"
                  >
                    <mat-pseudo-checkbox
                      appearance="minimal"
                      [state]="
                        agent.role === option.id ? 'checked' : 'unchecked'
                      "
                    />
                    <span class="ms-1">{{ option.label }}</span>
                  </button>
                }
              </mat-menu>

              @if (!last) {
                <mat-divider />
              }
            }
          </mat-card-content>
        </mat-card>
      </section>

      <!-- Pending invitations -->
      <section class="flex flex-col gap-y-3">
        <div class="flex flex-col gap-y-0.5">
          <div class="text-lg font-medium">Pending invitations</div>
          <div class="text-neutral-a11">
            Invited agents who have not joined yet.
          </div>
        </div>

        <mat-card>
          <mat-card-content class="flex flex-col gap-y-4">
            @for (
              invitation of invitations;
              track invitation.email;
              let last = $last
            ) {
              <div class="flex items-center gap-4">
                <div class="flex min-w-0 flex-auto flex-col">
                  <h3 class="truncate font-medium">{{ invitation.email }}</h3>
                  <p class="text-sm text-neutral-a11">
                    {{ invitation.role | titlecase }} · Invited
                    {{ invitation.invitedAt | date: 'MMM d' }}
                  </p>
                </div>

                <button
                  matIconButton
                  class="tiny shrink-0"
                  [matMenuTriggerFor]="invitationActions"
                >
                  <mat-icon svgIcon="ellipsis-vertical" />
                </button>
              </div>
              <mat-menu
                xPosition="before"
                #invitationActions="matMenu"
              >
                <button mat-menu-item>
                  <mat-icon svgIcon="send" />
                  Resend invitation
                </button>
                <mat-divider />
                <button
                  mat-menu-item
                  class="text-red-a11 hover:bg-red-a3"
                >
                  <mat-icon
                    class="text-red-a11"
                    svgIcon="x"
                  />
                  Revoke invitation
                </button>
              </mat-menu>

              @if (!last) {
                <mat-divider />
              }
            }
          </mat-card-content>
        </mat-card>
      </section>
    </div>
  `,
})
export default class TeamSettings {
  // Dependencies
  private agentsService = inject(AgentsService);

  // State
  private roleOptions = ROLES;
  private statuses = STATUSES;
  private invitations = INVITATIONS;

  // Computed state
  private agents = computed(() =>
    [...this.agentsService.agents()].sort((a, b) =>
      a.name.localeCompare(b.name)
    )
  );
}
