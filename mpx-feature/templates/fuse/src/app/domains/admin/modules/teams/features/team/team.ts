import { NgOptimizedImage, TitleCasePipe } from '@angular/common';
import { Component, computed, effect, inject, input } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardHeader } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { FavoriteToggle } from '@/app/domains/admin/layout/ui/favorite-toggle';
import { MembersService } from '@/app/domains/admin/modules/members/data/members';
import { ProjectsService } from '@/app/domains/admin/modules/projects/data/projects';
import {
  ProjectHealthPill,
  ProjectStatusPill,
} from '@/app/domains/admin/modules/projects/ui/pills';
import { TeamsService } from '@/app/domains/admin/modules/teams/data/teams';

@Component({
  selector: 'team',
  imports: [
    FavoriteToggle,
    MatButton,
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatIcon,
    NgOptimizedImage,
    ProjectHealthPill,
    ProjectStatusPill,
    RouterLink,
    TitleCasePipe,
  ],
  template: `
    @if (team(); as team) {
      <div
        class="mx-auto flex w-full max-w-7xl flex-auto flex-col gap-4 p-6 sm:gap-6 lg:p-8"
      >
        <!-- Back link -->
        <a
          matButton
          class="link -mb-2 self-start"
          routerLink="/teams"
        >
          <mat-icon svgIcon="chevron-left" />
          Teams
        </a>

        <!-- Header -->
        <div class="flex flex-col gap-y-5">
          <div class="flex min-w-0 flex-col gap-y-1">
            <div class="flex flex-wrap items-center gap-x-2.5 gap-y-2">
              <div
                class="size-3 shrink-0 rounded-full"
                [class]="team.colorClass"
              ></div>
              <div class="text-3xl font-semibold tracking-tighter">
                {{ team.name }}
              </div>
              <favorite-toggle
                [label]="team.name"
                icon="users-round"
              />
            </div>
            <div class="text-neutral-a11 sm:text-lg">
              {{ team.description }}
            </div>
          </div>

          <!-- Meta -->
          <div
            class="flex flex-wrap items-center gap-x-5 gap-y-2 text-neutral-a11"
          >
            @if (lead(); as lead) {
              <div class="flex items-center gap-x-2">
                <img
                  class="rounded-full object-cover"
                  width="20"
                  height="20"
                  [ngSrc]="lead.photo"
                  [alt]="lead.name"
                />
                {{ lead.name }}
              </div>
            }
            <div class="flex items-center gap-x-1.5">
              <mat-icon
                class="size-4"
                svgIcon="users-round"
              />
              {{ members().length }} members
            </div>
            <div class="flex items-center gap-x-1.5">
              <mat-icon
                class="size-4"
                svgIcon="folder-kanban"
              />
              {{ projects().length }} projects
            </div>
          </div>
        </div>

        <div class="grid gap-4 sm:gap-6 lg:grid-cols-3">
          <!-- Projects -->
          <mat-card
            appearance="filled"
            class="flex min-w-0 flex-col self-start lg:col-span-2"
          >
            <mat-card-header>
              <div class="flex flex-auto items-center gap-x-2">
                <mat-icon
                  class="size-4"
                  svgIcon="folder-kanban"
                />
                <div class="font-medium tracking-tight">Projects</div>
              </div>
            </mat-card-header>
            <mat-card-content class="flex flex-col gap-y-1 py-2">
              @for (project of projects(); track project.id) {
                <div
                  class="-mx-2 flex cursor-pointer items-center gap-x-3 rounded-md px-2 py-2 hover:bg-neutral-a2"
                  [routerLink]="['/projects', project.id]"
                >
                  <div
                    class="flex size-7 shrink-0 items-center justify-center rounded-lg bg-neutral-a3 text-neutral-a11"
                  >
                    <mat-icon
                      class="size-4"
                      svgIcon="folder-kanban"
                    />
                  </div>
                  <div class="flex min-w-0 flex-auto flex-col">
                    <div class="truncate font-medium">{{ project.name }}</div>
                    <div class="truncate text-sm text-neutral-a11">
                      {{ project.description }}
                    </div>
                  </div>
                  <div class="hidden shrink-0 items-center gap-x-4 sm:flex">
                    <project-status-pill [status]="project.status" />
                    <project-health-pill [health]="project.health" />
                  </div>
                </div>
              }
            </mat-card-content>
          </mat-card>

          <!-- Members -->
          <mat-card
            appearance="filled"
            class="flex min-w-0 flex-col self-start"
          >
            <mat-card-header>
              <div class="flex flex-auto items-center gap-x-2">
                <mat-icon
                  class="size-4"
                  svgIcon="users-round"
                />
                <div class="font-medium tracking-tight">Members</div>
              </div>
            </mat-card-header>
            <mat-card-content class="flex flex-col gap-y-1 py-2">
              @for (member of members(); track member.id) {
                <div
                  class="-mx-2 flex cursor-pointer items-center gap-x-3 rounded-md px-2 py-2 hover:bg-neutral-a2"
                  [routerLink]="['/members', member.id]"
                >
                  <img
                    class="shrink-0 rounded-full object-cover"
                    width="28"
                    height="28"
                    [ngSrc]="member.photo"
                    [alt]="member.name"
                  />
                  <div class="flex min-w-0 flex-auto flex-col">
                    <div class="truncate font-medium">{{ member.name }}</div>
                    <div class="truncate text-sm text-neutral-a11">
                      {{ member.title }}
                    </div>
                  </div>
                  <div class="shrink-0 text-sm text-neutral-a11">
                    {{ member.role | titlecase }}
                  </div>
                </div>
              }
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    }
  `,
})
export default class Team {
  // Dependencies
  private teamsService = inject(TeamsService);
  private membersService = inject(MembersService);
  private projectsService = inject(ProjectsService);
  private router = inject(Router);

  // Inputs / Outputs
  readonly id = input.required<string>();

  // Computed state
  private team = computed(() => this.teamsService.byId(this.id()));
  private members = computed(() =>
    this.membersService
      .members()
      .filter((member) => member.teamIds.includes(this.id()))
  );
  private lead = computed(() =>
    this.members().find((member) => member.id === this.team()?.leadId)
  );
  private projects = computed(() => {
    const projectIds = this.team()?.projectIds ?? [];

    return this.projectsService
      .projects()
      .filter((project) => projectIds.includes(project.id));
  });

  constructor() {
    effect(() => {
      if (!this.team()) {
        this.router.navigate(['/teams']);
      }
    });
  }
}
