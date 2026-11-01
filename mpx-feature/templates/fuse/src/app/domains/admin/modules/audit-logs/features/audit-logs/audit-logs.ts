import {
  CdkDrag,
  CdkDragDrop,
  CdkDragHandle,
  CdkDragPlaceholder,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { NgOptimizedImage, TitleCasePipe } from '@angular/common';
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
import { MatCheckbox } from '@angular/material/checkbox';
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
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { add, format, isAfter } from 'date-fns';
import {
  AuditLog,
  AuditLogsService,
  AuditLogTarget,
  Column,
} from '@/app/domains/admin/modules/audit-logs/data/audit-logs';
import { AuditLogsLogDetails } from '@/app/domains/admin/modules/audit-logs/features/audit-logs/log-details';
import { MembersService } from '@/app/domains/admin/modules/members/data/members';
import { ProjectsService } from '@/app/domains/admin/modules/projects/data/projects';
import { TeamsService } from '@/app/domains/admin/modules/teams/data/teams';
import {
  BuiAlert,
  BuiAlertContent,
  BuiAlertDescription,
  BuiAlertDismissButton,
  BuiAlertIcon,
  BuiAlertTitle,
} from '@/app/ui/alert';
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
  BuiPopover,
  BuiPopoverContent,
  BuiPopoverPortal,
  BuiPopoverTrigger,
} from '@/app/ui/popover';

type FilterId = 'category' | 'actor' | 'status';

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

type DateOption = {
  days: number | null;
  label: string;
};

type DataSourceFilter = {
  search: string;
  categories: string[];
  actors: string[];
  statuses: string[];
  days: number | null;
};

const FILTERS: Filter[] = [
  {
    id: 'category',
    label: 'Category',
  },
  {
    id: 'actor',
    label: 'Actor',
    search: 'actors',
  },
  {
    id: 'status',
    label: 'Status',
  },
];

const CATEGORY_OPTIONS: FilterOption[] = [
  {
    id: 'authentication',
    label: 'Authentication',
  },
  {
    id: 'members',
    label: 'Members',
  },
  {
    id: 'projects',
    label: 'Projects',
  },
  {
    id: 'teams',
    label: 'Teams',
  },
  {
    id: 'billing',
    label: 'Billing',
  },
  {
    id: 'security',
    label: 'Security',
  },
];

const CATEGORY_ICONS: Record<string, string> = {
  authentication: 'log-in',
  members: 'user-round',
  projects: 'folder-kanban',
  teams: 'users-round',
  billing: 'credit-card',
  security: 'shield',
};

const STATUS_OPTIONS: FilterOption[] = [
  {
    id: 'success',
    label: 'Success',
  },
  {
    id: 'failure',
    label: 'Failure',
  },
];

const DATE_OPTIONS: DateOption[] = [
  {
    days: 1,
    label: 'Last 24 hours',
  },
  {
    days: 7,
    label: 'Last 7 days',
  },
  {
    days: 30,
    label: 'Last 30 days',
  },
  {
    days: 90,
    label: 'Last 90 days',
  },
  {
    days: null,
    label: 'All time',
  },
];

const COLUMNS: Column[] = [
  {
    id: 'event',
    label: 'Event',
    visible: true,
    locked: true,
  },
  {
    id: 'actor',
    label: 'Actor',
    visible: true,
    locked: false,
  },
  {
    id: 'category',
    label: 'Category',
    visible: true,
    locked: false,
  },
  {
    id: 'status',
    label: 'Status',
    visible: true,
    locked: false,
  },
  {
    id: 'date',
    label: 'Date',
    visible: true,
    locked: false,
  },
  {
    id: 'ipAddress',
    label: 'IP address',
    visible: true,
    locked: false,
  },
];

@Component({
  selector: 'audit-logs',
  imports: [
    AuditLogsLogDetails,
    BuiAlert,
    BuiAlertContent,
    BuiAlertDescription,
    BuiAlertDismissButton,
    BuiAlertIcon,
    BuiAlertTitle,
    BuiCombobox,
    BuiComboboxContent,
    BuiComboboxEmpty,
    BuiComboboxListbox,
    BuiComboboxOption,
    BuiComboboxOptionIndicator,
    BuiComboboxPortal,
    BuiComboboxSearch,
    BuiComboboxTrigger,
    BuiPopover,
    BuiPopoverContent,
    BuiPopoverPortal,
    BuiPopoverTrigger,
    CdkDrag,
    CdkDragHandle,
    CdkDragPlaceholder,
    CdkDropList,
    FormsModule,
    MatButton,
    MatCheckbox,
    MatDivider,
    MatIcon,
    MatIconButton,
    MatPaginator,
    MatSort,
    MatSortHeader,
    MatTableModule,
    NgOptimizedImage,
    TitleCasePipe,
    MatFormField,
    MatInput,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    MatPrefix,
    MatSuffix,
  ],
  template: `
    <div
      class="mx-auto flex w-full max-w-7xl flex-auto flex-col gap-4 p-6 sm:gap-6 lg:p-8"
    >
      <!-- Header -->
      <div class="flex items-center justify-between gap-x-3">
        <div class="flex flex-col gap-y-0.5">
          <div class="text-3xl font-semibold tracking-tighter">Audit logs</div>
          <div class="text-neutral-a11 sm:text-lg">
            Who did what in the workspace, and when.
          </div>
        </div>

        <!-- Spacer -->
        <div class="flex-auto"></div>

        <!-- Actions -->
        <div class="flex shrink-0 items-center gap-x-3">
          <button matButton>
            <mat-icon svgIcon="download" />
            Export
          </button>
        </div>
      </div>

      <!-- Retention alert -->
      @if (!retentionAlertDismissed()) {
        <div
          buiAlert
          tone="info"
          [(dismissed)]="retentionAlertDismissed"
        >
          <mat-icon
            buiAlertIcon
            svgIcon="info"
          />
          <div buiAlertContent>
            <div buiAlertTitle>Logs are kept for 180 days</div>
            <div buiAlertDescription>
              Older entries are archived automatically. Export them if you need
              to keep a copy.
            </div>
          </div>
          <button
            matIconButton
            buiAlertDismissButton
          >
            <mat-icon svgIcon="x" />
          </button>
        </div>
      }

      <div class="flex flex-col gap-y-3">
        <!-- Search -->
        <mat-form-field class="w-full max-w-72">
          <mat-icon
            svgIcon="search"
            matIconPrefix
          />
          <input
            matInput
            placeholder="Search events"
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

        <!-- Filters -->
        <div
          class="flex flex-wrap items-center gap-2 border-t border-neutral-a4 pt-3"
        >
          <div class="flex items-center rounded-lg bg-neutral-a3">
            <div
              buiCombobox
              class="w-fit"
              [value]="[dateFilter()]"
              (valueChange)="dateFilter.set($event[0] ?? dateFilter())"
            >
              <button
                matButton
                class="tertiary tiny hover:bg-neutral-a4"
                buiComboboxTrigger
                id="audit-logs-date-filter"
              >
                <span class="font-medium">
                  Date:
                  <span class="font-normal">{{ dateFilter().label }}</span>
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
                    aria-labelledby="audit-logs-date-filter"
                    focusMode="activedescendant"
                    selectionMode="explicit"
                  >
                    @for (option of dateOptions; track option.label) {
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
                  [id]="'audit-logs-' + filter.id + '-filter'"
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
                        'audit-logs-' + filter.id + '-filter'
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
                        <div buiComboboxEmpty>No {{ filter.search }} found</div>
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
          <div
            class="ms-auto"
            #customizeAnchor
          >
            <div
              buiPopover
              class="w-40"
              position="bottom-end"
              [anchor]="customizeAnchor"
              [hasBackdrop]="false"
            >
              <button
                matButton
                buiPopoverTrigger
                class="tertiary hidden sm:flex"
              >
                <mat-icon svgIcon="settings-2" />
                Customize
              </button>
              <button
                matIconButton
                buiPopoverTrigger
                class="sm:hidden"
              >
                <mat-icon svgIcon="settings-2" />
              </button>
              <ng-template buiPopoverPortal>
                <div
                  buiPopoverContent
                  class="gap-y-0 p-1"
                >
                  <div class="px-2 py-1 font-medium">Columns</div>
                  <div
                    class="mt-1 flex flex-col gap-y-1"
                    cdkDropList
                    (cdkDropListDropped)="drop($event)"
                  >
                    @for (column of columns(); track column.id) {
                      <div
                        class="flex items-center gap-x-2 px-2 py-1"
                        cdkDrag
                        cdkDragLockAxis="y"
                        cdkDragPreviewContainer="parent"
                        [cdkDragPreviewClass]="[
                          'bg-neutral-3',
                          'dark:bg-neutral-3',
                          'shadow',
                          'rounded',
                        ]"
                      >
                        <mat-checkbox
                          class="select-none"
                          [checked]="column.visible"
                          [disabled]="column.locked"
                          (click)="toggleVisibility(column)"
                        >
                          {{ column.label }}
                        </mat-checkbox>

                        <div class="flex flex-auto justify-end">
                          <mat-icon
                            cdkDragHandle
                            class="size-4 cursor-grab"
                            svgIcon="grip-vertical"
                          />
                        </div>

                        <div
                          *cdkDragPlaceholder
                          class="h-7 rounded-md bg-neutral-a3"
                        ></div>
                      </div>
                    } @empty {
                      <div class="text-sm text-neutral-a9">
                        No columns to customize
                      </div>
                    }
                  </div>
                </div>
              </ng-template>
            </div>
          </div>
        </div>

        <!-- Table -->
        <div class="flex flex-col">
          <div class="relative isolate overflow-x-visible overflow-y-hidden">
            <table
              class="whitespace-nowrap"
              mat-table
              [dataSource]="dataSource"
              [trackBy]="trackBy"
              matSort
              matSortActive="date"
              matSortDirection="desc"
            >
              <!-- Event column -->
              <ng-container matColumnDef="event">
                <th
                  mat-header-cell
                  *matHeaderCellDef
                  mat-sort-header
                >
                  Event
                </th>
                <td
                  mat-cell
                  *matCellDef="let row"
                >
                  <div class="flex items-center gap-x-2.5">
                    <mat-icon
                      class="size-4 shrink-0 text-neutral-a11"
                      [svgIcon]="categoryIcons[row.category]"
                    />
                    {{ event(row) }}
                  </div>
                </td>
              </ng-container>

              <!-- Actor column -->
              <ng-container matColumnDef="actor">
                <th
                  mat-header-cell
                  *matHeaderCellDef
                  mat-sort-header
                >
                  Actor
                </th>
                <td
                  mat-cell
                  *matCellDef="let row"
                >
                  <div class="flex items-center gap-x-2.5">
                    @switch (row.actor.type) {
                      @case ('member') {
                        @if (members()[row.actor.id]; as member) {
                          <img
                            class="shrink-0 rounded-full object-cover"
                            width="24"
                            height="24"
                            [ngSrc]="member.photo"
                            [alt]="member.name"
                          />
                          {{ member.name }}
                        }
                      }
                      @case ('system') {
                        <div
                          class="flex size-6 shrink-0 items-center justify-center rounded-full bg-neutral-a3"
                        >
                          <mat-icon
                            class="size-3.5"
                            svgIcon="server"
                          />
                        </div>
                        System
                      }
                      @case ('api-key') {
                        <div
                          class="flex size-6 shrink-0 items-center justify-center rounded-full bg-neutral-a3"
                        >
                          <mat-icon
                            class="size-3.5"
                            svgIcon="key-round"
                          />
                        </div>
                        {{ row.actor.name }}
                      }
                    }
                  </div>
                </td>
              </ng-container>

              <!-- Category column -->
              <ng-container matColumnDef="category">
                <th
                  mat-header-cell
                  *matHeaderCellDef
                  mat-sort-header
                >
                  Category
                </th>
                <td
                  mat-cell
                  *matCellDef="let row"
                >
                  <div
                    class="inline-flex items-center rounded-lg bg-neutral-a3 px-2 py-0.5 text-sm font-medium text-neutral-a11"
                  >
                    {{ row.category | titlecase }}
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
                  Status
                </th>
                <td
                  mat-cell
                  *matCellDef="let row"
                >
                  <div class="inline-flex items-center gap-x-1.5">
                    <div
                      class="size-1.5 rounded-full"
                      [class.bg-jade-9]="row.status === 'success'"
                      [class.bg-red-9]="row.status === 'failure'"
                    ></div>
                    {{ row.status | titlecase }}
                  </div>
                </td>
              </ng-container>

              <!-- Date column -->
              <ng-container matColumnDef="date">
                <th
                  mat-header-cell
                  *matHeaderCellDef
                  mat-sort-header
                >
                  Date
                </th>
                <td
                  mat-cell
                  *matCellDef="let row"
                >
                  {{ formatDate(row.date) }}
                </td>
              </ng-container>

              <!-- IP address column -->
              <ng-container matColumnDef="ipAddress">
                <th
                  mat-header-cell
                  *matHeaderCellDef
                  mat-sort-header
                >
                  IP address
                </th>
                <td
                  mat-cell
                  *matCellDef="let row"
                >
                  @if (row.request) {
                    {{ row.request.ipAddress }}
                  } @else {
                    <span class="text-neutral-a8">—</span>
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
                        svgIcon="scroll-text"
                      />
                      <div class="text-center text-neutral-a11">
                        No logs match this view.
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
                (click)="selectedLog.set(row)"
              ></tr>
            </table>
          </div>
          <mat-paginator
            class="p-2"
            [length]="logs().length"
            [pageSize]="20"
            [pageSizeOptions]="[10, 20, 50]"
          />
        </div>
      </div>
    </div>

    <!-- Log details -->
    <audit-logs-log-details [(log)]="selectedLog" />
  `,
})
export default class AuditLogs {
  // Dependencies
  private auditLogsService = inject(AuditLogsService);
  private membersService = inject(MembersService);
  private projectsService = inject(ProjectsService);
  private teamsService = inject(TeamsService);

  // Queries
  readonly paginator = viewChild(MatPaginator);
  readonly sort = viewChild(MatSort);

  // State
  private logs = this.auditLogsService.logs;
  private categoryIcons = CATEGORY_ICONS;
  private dateOptions = DATE_OPTIONS;
  private search = signal('');
  private activeFilters = signal<Filter[]>([]);
  private selections = signal<Record<FilterId, string[]>>({
    category: [],
    actor: [],
    status: [],
  });
  private filterQuery = signal('');
  private dateFilter = signal(DATE_OPTIONS[4]);
  private retentionAlertDismissed = signal(false);
  private selectedLog = signal<AuditLog | null>(null);
  private columns = signal<Column[]>([...COLUMNS]);
  private dataSource = new MatTableDataSource<AuditLog>([]);

  // Computed state
  private columnIds = computed(() =>
    this.columns()
      .filter((column) => column.visible)
      .map((column) => column.id)
  );
  private members = computed(() =>
    Object.fromEntries(
      this.membersService.members().map((member) => [member.id, member])
    )
  );
  private availableFilters = computed(() =>
    FILTERS.filter((filter) => !this.activeFilters().includes(filter))
  );
  private hasFilters = computed(
    () =>
      this.activeFilters().length > 0 || this.dateFilter() !== DATE_OPTIONS[4]
  );
  private filterOptions = computed<Record<FilterId, FilterOption[]>>(() => ({
    category: CATEGORY_OPTIONS,
    actor: this.membersService
      .members()
      .filter((member) =>
        this.logs().some(
          (log) => log.actor.type === 'member' && log.actor.id === member.id
        )
      )
      .map((member) => ({
        id: member.id,
        label: member.name,
        photo: member.photo,
      })),
    status: STATUS_OPTIONS,
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
    categories: this.selections().category,
    actors: this.selections().actor,
    statuses: this.selections().status,
    days: this.dateFilter().days,
  }));

  constructor() {
    this.dataSource.filterPredicate = (log, filter) => {
      const { search, categories, actors, statuses, days } = JSON.parse(
        filter
      ) as DataSourceFilter;

      return (
        (!search || this.event(log).toLowerCase().includes(search)) &&
        (!categories.length || categories.includes(log.category)) &&
        (!actors.length ||
          (log.actor.type === 'member' && actors.includes(log.actor.id))) &&
        (!statuses.length || statuses.includes(log.status)) &&
        (!days || isAfter(log.date, add(new Date(), { days: -days })))
      );
    };

    this.dataSource.sortingDataAccessor = (log, id) => {
      if (id === 'event') {
        return this.event(log);
      }

      if (id === 'actor') {
        return log.actor.type === 'member'
          ? this.members()[log.actor.id].name
          : log.actor.type === 'system'
            ? 'System'
            : log.actor.name;
      }

      if (id === 'ipAddress') {
        return log.request?.ipAddress ?? '';
      }

      return log[id as keyof AuditLog] as string;
    };

    afterNextRender(() => {
      this.dataSource.paginator = this.paginator() ?? null;
      this.dataSource.sort = this.sort() ?? null;
    });

    effect(() => {
      this.dataSource.data = this.logs();
    });

    effect(() => {
      this.dataSource.filter = JSON.stringify(this.dataSourceFilter());
      this.paginator()?.firstPage();
    });
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
      category: [],
      actor: [],
      status: [],
    });
    this.dateFilter.set(DATE_OPTIONS[4]);
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
    return format(date, 'MMM d, h:mm a');
  }

  private trackBy(_: number, item: AuditLog) {
    return item.id;
  }
}
