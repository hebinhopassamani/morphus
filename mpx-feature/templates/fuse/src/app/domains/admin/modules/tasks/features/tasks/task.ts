import { CdkCopyToClipboard } from '@angular/cdk/clipboard';
import { DatePipe, NgOptimizedImage, TitleCasePipe } from '@angular/common';
import { Component, computed, effect, inject, input } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatPseudoCheckbox } from '@angular/material/core';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatTooltip } from '@angular/material/tooltip';
import { Router, RouterLink } from '@angular/router';
import { differenceInSeconds, formatDistanceToNowStrict } from 'date-fns';
import {
  Activity,
  Attachment,
  ProjectPriority,
  ProjectsService,
} from '@/app/domains/admin/modules/projects/data/projects';
import {
  TaskItem,
  TasksService,
} from '@/app/domains/admin/modules/tasks/data/tasks';

@Component({
  selector: 'task',
  imports: [
    CdkCopyToClipboard,
    DatePipe,
    MatButton,
    MatIcon,
    MatIconButton,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    MatPseudoCheckbox,
    MatTooltip,
    NgOptimizedImage,
    RouterLink,
    TitleCasePipe,
  ],
  host: {
    class: 'flex min-w-0 flex-auto flex-col',
  },
  template: `
    @if (task(); as task) {
      <!-- Header -->
      <header
        class="flex items-center gap-x-2 border-b border-neutral-a4 py-3 ps-6 pe-4"
      >
        <div class="flex min-w-0 flex-auto flex-col">
          <div class="flex items-center gap-x-1">
            <div class="font-semibold tabular-nums">{{ task.key }}</div>
            <button
              matIconButton
              class="tiny"
              matTooltip="Copy to clipboard"
              [cdkCopyToClipboard]="task.key"
            >
              <mat-icon svgIcon="copy" />
            </button>
          </div>
          <div class="truncate text-sm text-neutral-a11">
            {{ task.project.name }}
          </div>
        </div>
        <a
          matIconButton
          class="small"
          routerLink="/tasks"
        >
          <mat-icon svgIcon="x" />
        </a>
      </header>

      <!-- Body -->
      <div class="flex min-h-0 flex-auto flex-col overflow-y-auto px-6 py-5">
        <div class="text-xl font-semibold tracking-tight">{{ task.title }}</div>

        <!-- Meta -->
        <div
          class="mt-4 grid grid-cols-3 gap-x-4 rounded-lg border border-neutral-a4 p-3"
        >
          <div class="flex flex-col gap-y-1">
            <div class="text-sm text-neutral-a11">Created</div>
            <div class="tabular-nums">
              {{ task.createdAt | date: 'MMM d, y' }}
            </div>
          </div>
          <div class="flex flex-col gap-y-1">
            <div class="text-sm text-neutral-a11">Priority</div>
            <div class="flex items-center gap-x-1.5">
              <mat-icon
                class="size-3.5 text-neutral-a11"
                [svgIcon]="priorityIcon(task.priority)"
              />
              {{ task.priority | titlecase }}
            </div>
          </div>
          <div class="flex flex-col gap-y-1">
            <div class="text-sm text-neutral-a11">State</div>
            <div class="flex items-center gap-x-1.5">
              @switch (task.state) {
                @case ('done') {
                  <mat-icon
                    class="size-4 shrink-0 text-jade-11"
                    svgIcon="circle-check"
                  />
                  Done
                }
                @case ('in-progress') {
                  <mat-icon
                    class="size-4 shrink-0 text-blue-11"
                    svgIcon="circle-dot"
                  />
                  In progress
                }
                @case ('blocked') {
                  <mat-icon
                    class="size-4 shrink-0 text-red-11"
                    svgIcon="circle-alert"
                  />
                  Blocked
                }
                @default {
                  <mat-icon
                    class="size-4 shrink-0 text-neutral-a8"
                    svgIcon="circle"
                  />
                  Todo
                }
              }
            </div>
          </div>
        </div>

        @if (task.description) {
          <!-- Description -->
          <div class="mt-4 text-neutral-a11">{{ task.description }}</div>
        }

        <!-- Details -->
        <div class="mt-6 flex items-center gap-x-2">
          <div class="flex-auto font-medium">Details</div>
          <button
            matIconButton
            class="tiny"
            [matMenuTriggerFor]="sectionMenu"
          >
            <mat-icon svgIcon="ellipsis-vertical" />
          </button>
        </div>
        <div
          class="mt-2 grid grid-cols-[7rem_1fr] items-center gap-x-4 gap-y-3"
        >
          <div class="text-neutral-a11">Assignee</div>
          <div class="flex min-w-0 items-center gap-x-2">
            <img
              class="shrink-0 rounded-full object-cover"
              width="20"
              height="20"
              [ngSrc]="task.assignee.photo"
              [alt]="task.assignee.name"
            />
            <div class="truncate">{{ task.assignee.name }}</div>
          </div>

          <div class="text-neutral-a11">Reporter</div>
          <div class="flex min-w-0 items-center gap-x-2">
            <img
              class="shrink-0 rounded-full object-cover"
              width="20"
              height="20"
              [ngSrc]="task.reporter.photo"
              [alt]="task.reporter.name"
            />
            <div class="truncate">{{ task.reporter.name }}</div>
          </div>

          <div class="text-neutral-a11">Project</div>
          <div class="min-w-0">
            <a
              class="block truncate hover:underline"
              [routerLink]="['/projects', task.project.id]"
            >
              {{ task.project.name }}
            </a>
          </div>

          <div class="text-neutral-a11">Milestone</div>
          <div class="truncate">{{ milestone(task)?.title }}</div>

          <div class="text-neutral-a11">Due date</div>
          <div
            class="tabular-nums"
            [class.text-red-a11]="isOverdue(task)"
          >
            {{ task.dueDate | date: 'MMM d, y' }}
          </div>

          <div class="text-neutral-a11">Estimate</div>
          <div>{{ task.estimate }}</div>

          <div class="text-neutral-a11">Labels</div>
          <div class="flex flex-wrap gap-1.5">
            @for (label of task.labels; track label) {
              <div
                class="rounded-lg bg-neutral-a3 px-2 py-0.5 text-sm font-medium text-neutral-a11"
              >
                {{ label }}
              </div>
            }
          </div>
        </div>

        <!-- Activity -->
        <div class="mt-6 flex items-center gap-x-2">
          <div class="flex-auto font-medium">Activity</div>
          <button
            matIconButton
            class="tiny"
            [matMenuTriggerFor]="sectionMenu"
          >
            <mat-icon svgIcon="ellipsis-vertical" />
          </button>
        </div>
        <div class="mt-3 flex flex-col">
          @for (entry of task.activity; track entry.id; let last = $last) {
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
                [class.pb-4]="!last"
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
        </div>

        <!-- Subtasks -->
        <div class="mt-6 flex items-center gap-x-2">
          <div class="font-medium">Subtasks</div>
          <div
            class="rounded-sm bg-neutral-a3 px-1.5 py-px text-xs font-medium text-neutral-a11 tabular-nums"
          >
            {{ subtasksDone(task) }}/{{ task.subtasks.length }}
          </div>
          <button
            matIconButton
            class="tiny ms-auto"
            [matMenuTriggerFor]="sectionMenu"
          >
            <mat-icon svgIcon="ellipsis-vertical" />
          </button>
        </div>
        <div class="mt-2 flex flex-col gap-y-1">
          @for (subtask of task.subtasks; track subtask.id) {
            <div class="flex items-center gap-x-2 py-1">
              <mat-pseudo-checkbox
                [state]="subtask.done ? 'checked' : 'unchecked'"
              />
              <div
                class="truncate"
                [class.text-neutral-a11]="subtask.done"
                [class.line-through]="subtask.done"
              >
                {{ subtask.title }}
              </div>
            </div>
          } @empty {
            <div class="text-neutral-a11">No subtasks yet.</div>
          }
        </div>

        <!-- Attachments -->
        <div class="mt-6 flex items-center gap-x-2">
          <div class="font-medium">Attachments</div>
          <div
            class="rounded-sm bg-neutral-a3 px-1.5 py-px text-xs font-medium text-neutral-a11 tabular-nums"
          >
            {{ task.attachments.length }}
          </div>
          <button
            matIconButton
            class="tiny ms-auto"
            [matMenuTriggerFor]="sectionMenu"
          >
            <mat-icon svgIcon="ellipsis-vertical" />
          </button>
        </div>
        <div class="mt-2 flex flex-col gap-y-1">
          @for (attachment of task.attachments; track attachment.id) {
            <div
              class="-mx-2 flex cursor-pointer items-center gap-x-3 rounded-md px-2 py-2 hover:bg-neutral-a2"
            >
              <mat-icon
                class="size-4 shrink-0 text-neutral-a11"
                [svgIcon]="attachmentIcon(attachment)"
              />
              <div class="min-w-0 flex-auto truncate font-medium">
                {{ attachment.name }}
              </div>
              <div class="shrink-0 text-sm text-neutral-a11 tabular-nums">
                {{ attachment.size }}
              </div>
            </div>
          } @empty {
            <div class="text-neutral-a11">No attachments yet.</div>
          }
        </div>
      </div>

      <!-- Footer -->
      <footer
        class="grid grid-cols-3 gap-x-2 border-t border-neutral-a4 px-6 py-4"
      >
        <a
          matButton
          [routerLink]="['/projects', task.project.id]"
        >
          Open project
        </a>
        <button
          matButton
          class="primary"
          [disabled]="task.state === 'done'"
          (click)="markDone(task)"
        >
          Mark done
        </button>
        <button matButton>Edit</button>
      </footer>

      <mat-menu #sectionMenu>
        <button mat-menu-item>
          <mat-icon svgIcon="chevrons-down-up" />
          Collapse section
        </button>
        <button mat-menu-item>
          <mat-icon svgIcon="eye-off" />
          Hide section
        </button>
      </mat-menu>
    }
  `,
})
export default class TaskPanel {
  // Dependencies
  private projectsService = inject(ProjectsService);
  private router = inject(Router);
  private tasksService = inject(TasksService);

  // Inputs / Outputs
  readonly key = input.required<string>();

  // Computed state
  private task = computed(() => this.tasksService.byKey(this.key()));

  constructor() {
    effect(() => {
      if (!this.task()) {
        this.router.navigate(['/tasks']);
      }
    });
  }

  private markDone(task: TaskItem) {
    this.projectsService.setTaskState(task.project.id, task.id, 'done');
  }

  private milestone(task: TaskItem) {
    const milestones = task.project.milestones;

    return (
      milestones.find((milestone) => milestone.dueDate >= task.dueDate) ??
      milestones.at(-1)
    );
  }

  private subtasksDone(task: TaskItem) {
    return task.subtasks.filter((subtask) => subtask.done).length;
  }

  private isOverdue(task: TaskItem) {
    return task.state !== 'done' && new Date(task.dueDate) < new Date();
  }

  private priorityIcon(priority: ProjectPriority) {
    switch (priority) {
      case 'urgent':
        return 'chevrons-up';
      case 'high':
        return 'chevron-up';
      case 'medium':
        return 'equal';
      default:
        return 'chevron-down';
    }
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

  private attachmentIcon(attachment: Attachment) {
    switch (attachment.type) {
      case 'image':
        return 'file-image';
      case 'spreadsheet':
        return 'file-spreadsheet';
      case 'code':
        return 'file-code';
      case 'archive':
        return 'file-archive';
      default:
        return 'file-text';
    }
  }

  private formatDate(date: string) {
    if (differenceInSeconds(Date.now(), date) < 60) {
      return 'Just now';
    }

    return formatDistanceToNowStrict(date, { addSuffix: true });
  }
}
