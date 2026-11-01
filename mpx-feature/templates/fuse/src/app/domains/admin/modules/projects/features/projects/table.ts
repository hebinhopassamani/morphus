import { SelectionModel } from '@angular/cdk/collections';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDragHandle,
  CdkDragPlaceholder,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { DatePipe, NgOptimizedImage, TitleCasePipe } from '@angular/common';
import {
  afterNextRender,
  Component,
  computed,
  effect,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import {
  MatButtonToggle,
  MatButtonToggleGroup,
} from '@angular/material/button-toggle';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatIcon } from '@angular/material/icon';
import { MatPaginator } from '@angular/material/paginator';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { differenceInSeconds, formatDistanceToNowStrict } from 'date-fns';
import {
  Column,
  Project,
  ProjectHealth,
  ProjectPriority,
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

type Density = 'comfortable' | 'compact';

const COLUMNS: Column[] = [
  {
    id: 'name',
    label: 'Project',
    icon: 'folder-kanban',
    visible: true,
    locked: true,
  },
  {
    id: 'status',
    label: 'Status',
    icon: 'loader-circle',
    visible: true,
    locked: false,
  },
  {
    id: 'health',
    label: 'Health',
    icon: 'heart-pulse',
    visible: true,
    locked: false,
  },
  {
    id: 'priority',
    label: 'Priority',
    icon: 'signal-high',
    visible: true,
    locked: false,
  },
  {
    id: 'lead',
    label: 'Lead',
    icon: 'user',
    visible: true,
    locked: false,
  },
  {
    id: 'members',
    label: 'Members',
    icon: 'users',
    visible: true,
    locked: false,
  },
  {
    id: 'progress',
    label: 'Progress',
    icon: 'chart-line',
    visible: true,
    locked: false,
  },
  {
    id: 'targetDate',
    label: 'Target date',
    icon: 'calendar',
    visible: true,
    locked: false,
  },
  {
    id: 'updatedAt',
    label: 'Updated',
    icon: 'clock',
    visible: true,
    locked: false,
  },
];

@Component({
  selector: 'projects-table',
  imports: [
    CdkDrag,
    CdkDragHandle,
    CdkDragPlaceholder,
    CdkDropList,
    DatePipe,
    MatButton,
    MatButtonToggle,
    MatButtonToggleGroup,
    MatCheckbox,
    MatIcon,
    MatIconButton,
    MatPaginator,
    MatProgressBar,
    MatSlideToggle,
    MatSort,
    MatSortHeader,
    MatTableModule,
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
  host: {
    class: 'flex flex-col',
  },
  template: `
    <div class="relative isolate overflow-x-visible overflow-y-hidden">
      <table
        class="whitespace-nowrap"
        [class]="compact() ? '[--table-body-row-height:2.5rem]' : ''"
        mat-table
        [dataSource]="dataSource"
        [trackBy]="trackBy"
        matSort
        matSortActive="updatedAt"
        matSortDirection="desc"
      >
        <!-- Select column -->
        <ng-container matColumnDef="select">
          <th
            class="w-4"
            mat-header-cell
            *matHeaderCellDef
          >
            <mat-checkbox
              [checked]="selection().hasValue() && isAllSelected()"
              [indeterminate]="selection().hasValue() && !isAllSelected()"
              (change)="toggleAllRows()"
            >
            </mat-checkbox>
          </th>
          <td
            mat-cell
            *matCellDef="let row"
          >
            <mat-checkbox
              [checked]="selection().isSelected(row)"
              (click)="$event.stopPropagation()"
              (change)="selection().toggle(row)"
            >
            </mat-checkbox>
          </td>
        </ng-container>

        <!-- Name column -->
        <ng-container matColumnDef="name">
          <th
            mat-header-cell
            *matHeaderCellDef
            mat-sort-header
          >
            <div class="flex items-center gap-x-1.5">
              <mat-icon
                class="size-4 text-neutral-a9"
                svgIcon="folder-kanban"
              />
              Project
            </div>
          </th>
          <td
            mat-cell
            *matCellDef="let row"
          >
            <div
              class="flex items-center gap-x-2.5"
              [class]="compact() ? 'py-1' : 'py-1.5'"
            >
              <div
                class="flex size-7 shrink-0 items-center justify-center rounded-lg bg-neutral-a3 text-neutral-a11"
              >
                <mat-icon
                  class="size-4"
                  svgIcon="folder-kanban"
                />
              </div>
              <div class="flex flex-col">
                <div class="font-medium">{{ row.name }}</div>
                @if (showDescription()) {
                  <div class="truncate text-sm text-neutral-a11">
                    {{ row.description }}
                  </div>
                }
              </div>
            </div>
          </td>
        </ng-container>

        <!-- Status column -->
        <ng-container matColumnDef="status">
          <th
            mat-header-cell
            *matHeaderCellDef
            mat-sort-header
          >
            <div class="flex items-center gap-x-1.5">
              <mat-icon
                class="size-4 text-neutral-a9"
                svgIcon="loader-circle"
              />
              Status
            </div>
          </th>
          <td
            mat-cell
            *matCellDef="let row"
          >
            <project-status-pill [status]="row.status" />
          </td>
        </ng-container>

        <!-- Health column -->
        <ng-container matColumnDef="health">
          <th
            mat-header-cell
            *matHeaderCellDef
            mat-sort-header
          >
            <div class="flex items-center gap-x-1.5">
              <mat-icon
                class="size-4 text-neutral-a9"
                svgIcon="heart-pulse"
              />
              Health
            </div>
          </th>
          <td
            mat-cell
            *matCellDef="let row"
          >
            <project-health-pill [health]="row.health" />
          </td>
        </ng-container>

        <!-- Priority column -->
        <ng-container matColumnDef="priority">
          <th
            mat-header-cell
            *matHeaderCellDef
            mat-sort-header
          >
            <div class="flex items-center gap-x-1.5">
              <mat-icon
                class="size-4 text-neutral-a9"
                svgIcon="signal-high"
              />
              Priority
            </div>
          </th>
          <td
            mat-cell
            *matCellDef="let row"
          >
            <div class="flex items-center gap-x-1.5 text-neutral-a11">
              <mat-icon
                class="size-3.5"
                [svgIcon]="priorityIcon(row.priority)"
              />
              {{ row.priority | titlecase }}
            </div>
          </td>
        </ng-container>

        <!-- Lead column -->
        <ng-container matColumnDef="lead">
          <th
            mat-header-cell
            *matHeaderCellDef
            mat-sort-header
          >
            <div class="flex items-center gap-x-1.5">
              <mat-icon
                class="size-4 text-neutral-a9"
                svgIcon="user"
              />
              Lead
            </div>
          </th>
          <td
            mat-cell
            *matCellDef="let row"
          >
            <div class="flex items-center gap-x-1.5">
              <img
                class="shrink-0 rounded-full object-cover"
                width="20"
                height="20"
                [ngSrc]="row.lead.photo"
                [alt]="row.lead.name"
              />
              {{ row.lead.name }}
            </div>
          </td>
        </ng-container>

        <!-- Members column -->
        <ng-container matColumnDef="members">
          <th
            mat-header-cell
            *matHeaderCellDef
          >
            <div class="flex items-center gap-x-1.5">
              <mat-icon
                class="size-4 text-neutral-a9"
                svgIcon="users"
              />
              Members
            </div>
          </th>
          <td
            mat-cell
            *matCellDef="let row"
          >
            @if (memberAvatars()) {
              <div class="flex shrink-0 items-center -space-x-1">
                @for (member of row.members; track member.name) {
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
                @if (row.members.length > 4) {
                  <div
                    class="flex size-5 shrink-0 items-center justify-center rounded-full bg-neutral-4 text-sm font-medium text-neutral-a11 ring-2 ring-white dark:ring-neutral-2"
                  >
                    +{{ row.members.length - 4 }}
                  </div>
                }
              </div>
            } @else {
              <div class="text-neutral-a11">
                {{ row.members.length }} members
              </div>
            }
          </td>
        </ng-container>

        <!-- Progress column -->
        <ng-container matColumnDef="progress">
          <th
            mat-header-cell
            *matHeaderCellDef
            mat-sort-header
          >
            <div class="flex items-center gap-x-1.5">
              <mat-icon
                class="size-4 text-neutral-a9"
                svgIcon="chart-line"
              />
              Progress
            </div>
          </th>
          <td
            mat-cell
            *matCellDef="let row"
          >
            <div class="flex items-center gap-x-2">
              @if (progressBar()) {
                <mat-progress-bar
                  class="w-20"
                  [value]="row.progress"
                />
              }
              <div class="w-8 text-end text-neutral-a11 tabular-nums">
                {{ row.progress }}%
              </div>
            </div>
          </td>
        </ng-container>

        <!-- Target date column -->
        <ng-container matColumnDef="targetDate">
          <th
            mat-header-cell
            *matHeaderCellDef
            mat-sort-header
          >
            <div class="flex items-center gap-x-1.5">
              <mat-icon
                class="size-4 text-neutral-a9"
                svgIcon="calendar"
              />
              Target date
            </div>
          </th>
          <td
            mat-cell
            *matCellDef="let row"
          >
            <div
              class="flex items-center gap-x-1.5"
              [class]="
                highlightOverdue() && isOverdue(row) ? 'text-red-a11' : ''
              "
            >
              @if (highlightOverdue() && isOverdue(row)) {
                <mat-icon
                  class="size-4 text-current"
                  svgIcon="circle-alert"
                />
              }
              <span class="tabular-nums">
                {{
                  relativeDates()
                    ? relativeDate(row.targetDate)
                    : (row.targetDate | date: 'MMM d, y')
                }}
              </span>
            </div>
          </td>
        </ng-container>

        <!-- Updated column -->
        <ng-container matColumnDef="updatedAt">
          <th
            mat-header-cell
            *matHeaderCellDef
            mat-sort-header
          >
            <div class="flex items-center gap-x-1.5">
              <mat-icon
                class="size-4 text-neutral-a9"
                svgIcon="clock"
              />
              Updated
            </div>
          </th>
          <td
            mat-cell
            *matCellDef="let row"
          >
            @if (relativeDates()) {
              {{ relativeDate(row.updatedAt) }}
            } @else {
              {{ row.updatedAt | date: 'MMM d, y' }}
            }
          </td>
        </ng-container>

        <ng-template matNoDataRow>
          <tr>
            <td [attr.colspan]="columnIds().length">
              <div
                class="flex flex-col items-center justify-center gap-y-2 py-10"
              >
                <mat-icon
                  class="size-10"
                  svgIcon="folder-kanban"
                />
                <div class="text-center text-neutral-a11">
                  No projects match this view.
                </div>
              </div>
            </td>
          </tr>
        </ng-template>

        <!-- Header row definition -->
        <tr
          mat-header-row
          *matHeaderRowDef="columnIds()"
        ></tr>

        <!-- Row definition -->
        <tr
          class="group relative cursor-pointer hover:bg-neutral-a2"
          mat-row
          *matRowDef="let row; columns: columnIds()"
          [routerLink]="row.id"
        ></tr>
      </table>
    </div>
    <mat-paginator
      class="p-2"
      [length]="projects().length"
      [pageSize]="25"
      [pageSizeOptions]="[10, 25, 50]"
    />

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
            <!-- Density -->
            <div class="font-medium">Density</div>
            <div class="text-sm text-neutral-a11">
              Set how much room each row gets.
            </div>

            <mat-button-toggle-group
              class="segmented small mt-3 self-start"
              name="density"
              [value]="density()"
              (valueChange)="density.set($event)"
            >
              <mat-button-toggle value="comfortable">
                Comfortable
              </mat-button-toggle>
              <mat-button-toggle value="compact"> Compact </mat-button-toggle>
            </mat-button-toggle-group>

            <!-- Columns -->
            <div class="mt-6 font-medium">Columns</div>
            <div class="text-sm text-neutral-a11">
              Toggle and reorder the table columns.
            </div>

            <div
              class="-mx-3 mt-3 flex flex-col gap-y-1"
              cdkDropList
              (cdkDropListDropped)="drop($event)"
            >
              @for (column of columns(); track column.id) {
                <div
                  class="flex items-center gap-x-3 rounded-md px-2 py-1.5"
                  cdkDrag
                  cdkDragLockAxis="y"
                  cdkDragPreviewContainer="parent"
                  [cdkDragPreviewClass]="[
                    'bg-neutral-2',
                    'dark:bg-neutral-5',
                    'shadow-lg',
                    'rounded-md',
                  ]"
                >
                  <mat-icon
                    cdkDragHandle
                    class="size-4 cursor-grab text-neutral-a10"
                    svgIcon="grip-vertical"
                  />
                  <mat-slide-toggle
                    fullWidth
                    labelPosition="before"
                    [checked]="column.visible"
                    [disabled]="column.locked"
                    (change)="toggleVisibility(column)"
                  >
                    <div class="flex items-center gap-x-2">
                      <mat-icon
                        class="size-4 text-current"
                        [svgIcon]="column.icon"
                      />
                      {{ column.label }}
                    </div>
                  </mat-slide-toggle>

                  <div
                    *cdkDragPlaceholder
                    class="h-8 rounded-md bg-neutral-a3 shadow-inner dark:bg-black-a5 dark:shadow-black-a5"
                  ></div>
                </div>
              }
            </div>

            <!-- Display -->
            <div class="mt-6 font-medium">Display</div>
            <div class="text-sm text-neutral-a11">
              Pick the details each row carries.
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
                [checked]="highlightOverdue()"
                (change)="highlightOverdue.set($event.checked)"
              >
                Highlight overdue
              </mat-slide-toggle>

              <mat-slide-toggle
                class="py-1.5"
                fullWidth
                labelPosition="before"
                [checked]="memberAvatars()"
                (change)="memberAvatars.set($event.checked)"
              >
                Member avatars
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
export class ProjectsTable {
  // Inputs / Outputs
  readonly projects = input.required<Project[]>();
  readonly selection = input.required<SelectionModel<Project>>();
  readonly customizeOpen = model(false);

  // Queries
  readonly paginator = viewChild(MatPaginator);
  readonly sort = viewChild(MatSort);

  // State
  private columns = signal<Column[]>([...COLUMNS]);
  private density = signal<Density>('comfortable');
  private showDescription = signal(false);
  private relativeDates = signal(false);
  private highlightOverdue = signal(true);
  private memberAvatars = signal(true);
  private progressBar = signal(true);
  private dataSource = new MatTableDataSource<Project>([]);
  private priorityOrder: ProjectPriority[] = [
    'low',
    'medium',
    'high',
    'urgent',
  ];
  private statusOrder: ProjectStatus[] = [
    'backlog',
    'planned',
    'in-progress',
    'paused',
    'completed',
  ];
  private healthOrder: ProjectHealth[] = ['on-track', 'at-risk', 'off-track'];

  // Computed state
  private compact = computed(() => this.density() === 'compact');
  private columnIds = computed(() => [
    'select',
    ...this.columns()
      .filter((column) => column.visible)
      .map((column) => column.id),
  ]);

  constructor() {
    afterNextRender(() => {
      this.dataSource.paginator = this.paginator() ?? null;
      this.dataSource.sort = this.sort() ?? null;
    });

    effect(() => {
      this.dataSource.data = this.projects();
      this.paginator()?.firstPage();
    });

    this.dataSource.sortingDataAccessor = (project, id) => {
      if (id === 'lead') {
        return project.lead.name;
      }

      if (id === 'priority') {
        return this.priorityOrder.indexOf(project.priority);
      }

      if (id === 'status') {
        return this.statusOrder.indexOf(project.status);
      }

      if (id === 'health') {
        return this.healthOrder.indexOf(project.health);
      }

      return project[id as keyof Project] as string | number;
    };
  }

  private drop(event: CdkDragDrop<Column>) {
    const columns = this.columns();
    moveItemInArray(columns, event.previousIndex, event.currentIndex);
    this.columns.set([...columns]);
  }

  private toggleVisibility(column: Column) {
    if (column.locked) {
      return;
    }

    this.columns.update((columns) =>
      columns.map((c) =>
        c.id === column.id ? { ...c, visible: !c.visible } : c
      )
    );
  }

  private reset() {
    this.columns.set([...COLUMNS]);
    this.density.set('comfortable');
    this.showDescription.set(false);
    this.relativeDates.set(false);
    this.highlightOverdue.set(true);
    this.memberAvatars.set(true);
    this.progressBar.set(true);
  }

  private isAllSelected() {
    return this.selection().selected.length === this.dataSource.data.length;
  }

  private toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection().clear();
    } else {
      this.dataSource.data.forEach((row) => this.selection().select(row));
    }
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

  private trackBy(_: number, item: Project) {
    return item.id;
  }
}
