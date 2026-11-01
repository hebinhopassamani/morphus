import {
  CdkDrag,
  CdkDragDrop,
  CdkDragPlaceholder,
  CdkDropList,
  CdkDropListGroup,
} from '@angular/cdk/drag-drop';
import { DatePipe, NgOptimizedImage, TitleCasePipe } from '@angular/common';
import {
  Component,
  computed,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import {
  MatButtonToggle,
  MatButtonToggleGroup,
} from '@angular/material/button-toggle';
import { MatCard, MatCardContent, MatCardHeader } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { RouterLink } from '@angular/router';
import { differenceInSeconds, formatDistanceToNowStrict } from 'date-fns';
import {
  Project,
  ProjectPriority,
  ProjectsService,
  ProjectStatus,
} from '@/app/domains/admin/modules/projects/data/projects';
import {
  ProjectHealthPill,
  ProjectStatusPill,
} from '@/app/domains/admin/modules/projects/ui/pills';
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

type CardStyle = 'filled' | 'normal';

@Component({
  selector: 'projects-board',
  imports: [
    CdkDrag,
    CdkDragPlaceholder,
    CdkDropList,
    CdkDropListGroup,
    DatePipe,
    MatButton,
    MatButtonToggle,
    MatButtonToggleGroup,
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatIcon,
    MatIconButton,
    MatProgressBar,
    MatSlideToggle,
    NgOptimizedImage,
    ProjectHealthPill,
    ProjectStatusPill,
    RouterLink,
    TitleCasePipe,
    BuiSheet,
    BuiSheetBackdrop,
    BuiSheetBody,
    BuiSheetClose,
    BuiSheetContent,
    BuiSheetHeader,
    BuiSheetPortal,
    BuiSheetFooter,
  ],
  template: `
    <div
      class="flex gap-x-6 overflow-x-auto border-t border-neutral-a4 pt-3 pb-2"
      cdkDropListGroup
    >
      @for (column of columns(); track column.status) {
        <div class="flex w-72 shrink-0 flex-col gap-y-3">
          <div class="flex items-center gap-x-2 px-1">
            <project-status-pill [status]="column.status" />
            <div class="text-sm text-neutral-a11 tabular-nums">
              {{ column.projects.length }}
            </div>
          </div>

          <div
            class="flex min-h-24 flex-auto flex-col gap-y-4"
            cdkDropList
            [cdkDropListData]="column.status"
            (cdkDropListDropped)="move($event)"
          >
            @for (project of column.projects; track project.id) {
              <mat-card
                class="flex cursor-pointer flex-col"
                cdkDrag
                cdkDragPreviewContainer="parent"
                [cdkDragData]="project"
                [cdkDragPreviewClass]="[
                  'bg-neutral-2',
                  'dark:bg-neutral-5',
                  'shadow-lg',
                ]"
                [appearance]="cardStyle() === 'filled' ? 'filled' : 'raised'"
                [routerLink]="project.id"
              >
                <mat-card-header>
                  <div class="flex flex-auto items-center gap-x-2">
                    <div class="flex-auto truncate font-medium">
                      {{ project.name }}
                    </div>
                    <div
                      class="flex shrink-0 items-center gap-x-1 text-sm text-neutral-a11"
                    >
                      <mat-icon
                        class="size-3.5"
                        [svgIcon]="priorityIcon(project.priority)"
                      />
                      {{ project.priority | titlecase }}
                    </div>
                  </div>
                </mat-card-header>
                <mat-card-content
                  class="flex flex-col gap-y-3"
                  [class.p-3]="cardStyle() === 'filled'"
                >
                  <div class="flex items-center gap-x-2">
                    <project-health-pill [health]="project.health" />
                    <div class="text-sm text-neutral-a11 tabular-nums">
                      {{ project.progress }}%
                    </div>
                  </div>
                  @if (progressBar()) {
                    <mat-progress-bar [value]="project.progress" />
                  }
                  @if (showDescription()) {
                    <div class="line-clamp-2 text-sm text-neutral-a11">
                      {{ project.description }}
                    </div>
                  }
                  <div class="flex items-center gap-x-2">
                    <div class="flex shrink-0 items-center -space-x-1">
                      @for (member of project.members; track member.name) {
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
                      @if (project.members.length > 4) {
                        <div
                          class="flex size-5 shrink-0 items-center justify-center rounded-full bg-neutral-4 text-sm font-medium text-neutral-a11 ring-2 ring-white dark:ring-neutral-2"
                        >
                          +{{ project.members.length - 4 }}
                        </div>
                      }
                    </div>
                    <div
                      class="ms-auto flex items-center gap-x-1 text-sm tabular-nums"
                      [class]="
                        isOverdue(project) ? 'text-red-a11' : 'text-neutral-a11'
                      "
                    >
                      <mat-icon
                        class="size-3.5 text-current"
                        svgIcon="calendar"
                      />
                      {{
                        relativeDates()
                          ? relativeDate(project.targetDate)
                          : (project.targetDate | date: 'MMM d')
                      }}
                    </div>
                  </div>
                </mat-card-content>

                <div
                  *cdkDragPlaceholder
                  class="h-32 rounded-lg bg-neutral-a3 shadow-inner dark:bg-black-a5 dark:shadow-black-a5"
                ></div>
              </mat-card>
            } @empty {
              <!-- Hidden while a card hovers the lane, the placeholder takes its spot -->
              <div
                class="flex h-24 items-center justify-center rounded-lg border border-dashed border-neutral-a4 text-sm text-neutral-a11 in-[.cdk-drop-list-dragging]:hidden"
              >
                No projects
              </div>
            }
          </div>
        </div>
      }
    </div>

    <!-- Customize -->
    <div
      buiSheet
      class="w-full sm:max-w-sm"
      [(open)]="customizeOpen"
    >
      <ng-template buiSheetPortal>
        <div buiSheetBackdrop></div>
        <div buiSheetContent>
          <!-- Header -->
          <header
            buiSheetHeader
            class="flex items-center"
          >
            <div class="flex-auto text-xl font-medium">Customize</div>
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
            class="flex flex-col px-6 pb-6"
          >
            <!-- Card style -->
            <div class="font-medium">Card style</div>
            <div class="text-sm text-neutral-a11">
              Set how each card sits on the board.
            </div>

            <mat-button-toggle-group
              class="segmented small mt-3 self-start"
              name="cardStyle"
              [value]="cardStyle()"
              (valueChange)="cardStyle.set($event)"
            >
              <mat-button-toggle value="filled">Filled</mat-button-toggle>
              <mat-button-toggle value="normal">Normal</mat-button-toggle>
            </mat-button-toggle-group>

            <!-- Display -->
            <div class="mt-6 font-medium">Display</div>
            <div class="text-sm text-neutral-a11">
              Pick the details each card carries.
            </div>

            <div class="mt-3 flex flex-col gap-y-1">
              <mat-slide-toggle
                class="py-1.5"
                fullWidth
                labelPosition="before"
                [checked]="showDescription()"
                (change)="showDescription.set($event.checked)"
              >
                Show description
              </mat-slide-toggle>

              <mat-slide-toggle
                class="py-1.5"
                fullWidth
                labelPosition="before"
                [checked]="relativeDates()"
                (change)="relativeDates.set($event.checked)"
              >
                Relative dates
              </mat-slide-toggle>

              <mat-slide-toggle
                class="py-1.5"
                fullWidth
                labelPosition="before"
                [checked]="progressBar()"
                (change)="progressBar.set($event.checked)"
              >
                Progress bar
              </mat-slide-toggle>
            </div>
          </div>

          <div buiSheetFooter>
            <button
              matButton
              (click)="reset()"
            >
              Reset to defaults
            </button>
          </div>
        </div>
      </ng-template>
    </div>
  `,
})
export class ProjectsBoard {
  // Dependencies
  private projectsService = inject(ProjectsService);

  // Inputs / Outputs
  readonly projects = input.required<Project[]>();
  readonly customizeOpen = model(false);

  // State
  private showDescription = signal(true);
  private relativeDates = signal(false);
  private progressBar = signal(true);
  private cardStyle = signal<CardStyle>('filled');
  private statusOrder: ProjectStatus[] = [
    'backlog',
    'planned',
    'in-progress',
    'paused',
    'completed',
  ];

  // Computed state
  private columns = computed(() => {
    const projects = this.projects();

    return this.statusOrder.map((status) => ({
      status,
      projects: projects.filter((project) => project.status === status),
    }));
  });

  private move(event: CdkDragDrop<ProjectStatus, ProjectStatus, Project>) {
    this.projectsService.setStatus(event.item.data.id, event.container.data);
  }

  private reset() {
    this.showDescription.set(true);
    this.relativeDates.set(false);
    this.progressBar.set(true);
    this.cardStyle.set('filled');
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

  private relativeDate(date: string) {
    if (differenceInSeconds(Date.now(), date) < 60) {
      return 'Just now';
    }

    return formatDistanceToNowStrict(date, { addSuffix: true });
  }

  private isOverdue(project: Project) {
    return (
      new Date(project.targetDate) < new Date() &&
      project.status !== 'completed'
    );
  }
}
