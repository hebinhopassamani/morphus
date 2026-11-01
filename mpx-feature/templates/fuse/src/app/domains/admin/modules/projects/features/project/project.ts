import {
  DatePipe,
  NgOptimizedImage,
  SlicePipe,
  TitleCasePipe,
} from '@angular/common';
import { Component, computed, effect, inject, input } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardHeader } from '@angular/material/card';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatProgressBar } from '@angular/material/progress-bar';
import { Router, RouterLink } from '@angular/router';
import {
  differenceInCalendarDays,
  differenceInSeconds,
  formatDistanceToNowStrict,
} from 'date-fns';
import { FavoriteToggle } from '@/app/domains/admin/layout/ui/favorite-toggle';
import {
  Activity,
  ProjectsService,
  Task,
} from '@/app/domains/admin/modules/projects/data/projects';
import {
  ProjectHealthPill,
  ProjectStatusPill,
} from '@/app/domains/admin/modules/projects/ui/pills';
import {
  BuiPopover,
  BuiPopoverContent,
  BuiPopoverPortal,
  BuiPopoverTrigger,
} from '@/app/ui/popover';

@Component({
  selector: 'project',
  imports: [
    BuiPopover,
    BuiPopoverContent,
    BuiPopoverPortal,
    BuiPopoverTrigger,
    DatePipe,
    FavoriteToggle,
    MatButton,
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatDivider,
    MatIcon,
    MatIconButton,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    MatProgressBar,
    NgOptimizedImage,
    ProjectHealthPill,
    ProjectStatusPill,
    RouterLink,
    SlicePipe,
    TitleCasePipe,
  ],
  template: `
    @if (project(); as project) {
      <div
        class="mx-auto flex w-full max-w-7xl flex-auto flex-col gap-4 p-6 sm:gap-6 lg:p-8"
      >
        <!-- Back link -->
        <a
          matButton
          class="link -mb-2 self-start"
          routerLink="/projects"
        >
          <mat-icon svgIcon="chevron-left" />
          Projects
        </a>

        <!-- Header -->
        <div class="flex flex-col gap-y-5">
          <div class="flex items-start gap-x-3">
            <div class="flex min-w-0 flex-col gap-y-1">
              <div class="flex flex-wrap items-center gap-x-2.5 gap-y-2">
                <div class="text-3xl font-semibold tracking-tighter">
                  {{ project.name }}
                </div>
                <favorite-toggle
                  [label]="project.name"
                  icon="folder-kanban"
                />
                <project-status-pill [status]="project.status" />
                <project-health-pill [health]="project.health" />
              </div>
              <div class="text-neutral-a11 sm:text-lg">
                {{ project.description }}
              </div>
            </div>

            <!-- Spacer -->
            <div class="flex-auto"></div>

            <!-- Actions -->
            <div class="flex shrink-0 items-center gap-x-2">
              <button
                matButton
                class="small hidden sm:flex"
              >
                <mat-icon svgIcon="share-2" />
                Share
              </button>
              <button
                matButton
                class="primary small"
              >
                <mat-icon svgIcon="square-pen" />
                Edit
              </button>
              <button
                matIconButton
                class="small"
                [matMenuTriggerFor]="projectMenu"
              >
                <mat-icon svgIcon="ellipsis-vertical" />
              </button>
              <mat-menu
                class="min-w-44"
                xPosition="before"
                #projectMenu="matMenu"
              >
                <button mat-menu-item>
                  <mat-icon svgIcon="copy" />
                  Copy link
                </button>
                <button mat-menu-item>
                  <mat-icon svgIcon="layers" />
                  Duplicate project
                </button>
                <mat-divider />
                <button mat-menu-item>
                  <mat-icon svgIcon="archive" />
                  Archive
                </button>
              </mat-menu>
            </div>
          </div>

          <!-- Meta -->
          <div
            class="flex flex-wrap items-center gap-x-5 gap-y-2 text-neutral-a11"
          >
            <div class="flex items-center gap-x-2">
              <img
                class="rounded-full object-cover"
                width="20"
                height="20"
                [ngSrc]="project.lead.photo"
                [alt]="project.lead.name"
              />
              {{ project.lead.name }}
            </div>
            <div class="flex items-center gap-x-1.5">
              <mat-icon
                class="size-4"
                svgIcon="target"
              />
              Target {{ project.targetDate | date: 'MMM d, y' }}
            </div>
            <div class="flex items-center gap-x-1.5">
              <mat-icon
                class="size-4"
                svgIcon="clock"
              />
              Updated {{ formatDate(project.updatedAt) }}
            </div>
          </div>
        </div>

        <div class="grid gap-4 sm:gap-6 lg:grid-cols-3">
          <!-- Main column -->
          <div class="flex min-w-0 flex-col gap-4 sm:gap-6 lg:col-span-2">
            <!-- Overview -->
            <mat-card
              appearance="filled"
              class="flex flex-col"
            >
              <mat-card-header>
                <div class="flex flex-auto items-center gap-x-2">
                  <mat-icon
                    class="size-4"
                    svgIcon="book-open"
                  />
                  <div class="font-medium tracking-tight">Overview</div>
                </div>
              </mat-card-header>
              <mat-card-content class="flex flex-col gap-y-4">
                <div class="text-neutral-a11">{{ project.summary }}</div>

                <div class="flex flex-wrap gap-2">
                  @for (label of project.labels; track label) {
                    <div
                      class="inline-flex items-center gap-x-1.5 rounded-lg bg-neutral-a3 px-2 py-0.5 text-sm font-medium text-neutral-a11"
                    >
                      <mat-icon
                        class="size-3"
                        svgIcon="tag"
                      />
                      {{ label }}
                    </div>
                  }
                </div>

                <div
                  class="grid grid-cols-2 gap-4 border-t border-neutral-a4 pt-4 sm:grid-cols-4"
                >
                  <div class="flex flex-col">
                    <div class="text-sm text-neutral-a11">Scope</div>
                    <div class="text-xl font-semibold tabular-nums">
                      {{ project.tasksTotal }}
                    </div>
                  </div>
                  <div class="flex flex-col">
                    <div class="text-sm text-neutral-a11">Completed</div>
                    <div class="text-xl font-semibold tabular-nums">
                      {{ project.tasksDone }}
                    </div>
                  </div>
                  <div class="flex flex-col">
                    <div class="text-sm text-neutral-a11">Open</div>
                    <div class="text-xl font-semibold tabular-nums">
                      {{ project.tasksTotal - project.tasksDone }}
                    </div>
                  </div>
                  <div class="flex flex-col">
                    <div class="text-sm text-neutral-a11">
                      {{ remaining().label }}
                    </div>
                    <div class="text-xl font-semibold tabular-nums">
                      {{ remaining().value }}
                    </div>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>

            <!-- Milestones -->
            <mat-card
              appearance="filled"
              class="flex flex-col"
            >
              <mat-card-header>
                <div class="flex flex-auto items-center gap-x-2">
                  <mat-icon
                    class="size-4"
                    svgIcon="milestone"
                  />
                  <div class="font-medium tracking-tight">Milestones</div>
                  <div class="ms-auto flex items-center gap-x-2">
                    <mat-progress-bar
                      class="w-20"
                      [value]="milestones().percentage"
                    />
                    <div class="text-sm text-neutral-a11 tabular-nums">
                      {{ milestones().done }}/{{ milestones().total }}
                    </div>
                  </div>
                </div>
              </mat-card-header>
              <mat-card-content class="flex flex-col py-0">
                @for (
                  milestone of project.milestones;
                  track milestone.id;
                  let last = $last
                ) {
                  <div class="flex items-center gap-x-3 py-2.5">
                    @switch (milestone.state) {
                      @case ('done') {
                        <mat-icon
                          class="size-4 shrink-0 text-jade-11"
                          svgIcon="circle-check"
                        />
                      }
                      @case ('current') {
                        <mat-icon
                          class="size-4 shrink-0 text-blue-11"
                          svgIcon="circle-dot"
                        />
                      }
                      @default {
                        <mat-icon
                          class="size-4 shrink-0 text-neutral-a8"
                          svgIcon="circle-dashed"
                        />
                      }
                    }
                    <div
                      class="flex-auto truncate font-medium"
                      [class.text-neutral-a11]="milestone.state === 'done'"
                    >
                      {{ milestone.title }}
                    </div>
                    <div class="shrink-0 text-sm text-neutral-a11 tabular-nums">
                      {{ milestone.dueDate | date: 'MMM d, y' }}
                    </div>
                  </div>

                  @if (!last) {
                    <mat-divider />
                  }
                }
              </mat-card-content>
            </mat-card>

            <!-- Tasks -->
            <mat-card
              appearance="filled"
              class="flex flex-col"
            >
              <mat-card-header>
                <div class="flex flex-auto items-center gap-x-2">
                  <mat-icon
                    class="size-4"
                    svgIcon="list-todo"
                  />
                  <div class="font-medium tracking-tight">Tasks</div>
                  <div class="ms-auto text-sm text-neutral-a11 tabular-nums">
                    {{ tasks().done }} of {{ tasks().total }} done
                  </div>
                </div>
              </mat-card-header>
              <mat-card-content class="flex flex-col py-0">
                @for (task of project.tasks; track task.id; let last = $last) {
                  <div class="flex items-center gap-x-3 py-2.5">
                    @switch (task.state) {
                      @case ('done') {
                        <mat-icon
                          class="size-4 shrink-0 text-jade-11"
                          svgIcon="circle-check"
                        />
                      }
                      @case ('in-progress') {
                        <mat-icon
                          class="size-4 shrink-0 text-blue-11"
                          svgIcon="circle-dot"
                        />
                      }
                      @case ('blocked') {
                        <mat-icon
                          class="size-4 shrink-0 text-red-11"
                          svgIcon="circle-alert"
                        />
                      }
                      @default {
                        <mat-icon
                          class="size-4 shrink-0 text-neutral-a8"
                          svgIcon="circle"
                        />
                      }
                    }
                    <div
                      class="flex-auto truncate"
                      [class.text-neutral-a11]="task.state === 'done'"
                    >
                      {{ task.title }}
                    </div>
                    <div
                      class="shrink-0 rounded-md bg-neutral-a3 px-1.5 py-0.5 text-sm text-neutral-a11 tabular-nums"
                      [class.text-red-a11]="isOverdue(task)"
                    >
                      {{ task.dueDate | date: 'MMM d' }}
                    </div>
                    <img
                      class="shrink-0 rounded-full object-cover"
                      width="24"
                      height="24"
                      [ngSrc]="task.assignee.photo"
                      [alt]="task.assignee.name"
                    />
                  </div>

                  @if (!last) {
                    <mat-divider />
                  }
                }
              </mat-card-content>
            </mat-card>

            <!-- Activity -->
            <mat-card
              appearance="filled"
              class="flex flex-col"
            >
              <mat-card-header>
                <div class="flex flex-auto items-center gap-x-2">
                  <mat-icon
                    class="size-4"
                    svgIcon="activity"
                  />
                  <div class="font-medium tracking-tight">Activity</div>
                </div>
              </mat-card-header>
              <mat-card-content class="flex flex-col">
                @for (
                  entry of project.activity;
                  track entry.id;
                  let last = $last
                ) {
                  <div class="flex gap-x-3">
                    <div class="flex flex-col items-center">
                      <div
                        class="flex size-7 shrink-0 items-center justify-center rounded-full bg-neutral-a3 text-neutral-a11"
                      >
                        <mat-icon
                          class="size-3.5"
                          [svgIcon]="activityIcon(entry)"
                        />
                      </div>
                      @if (!last) {
                        <div class="w-px flex-auto bg-neutral-a4"></div>
                      }
                    </div>
                    <div
                      class="flex flex-col"
                      [class.pb-5]="!last"
                    >
                      <div class="leading-7">
                        <span class="font-medium">{{ entry.actor.name }}</span>
                        <span class="text-neutral-a11">
                          {{ entry.text }}
                        </span>
                      </div>
                      <div class="text-sm text-neutral-a11">
                        {{ formatDate(entry.date) }}
                      </div>
                    </div>
                  </div>
                }
              </mat-card-content>
            </mat-card>
          </div>

          <!-- Side column -->
          <div class="flex min-w-0 flex-col gap-4 sm:gap-6">
            <!-- Properties -->
            <mat-card
              appearance="filled"
              class="@container flex flex-col"
            >
              <mat-card-header>
                <div class="flex flex-auto items-center gap-x-2">
                  <mat-icon
                    class="size-4"
                    svgIcon="sliders-horizontal"
                  />
                  <div class="font-medium tracking-tight">Properties</div>
                </div>
              </mat-card-header>
              <mat-card-content
                class="grid grid-cols-1 items-center gap-x-4 gap-y-3 @xs:grid-cols-[6rem_1fr]"
              >
                <div class="text-neutral-a11">Status</div>
                <project-status-pill [status]="project.status" />

                <div class="text-neutral-a11">Health</div>
                <project-health-pill [health]="project.health" />

                <div class="text-neutral-a11">Priority</div>
                <div>{{ project.priority | titlecase }}</div>

                <div class="text-neutral-a11">Lead</div>
                <div class="flex items-center gap-x-2">
                  <img
                    class="rounded-full object-cover"
                    width="20"
                    height="20"
                    [ngSrc]="project.lead.photo"
                    [alt]="project.lead.name"
                  />
                  <div class="truncate">{{ project.lead.name }}</div>
                </div>

                <div class="text-neutral-a11">Members</div>
                <div class="flex items-center gap-x-1">
                  <div class="flex items-center -space-x-1">
                    @for (
                      member of project.members | slice: 0 : memberLimit;
                      track member.name
                    ) {
                      <img
                        class="shrink-0 rounded-full object-cover ring-2 ring-white outline -outline-offset-1 outline-black-a3 dark:ring-neutral-2 dark:outline-white-a3"
                        width="20"
                        height="20"
                        [ngSrc]="member.photo"
                        [alt]="member.name"
                      />
                    }
                  </div>

                  @if (project.members.length > memberLimit) {
                    <div
                      buiPopover
                      position="bottom-start"
                    >
                      <button
                        matButton
                        buiPopoverTrigger
                        class="tertiary tiny"
                      >
                        {{ project.members.length }} members
                      </button>

                      <ng-template buiPopoverPortal>
                        <div
                          buiPopoverContent
                          class="p-0 [--popover-border-radius:calc(var(--theme-border-radius)*1.5)]"
                        >
                          <div
                            class="flex max-h-64 flex-col gap-y-3 overflow-y-auto overscroll-contain p-4"
                          >
                            @for (
                              member of project.members;
                              track member.name
                            ) {
                              <div class="flex items-center gap-x-2">
                                <img
                                  class="shrink-0 rounded-full object-cover"
                                  width="24"
                                  height="24"
                                  [ngSrc]="member.photo"
                                  [alt]="member.name"
                                />
                                <div class="truncate">{{ member.name }}</div>
                              </div>
                            }
                          </div>
                        </div>
                      </ng-template>
                    </div>
                  }
                </div>

                <div class="text-neutral-a11">Start date</div>
                <div class="tabular-nums">
                  {{ project.startDate | date: 'MMM d, y' }}
                </div>

                <div class="text-neutral-a11">Target date</div>
                <div class="tabular-nums">
                  {{ project.targetDate | date: 'MMM d, y' }}
                </div>

                <div class="text-neutral-a11">Labels</div>
                <div class="flex flex-wrap gap-1.5">
                  @for (label of project.labels; track label) {
                    <div
                      class="rounded-lg bg-neutral-a3 px-2 py-0.5 text-sm font-medium text-neutral-a11"
                    >
                      {{ label }}
                    </div>
                  }
                </div>
              </mat-card-content>
            </mat-card>

            <!-- Progress -->
            <mat-card
              appearance="filled"
              class="flex flex-col"
            >
              <mat-card-header>
                <div class="flex flex-auto items-center gap-x-2">
                  <mat-icon
                    class="size-4"
                    svgIcon="gauge"
                  />
                  <div class="font-medium tracking-tight">Progress</div>
                </div>
              </mat-card-header>
              <mat-card-content class="flex flex-col gap-y-3">
                <div class="flex items-baseline gap-x-2">
                  <div class="text-4xl font-semibold tabular-nums">
                    {{ project.progress }}%
                  </div>
                  <div class="text-sm text-neutral-a11">
                    {{ remaining().label }}: {{ remaining().value }}
                  </div>
                </div>
                <mat-progress-bar [value]="project.progress" />
                <div class="flex items-center gap-x-1">
                  <div class="text-neutral-a11">Scope</div>
                  <div class="flex-auto"></div>
                  <div class="font-medium tabular-nums">
                    {{ project.tasksTotal }}
                  </div>
                </div>
                <div class="flex items-center gap-x-1">
                  <div class="text-neutral-a11">Completed</div>
                  <div class="flex-auto"></div>
                  <div class="font-medium tabular-nums">
                    {{ project.tasksDone }}
                  </div>
                </div>
                <div class="flex items-center gap-x-1">
                  <div class="text-neutral-a11">Remaining</div>
                  <div class="flex-auto"></div>
                  <div class="font-medium tabular-nums">
                    {{ project.tasksTotal - project.tasksDone }}
                  </div>
                </div>
              </mat-card-content>
            </mat-card>

            <!-- Resources -->
            <mat-card
              appearance="filled"
              class="flex flex-col"
            >
              <mat-card-header>
                <div class="flex flex-auto items-center gap-x-2">
                  <mat-icon
                    class="size-4"
                    svgIcon="paperclip"
                  />
                  <div class="font-medium tracking-tight">Resources</div>
                </div>
              </mat-card-header>
              <mat-card-content class="flex flex-col gap-y-1 py-2">
                @for (resource of project.resources; track resource.id) {
                  <div
                    class="-mx-2 flex cursor-pointer items-center gap-x-3 rounded-md px-2 py-2 hover:bg-neutral-a2"
                  >
                    <mat-icon
                      class="size-4 shrink-0 text-neutral-a11"
                      [svgIcon]="resource.icon"
                    />
                    <div class="flex min-w-0 flex-auto flex-col">
                      <div class="truncate font-medium">
                        {{ resource.label }}
                      </div>
                      <div class="text-sm text-neutral-a11">
                        {{ resource.meta }}
                      </div>
                    </div>
                    <mat-icon
                      class="size-4 shrink-0 text-neutral-a8"
                      svgIcon="arrow-up-right"
                    />
                  </div>
                }
              </mat-card-content>
            </mat-card>
          </div>
        </div>
      </div>
    }
  `,
})
export default class Project {
  // Dependencies
  private projectsService = inject(ProjectsService);
  private router = inject(Router);

  // Inputs / Outputs
  readonly id = input.required<string>();

  // State
  private memberLimit = 5;

  // Computed state
  private project = computed(() => this.projectsService.byId(this.id()));
  private remaining = computed(() => {
    const project = this.project();
    const days = project
      ? differenceInCalendarDays(new Date(project.targetDate), new Date())
      : 0;

    return {
      label: days < 0 ? 'Days overdue' : 'Days left',
      value: Math.abs(days),
    };
  });
  private milestones = computed(() => {
    const milestones = this.project()?.milestones ?? [];
    const done = milestones.filter(
      (milestone) => milestone.state === 'done'
    ).length;

    return {
      done,
      total: milestones.length,
      percentage: milestones.length ? (done / milestones.length) * 100 : 0,
    };
  });
  private tasks = computed(() => {
    const tasks = this.project()?.tasks ?? [];

    return {
      done: tasks.filter((task) => task.state === 'done').length,
      total: tasks.length,
    };
  });

  constructor() {
    effect(() => {
      if (!this.project()) {
        this.router.navigate(['/projects']);
      }
    });
  }

  private isOverdue(task: Task) {
    return task.state !== 'done' && new Date(task.dueDate) < new Date();
  }

  private activityIcon(entry: Activity) {
    switch (entry.type) {
      case 'created':
        return 'plus';
      case 'status':
        return 'arrow-right-left';
      case 'milestone':
        return 'flag';
      case 'member':
        return 'user-plus';
      default:
        return 'message-square';
    }
  }

  private formatDate(date: string) {
    if (differenceInSeconds(Date.now(), date) < 60) {
      return 'just now';
    }

    return formatDistanceToNowStrict(date, { addSuffix: true });
  }
}
