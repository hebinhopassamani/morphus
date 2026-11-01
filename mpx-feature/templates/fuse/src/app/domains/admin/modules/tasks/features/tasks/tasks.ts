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
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import {
  MatButtonToggle,
  MatButtonToggleGroup,
} from '@angular/material/button-toggle';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import {
  MatFormField,
  MatInput,
  MatPrefix,
  MatSuffix,
} from '@angular/material/input';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatPaginator } from '@angular/material/paginator';
import {
  MatSidenav,
  MatSidenavContainer,
  MatSidenavContent,
} from '@angular/material/sidenav';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { endOfWeek, isAfter, isThisWeek, isToday } from 'date-fns';
import { Media } from '@/app/core/media';
import {
  Column,
  ProjectPriority,
} from '@/app/domains/admin/modules/projects/data/projects';
import {
  TaskItem,
  TasksService,
} from '@/app/domains/admin/modules/tasks/data/tasks';
import { TasksNewTask } from '@/app/domains/admin/modules/tasks/features/tasks/new-task';
import TaskPanel from '@/app/domains/admin/modules/tasks/features/tasks/task';
import {
  BuiCombobox,
  BuiComboboxContent,
  BuiComboboxEmpty,
  BuiComboboxListbox,
  BuiComboboxOption,
  BuiComboboxOptionIndicator,
  BuiComboboxPortal,
  BuiComboboxSearch,
  BuiComboboxTrigger,
} from '@/app/ui/combobox';
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

type FilterId = 'state' | 'assignee' | 'project' | 'priority';

type Filter = {
  id: FilterId;
  label: string;
  search?: string;
};

type FilterOption = {
  id: string;
  label: string;
  photo?: string;
};

type Due = 'overdue' | 'today' | 'week' | 'later' | 'any';

type DueOption = {
  id: Due;
  label: string;
};

type View = 'mine' | 'all';

type DataSourceFilter = {
  search: string;
  mine: boolean;
  states: string[];
  assignees: string[];
  projects: string[];
  priorities: string[];
  due: Due;
};

const CURRENT_USER = 'John Builder';

const FILTERS: Filter[] = [
  {
    id: 'state',
    label: 'State',
  },
  {
    id: 'assignee',
    label: 'Assignee',
    search: 'assignees',
  },
  {
    id: 'project',
    label: 'Project',
    search: 'projects',
  },
  {
    id: 'priority',
    label: 'Priority',
  },
];

const STATE_OPTIONS: FilterOption[] = [
  {
    id: 'todo',
    label: 'Todo',
  },
  {
    id: 'in-progress',
    label: 'In progress',
  },
  {
    id: 'blocked',
    label: 'Blocked',
  },
  {
    id: 'done',
    label: 'Done',
  },
];

const PRIORITY_OPTIONS: FilterOption[] = [
  {
    id: 'urgent',
    label: 'Urgent',
  },
  {
    id: 'high',
    label: 'High',
  },
  {
    id: 'medium',
    label: 'Medium',
  },
  {
    id: 'low',
    label: 'Low',
  },
];

const DUE_OPTIONS: DueOption[] = [
  {
    id: 'overdue',
    label: 'Overdue',
  },
  {
    id: 'today',
    label: 'Today',
  },
  {
    id: 'week',
    label: 'This week',
  },
  {
    id: 'later',
    label: 'Later',
  },
  {
    id: 'any',
    label: 'Any',
  },
];

const COLUMNS: Column[] = [
  {
    id: 'task',
    label: 'Task',
    icon: 'list-todo',
    visible: true,
    locked: true,
  },
  {
    id: 'project',
    label: 'Project',
    icon: 'folder-kanban',
    visible: true,
    locked: false,
  },
  {
    id: 'assignee',
    label: 'Assignee',
    icon: 'user',
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
    id: 'dueDate',
    label: 'Due date',
    icon: 'calendar',
    visible: true,
    locked: false,
  },
];

@Component({
  selector: 'tasks',
  imports: [
    BuiCombobox,
    BuiComboboxContent,
    BuiComboboxEmpty,
    BuiComboboxListbox,
    BuiComboboxOption,
    BuiComboboxOptionIndicator,
    BuiComboboxPortal,
    BuiComboboxSearch,
    BuiComboboxTrigger,
    BuiSheet,
    BuiSheetBackdrop,
    BuiSheetBody,
    BuiSheetClose,
    BuiSheetContent,
    BuiSheetFooter,
    BuiSheetHeader,
    BuiSheetPortal,
    CdkDrag,
    CdkDragHandle,
    CdkDragPlaceholder,
    CdkDropList,
    DatePipe,
    FormsModule,
    MatButton,
    MatButtonToggle,
    MatButtonToggleGroup,
    MatDivider,
    MatFormField,
    MatIcon,
    MatIconButton,
    MatInput,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    MatPaginator,
    MatPrefix,
    MatSidenav,
    MatSidenavContainer,
    MatSidenavContent,
    MatSlideToggle,
    MatSort,
    MatSortHeader,
    MatSuffix,
    MatTableModule,
    NgOptimizedImage,
    RouterLink,
    RouterOutlet,
    TasksNewTask,
    TitleCasePipe,
  ],
  host: {
    class: 'flex min-h-0 flex-auto',
  },
  template: `
    <mat-sidenav-container
      class="z-auto [&_.mat-drawer-backdrop]:fixed [&_.mat-drawer-backdrop]:z-100"
      (backdropClick)="closePanel()"
    >
      <!-- Task -->
      <mat-sidenav
        class="z-100 w-full bg-white sm:w-110 dark:bg-neutral-2"
        position="end"
        disableClose
        [mode]="isNarrow() ? 'over' : 'side'"
        [fixedInViewport]="isNarrow()"
        [opened]="!!panel()"
        (keydown.escape)="closePanel()"
      >
        <router-outlet
          (activate)="panel.set($event)"
          (deactivate)="panel.set(null)"
        />
      </mat-sidenav>

      <mat-sidenav-content>
        <div
          class="mx-auto flex w-full max-w-7xl flex-auto flex-col gap-4 p-6 sm:gap-6 lg:p-8"
        >
          <!-- Header -->
          <div class="flex items-center justify-between gap-x-3">
            <div class="flex flex-col gap-y-0.5">
              <div class="text-3xl font-semibold tracking-tighter">Tasks</div>
              <div class="text-neutral-a11 sm:text-lg">
                Every task across the workspace projects, in one list.
              </div>
            </div>

            <!-- Spacer -->
            <div class="flex-auto"></div>

            <!-- Actions -->
            <div class="flex shrink-0 items-center gap-x-3">
              <button
                matButton
                class="primary"
                (click)="newTaskOpen.set(true)"
              >
                <mat-icon svgIcon="plus" />
                New task
              </button>
            </div>
          </div>

          <div class="flex flex-col gap-y-3">
            <!-- Views & Search -->
            <div class="flex items-center gap-x-2">
              <mat-button-toggle-group
                class="segmented"
                name="view"
                [value]="view()"
                (valueChange)="view.set($event)"
              >
                <mat-button-toggle value="mine">
                  <mat-icon svgIcon="user-round" />
                  <span class="hidden sm:flex">My tasks</span>
                </mat-button-toggle>
                <mat-button-toggle value="all">
                  <mat-icon svgIcon="users-round" />
                  <span class="hidden sm:flex">All tasks</span>
                </mat-button-toggle>
              </mat-button-toggle-group>

              <!-- Spacer -->
              <div class="flex-auto"></div>

              <!-- Search -->
              <mat-form-field class="w-full max-w-72">
                <mat-icon
                  svgIcon="search"
                  matIconPrefix
                />
                <input
                  matInput
                  placeholder="Search tasks"
                  [ngModel]="search()"
                  (ngModelChange)="search.set($event)"
                />
                @if (search()) {
                  <button
                    matIconButton
                    matIconSuffix
                    (click)="search.set('')"
                  >
                    <mat-icon svgIcon="x" />
                  </button>
                }
              </mat-form-field>
            </div>

            <!-- Filters -->
            <div
              class="flex flex-wrap items-center gap-2 border-t border-neutral-a4 pt-3"
            >
              <div class="flex items-center rounded-lg bg-neutral-a3">
                <div
                  buiCombobox
                  class="w-fit"
                  [value]="[dueFilter()]"
                  (valueChange)="dueFilter.set($event[0] ?? dueFilter())"
                >
                  <button
                    matButton
                    class="tertiary tiny hover:bg-neutral-a4"
                    buiComboboxTrigger
                    id="tasks-due-filter"
                  >
                    <span class="font-medium">
                      Due:
                      <span class="font-normal">{{ dueFilter().label }}</span>
                    </span>
                    <mat-icon
                      svgIcon="chevron-down"
                      iconPositionEnd
                    />
                  </button>
                  <ng-template
                    buiComboboxPortal
                    matchWidth="false"
                  >
                    <div
                      buiComboboxContent
                      class="min-w-40"
                    >
                      <div
                        buiComboboxListbox
                        aria-labelledby="tasks-due-filter"
                        focusMode="activedescendant"
                        selectionMode="explicit"
                      >
                        @for (option of dueOptions; track option.id) {
                          <div
                            buiComboboxOption
                            [value]="option"
                            [label]="option.label"
                          >
                            <span class="flex-auto truncate">{{
                              option.label
                            }}</span>
                            <span buiComboboxOptionIndicator></span>
                          </div>
                        }
                      </div>
                    </div>
                  </ng-template>
                </div>
              </div>

              <mat-divider
                vertical
                class="h-5"
              />

              @for (filter of activeFilters(); track filter.id) {
                <div class="flex items-center rounded-lg bg-neutral-a3">
                  <div
                    buiCombobox
                    class="w-fit"
                    [value]="selections()[filter.id]"
                    (valueChange)="setSelection(filter, $event)"
                    (expandedChange)="filterQuery.set('')"
                  >
                    <button
                      matButton
                      class="tertiary tiny hover:bg-neutral-a4"
                      buiComboboxTrigger
                      [id]="'tasks-' + filter.id + '-filter'"
                    >
                      <span class="font-medium">
                        {{ filter.label }}:
                        <span class="font-normal">
                          {{ selectionLabel(filter) }}
                        </span>
                      </span>
                      <mat-icon
                        svgIcon="chevron-down"
                        iconPositionEnd
                      />
                    </button>
                    <ng-template
                      buiComboboxPortal
                      matchWidth="false"
                    >
                      <div
                        buiComboboxContent
                        class="max-w-64 min-w-40"
                      >
                        @if (filter.search) {
                          <input
                            buiComboboxSearch
                            autocomplete="off"
                            placeholder="Search {{ filter.search }}"
                            [value]="filterQuery()"
                            (input)="filterQuery.set(filterSearch.value)"
                            #filterSearch
                          />
                        }
                        <div
                          buiComboboxListbox
                          [attr.aria-labelledby]="
                            'tasks-' + filter.id + '-filter'
                          "
                          multi
                          focusMode="activedescendant"
                          selectionMode="explicit"
                        >
                          @for (
                            option of filterResults()[filter.id];
                            track option.id
                          ) {
                            <div
                              buiComboboxOption
                              [value]="option.id"
                              [label]="option.label"
                            >
                              <span
                                class="flex min-w-0 flex-auto items-center gap-x-2"
                              >
                                @if (option.photo) {
                                  <img
                                    class="shrink-0 rounded-full object-cover"
                                    width="20"
                                    height="20"
                                    [ngSrc]="option.photo"
                                    [alt]="option.label"
                                  />
                                }
                                {{ option.label }}
                              </span>
                              <span buiComboboxOptionIndicator></span>
                            </div>
                          } @empty {
                            <div buiComboboxEmpty>
                              No {{ filter.search }} found
                            </div>
                          }
                        </div>
                        @if (selections()[filter.id].length) {
                          <mat-divider />
                          <button
                            matButton
                            class="tertiary m-1 justify-start rounded-[calc(var(--theme-border-radius)*2/3)] px-2"
                            (click)="setSelection(filter, [])"
                          >
                            <mat-icon svgIcon="x" />
                            Clear filter
                          </button>
                        }
                      </div>
                    </ng-template>
                  </div>
                  <button
                    matIconButton
                    class="tertiary tiny hover:bg-neutral-a4"
                    (click)="removeFilter(filter)"
                  >
                    <mat-icon svgIcon="x" />
                  </button>
                </div>
              }

              @if (availableFilters().length) {
                <button
                  matButton
                  class="tertiary tiny"
                  [matMenuTriggerFor]="addFilterMenu"
                >
                  <mat-icon svgIcon="plus" />
                  Add filter
                </button>
                <mat-menu
                  class="min-w-40"
                  #addFilterMenu="matMenu"
                >
                  @for (filter of availableFilters(); track filter.id) {
                    <button
                      mat-menu-item
                      (click)="addFilter(filter)"
                    >
                      {{ filter.label }}
                    </button>
                  }
                </mat-menu>
              }

              @if (hasFilters()) {
                <button
                  matButton
                  class="tertiary tiny"
                  (click)="clearFilters()"
                >
                  Clear all
                </button>
              }

              <!-- Customize -->
              <button
                matButton
                class="tertiary tiny ms-auto"
                (click)="customizeOpen.set(true)"
              >
                <mat-icon svgIcon="settings-2" />
                Customize
              </button>
            </div>

            <!-- Table -->
            <div class="flex flex-col">
              <div
                class="relative isolate overflow-x-visible overflow-y-hidden"
              >
                <table
                  class="whitespace-nowrap"
                  mat-table
                  [dataSource]="dataSource"
                  [trackBy]="trackBy"
                  matSort
                >
                  <!-- Task column -->
                  <ng-container matColumnDef="task">
                    <th
                      mat-header-cell
                      *matHeaderCellDef
                      mat-sort-header
                    >
                      <div class="flex items-center gap-x-1.5">
                        <mat-icon
                          class="size-4 text-neutral-a9"
                          svgIcon="list-todo"
                        />
                        Task
                      </div>
                    </th>
                    <td
                      mat-cell
                      *matCellDef="let row"
                    >
                      <div class="flex max-w-md min-w-0 items-center gap-x-2">
                        @switch (row.state) {
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
                        <div class="shrink-0 text-neutral-a11 tabular-nums">
                          {{ row.key }}
                        </div>
                        <div class="truncate font-medium">{{ row.title }}</div>
                      </div>
                    </td>
                  </ng-container>

                  <!-- Project column -->
                  <ng-container matColumnDef="project">
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
                      {{ row.project.name }}
                    </td>
                  </ng-container>

                  <!-- Assignee column -->
                  <ng-container matColumnDef="assignee">
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
                        Assignee
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
                          [ngSrc]="row.assignee.photo"
                          [alt]="row.assignee.name"
                        />
                        {{ row.assignee.name }}
                      </div>
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

                  <!-- Due date column -->
                  <ng-container matColumnDef="dueDate">
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
                        Due date
                      </div>
                    </th>
                    <td
                      mat-cell
                      *matCellDef="let row"
                    >
                      <div
                        class="flex items-center gap-x-1.5"
                        [class.text-red-a11]="isOverdue(row)"
                      >
                        @if (isOverdue(row)) {
                          <mat-icon
                            class="size-4 text-current"
                            svgIcon="circle-alert"
                          />
                        }
                        <span class="tabular-nums">
                          {{ row.dueDate | date: 'MMM d, y' }}
                        </span>
                      </div>
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
                            svgIcon="list-todo"
                          />
                          <div class="text-center text-neutral-a11">
                            No tasks match this view.
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
                    class="cursor-pointer hover:bg-neutral-a2"
                    mat-row
                    *matRowDef="let row; columns: columnIds()"
                    [class.bg-neutral-a3]="row.key === panel()?.key()"
                    [routerLink]="row.key"
                  ></tr>
                </table>
              </div>
              <mat-paginator
                class="p-2"
                [length]="tasks().length"
                [pageSize]="20"
                [pageSizeOptions]="[10, 20, 50]"
              />
            </div>
          </div>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>

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
            <!-- Columns -->
            <div class="font-medium">Columns</div>
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

    <!-- New task -->
    <tasks-new-task [(open)]="newTaskOpen" />
  `,
})
export default class Tasks {
  // Dependencies
  private media = inject(Media);
  private router = inject(Router);
  private tasksService = inject(TasksService);

  // Queries
  readonly paginator = viewChild(MatPaginator);
  readonly sort = viewChild(MatSort);

  // State
  private tasks = this.tasksService.tasks;
  private dueOptions = DUE_OPTIONS;
  private isNarrow = this.media.match(`(width < 80rem)`);
  private view = signal<View>('all');
  private search = signal('');
  private activeFilters = signal<Filter[]>([]);
  private selections = signal<Record<FilterId, string[]>>({
    state: [],
    assignee: [],
    project: [],
    priority: [],
  });
  private filterQuery = signal('');
  private dueFilter = signal(DUE_OPTIONS[4]);
  private panel = signal<TaskPanel | null>(null);
  private customizeOpen = signal(false);
  private newTaskOpen = signal(false);
  private columns = signal<Column[]>([...COLUMNS]);
  private dataSource = new MatTableDataSource<TaskItem>([]);
  private priorityOrder: ProjectPriority[] = [
    'low',
    'medium',
    'high',
    'urgent',
  ];

  // Computed state
  private columnIds = computed(() =>
    this.columns()
      .filter((column) => column.visible)
      .map((column) => column.id)
  );
  private availableFilters = computed(() =>
    FILTERS.filter((filter) => !this.activeFilters().includes(filter))
  );
  private hasFilters = computed(
    () => this.activeFilters().length > 0 || this.dueFilter() !== DUE_OPTIONS[4]
  );
  private filterOptions = computed<Record<FilterId, FilterOption[]>>(() => ({
    state: STATE_OPTIONS,
    assignee: [
      ...new Map(
        this.tasks().map((task) => [task.assignee.name, task.assignee])
      ).values(),
    ]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((person) => ({
        id: person.name,
        label: person.name,
        photo: person.photo,
      })),
    project: [
      ...new Map(
        this.tasks().map((task) => [task.project.id, task.project])
      ).values(),
    ]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((project) => ({ id: project.id, label: project.name })),
    priority: PRIORITY_OPTIONS,
  }));
  private filterResults = computed(
    () =>
      Object.fromEntries(
        Object.entries(this.filterOptions()).map(([id, options]) => [
          id,
          options.filter((option) =>
            option.label
              .toLowerCase()
              .includes(this.filterQuery().toLowerCase())
          ),
        ])
      ) as Record<FilterId, FilterOption[]>
  );
  private dataSourceFilter = computed<DataSourceFilter>(() => ({
    search: this.search().trim().toLowerCase(),
    mine: this.view() === 'mine',
    states: this.selections().state,
    assignees: this.selections().assignee,
    projects: this.selections().project,
    priorities: this.selections().priority,
    due: this.dueFilter().id,
  }));

  constructor() {
    this.dataSource.filterPredicate = (task, filter) => {
      const { search, mine, states, assignees, projects, priorities, due } =
        JSON.parse(filter) as DataSourceFilter;

      return (
        (!search ||
          task.title.toLowerCase().includes(search) ||
          task.key.toLowerCase().includes(search) ||
          task.project.name.toLowerCase().includes(search) ||
          task.assignee.name.toLowerCase().includes(search)) &&
        (!mine || task.assignee.name === CURRENT_USER) &&
        (!states.length || states.includes(task.state)) &&
        (!assignees.length || assignees.includes(task.assignee.name)) &&
        (!projects.length || projects.includes(task.project.id)) &&
        (!priorities.length || priorities.includes(task.priority)) &&
        this.isDue(task, due)
      );
    };

    this.dataSource.sortingDataAccessor = (task, id) => {
      if (id === 'task') {
        return task.title;
      }

      if (id === 'project') {
        return task.project.name;
      }

      if (id === 'assignee') {
        return task.assignee.name;
      }

      if (id === 'priority') {
        return this.priorityOrder.indexOf(task.priority);
      }

      return task[id as keyof TaskItem] as string;
    };

    afterNextRender(() => {
      this.dataSource.paginator = this.paginator() ?? null;
      this.dataSource.sort = this.sort() ?? null;
    });

    effect(() => {
      this.dataSource.data = this.tasks();
    });

    effect(() => {
      this.dataSource.filter = JSON.stringify(this.dataSourceFilter());
      this.paginator()?.firstPage();
    });
  }

  private isDue(task: TaskItem, due: Due) {
    switch (due) {
      case 'overdue':
        return this.isOverdue(task);
      case 'today':
        return isToday(task.dueDate);
      case 'week':
        return isThisWeek(task.dueDate);
      case 'later':
        return isAfter(task.dueDate, endOfWeek(new Date()));
      default:
        return true;
    }
  }

  private isOverdue(task: TaskItem) {
    return task.state !== 'done' && new Date(task.dueDate) < new Date();
  }

  private closePanel() {
    this.router.navigate(['/tasks']);
  }

  private addFilter(filter: Filter) {
    this.activeFilters.update((filters) => [...filters, filter]);
  }

  private removeFilter(filter: Filter) {
    this.activeFilters.update((filters) =>
      filters.filter((item) => item !== filter)
    );
    this.setSelection(filter, []);
  }

  private clearFilters() {
    this.activeFilters.set([]);
    this.selections.set({
      state: [],
      assignee: [],
      project: [],
      priority: [],
    });
    this.dueFilter.set(DUE_OPTIONS[4]);
  }

  private setSelection(filter: Filter, values: string[]) {
    this.selections.update((selections) => ({
      ...selections,
      [filter.id]: values,
    }));
  }

  private selectionLabel(filter: Filter) {
    const values = this.selections()[filter.id];

    if (values.length > 1) {
      return `${values.length} selected`;
    }

    return (
      this.filterOptions()[filter.id].find((option) => option.id === values[0])
        ?.label ?? 'Any'
    );
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

  private trackBy(_: number, item: TaskItem) {
    return item.id;
  }
}
