import { NgOptimizedImage } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardHeader } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatInput, MatPrefix } from '@angular/material/input';
import { RouterLink } from '@angular/router';
import { MembersService } from '@/app/domains/admin/modules/members/data/members';
import { TeamsService } from '@/app/domains/admin/modules/teams/data/teams';
import { TeamsNewTeam } from '@/app/domains/admin/modules/teams/features/teams/new-team';

@Component({
  selector: 'teams',
  imports: [
    FormsModule,
    MatButton,
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatIcon,
    NgOptimizedImage,
    RouterLink,
    MatFormField,
    MatInput,
    MatPrefix,
    TeamsNewTeam,
  ],
  template: `
    <div
      class="mx-auto flex w-full max-w-7xl flex-auto flex-col gap-4 p-6 sm:gap-6 lg:p-8"
    >
      <!-- Header -->
      <div class="flex items-center justify-between gap-x-3">
        <div class="flex flex-col gap-y-0.5">
          <div class="text-3xl font-semibold tracking-tighter">Teams</div>
          <div class="text-neutral-a11 sm:text-lg">
            Who works together, who leads them and what they own.
          </div>
        </div>

        <!-- Spacer -->
        <div class="flex-auto"></div>

        <!-- Actions -->
        <div class="flex shrink-0 items-center gap-x-3">
          <button
            matButton
            class="primary"
            (click)="newTeamOpen.set(true)"
          >
            <mat-icon svgIcon="plus" />
            New team
          </button>
        </div>
      </div>

      <div class="flex flex-col gap-y-3">
        <!-- Search -->
        <mat-form-field class="w-full max-w-72">
          <input
            matInput
            placeholder="Search teams"
            [ngModel]="search()"
            (ngModelChange)="search.set($event)"
          />
          <mat-icon
            svgIcon="search"
            matIconPrefix
          />
        </mat-form-field>

        <!-- Teams -->
        <div
          class="grid gap-4 border-t border-neutral-a4 pt-3 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3"
        >
          @for (team of filteredTeams(); track team.id) {
            <mat-card
              appearance="filled"
              class="flex cursor-pointer flex-col"
              [routerLink]="team.id"
            >
              <mat-card-header>
                <div class="flex flex-auto items-center gap-x-2">
                  <div
                    class="size-2.5 shrink-0 rounded-full"
                    [class]="team.colorClass"
                  ></div>
                  <div class="flex-auto truncate font-medium">
                    {{ team.name }}
                  </div>
                </div>
              </mat-card-header>
              <mat-card-content class="flex flex-auto flex-col gap-y-4">
                <div class="line-clamp-2 text-neutral-a11">
                  {{ team.description }}
                </div>

                @if (team.lead; as lead) {
                  <div class="flex items-center gap-x-2 text-sm">
                    <img
                      class="shrink-0 rounded-full object-cover"
                      width="20"
                      height="20"
                      [ngSrc]="lead.photo"
                      [alt]="lead.name"
                    />
                    <div class="truncate">{{ lead.name }}</div>
                    <div class="text-neutral-a11">Lead</div>
                  </div>
                }

                <div
                  class="mt-auto flex items-center gap-x-2 border-t border-neutral-a4 pt-4"
                >
                  <div class="flex shrink-0 items-center -space-x-1">
                    @for (member of team.members; track member.id) {
                      @if ($index < 4) {
                        <img
                          class="shrink-0 rounded-full object-cover ring-2 ring-white outline -outline-offset-1 outline-black-a3 dark:ring-neutral-2 dark:outline-white-a3"
                          width="20"
                          height="20"
                          [ngSrc]="member.photo"
                          [alt]="member.name"
                        />
                      }
                    }
                    @if (team.members.length > 4) {
                      <div
                        class="flex size-5 shrink-0 items-center justify-center rounded-full bg-neutral-4 text-sm font-medium text-neutral-a11 ring-2 ring-white dark:ring-neutral-2"
                      >
                        +{{ team.members.length - 4 }}
                      </div>
                    }
                  </div>
                  <div class="ms-auto text-sm text-neutral-a11 tabular-nums">
                    {{ team.members.length }} members ·
                    {{ team.projectIds.length }} projects
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          } @empty {
            <div
              class="flex flex-col items-center justify-center gap-y-2 py-10 sm:col-span-2 xl:col-span-3"
            >
              <mat-icon
                class="size-10"
                svgIcon="users-round"
              />
              <div class="text-center text-neutral-a11">
                No teams match this search.
              </div>
            </div>
          }
        </div>
      </div>
    </div>

    <!-- New team -->
    <teams-new-team [(open)]="newTeamOpen" />
  `,
})
export default class Teams {
  // Dependencies
  private teamsService = inject(TeamsService);
  private membersService = inject(MembersService);

  // State
  private search = signal('');
  private newTeamOpen = signal(false);

  // Computed state
  private filteredTeams = computed(() => {
    const search = this.search().trim().toLowerCase();
    const members = this.membersService.members();

    return this.teamsService
      .teams()
      .filter((team) => !search || team.name.toLowerCase().includes(search))
      .map((team) => ({
        ...team,
        lead: members.find((member) => member.id === team.leadId),
        members: members.filter((member) => member.teamIds.includes(team.id)),
      }));
  });
}
