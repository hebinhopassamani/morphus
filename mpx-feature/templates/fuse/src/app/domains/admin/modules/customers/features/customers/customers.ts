import {
  CdkDrag,
  CdkDragDrop,
  CdkDragHandle,
  CdkDragPlaceholder,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import {
  CurrencyPipe,
  DatePipe,
  DecimalPipe,
  SlicePipe,
} from '@angular/common';
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
import { MatCard, MatCardContent } from '@angular/material/card';
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
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { add, isAfter } from 'date-fns';
import {
  CustomerItem,
  CustomersService,
  Segment,
} from '@/app/domains/admin/modules/customers/data/customers';
import { CustomersAddCustomer } from '@/app/domains/admin/modules/customers/features/customers/add-customer';
import { CustomerSegmentPill } from '@/app/domains/admin/modules/customers/ui/pills';
import { Column } from '@/app/domains/admin/modules/projects/data/projects';
import {
  BuiCombobox,
  BuiComboboxContent,
  BuiComboboxListbox,
  BuiComboboxOption,
  BuiComboboxOptionIndicator,
  BuiComboboxPortal,
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

type FilterId = 'segment' | 'location';

type Filter = {
  id: FilterId;
  label: string;
};

type FilterOption = {
  id: string;
  label: string;
};

type DateOption = {
  label: string;
  days: number | null;
};

type SortOption = {
  label: string;
  compare: (a: CustomerItem, b: CustomerItem) => number;
};

type Stat = {
  label: string;
  value: number;
  format: 'currency' | 'number' | 'percent';
  change: number;
  unit: string;
  positive: boolean;
};

type DataSourceFilter = {
  search: string;
  segments: string[];
  locations: string[];
  days: number | null;
};

const FILTERS: Filter[] = [
  {
    id: 'segment',
    label: 'Segment',
  },
  {
    id: 'location',
    label: 'Location',
  },
];

const FILTER_OPTIONS: Record<FilterId, FilterOption[]> = {
  segment: [
    {
      id: 'new',
      label: 'New',
    },
    {
      id: 'returning',
      label: 'Returning',
    },
    {
      id: 'vip',
      label: 'VIP',
    },
    {
      id: 'at-risk',
      label: 'At risk',
    },
  ],
  location: [
    {
      id: 'United States',
      label: 'United States',
    },
    {
      id: 'Canada',
      label: 'Canada',
    },
    {
      id: 'Germany',
      label: 'Germany',
    },
  ],
};

const DATE_OPTIONS: DateOption[] = [
  {
    label: 'Last 7 days',
    days: 7,
  },
  {
    label: 'Last 30 days',
    days: 30,
  },
  {
    label: 'Last 90 days',
    days: 90,
  },
  {
    label: 'Any time',
    days: null,
  },
];

const SORT_OPTIONS: SortOption[] = [
  {
    label: 'Recently active',
    compare: (a, b) => b.lastOrderAt.localeCompare(a.lastOrderAt),
  },
  {
    label: 'Highest spent',
    compare: (a, b) => b.spent - a.spent,
  },
  {
    label: 'Most orders',
    compare: (a, b) => b.orderCount - a.orderCount,
  },
  {
    label: 'Newest customers',
    compare: (a, b) => b.since.localeCompare(a.since),
  },
];

const COLUMNS: Column[] = [
  {
    id: 'customer',
    label: 'Customer',
    icon: 'user-round',
    visible: true,
    locked: true,
  },
  {
    id: 'segment',
    label: 'Segment',
    icon: 'tag',
    visible: true,
    locked: false,
  },
  {
    id: 'location',
    label: 'Location',
    icon: 'map-pin',
    visible: true,
    locked: false,
  },
  {
    id: 'orders',
    label: 'Orders',
    icon: 'shopping-bag',
    visible: true,
    locked: false,
  },
  {
    id: 'spent',
    label: 'Total spent',
    icon: 'circle-dollar-sign',
    visible: true,
    locked: false,
  },
  {
    id: 'lastOrderAt',
    label: 'Last order',
    icon: 'calendar',
    visible: true,
    locked: false,
  },
];

@Component({
  selector: 'customers',
  imports: [
    BuiCombobox,
    BuiComboboxContent,
    BuiComboboxListbox,
    BuiComboboxOption,
    BuiComboboxOptionIndicator,
    BuiComboboxPortal,
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
    CurrencyPipe,
    CustomerSegmentPill,
    CustomersAddCustomer,
    DatePipe,
    DecimalPipe,
    FormsModule,
    MatButton,
    MatCard,
    MatCardContent,
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
    MatSlideToggle,
    MatSuffix,
    MatTableModule,
    RouterLink,
    SlicePipe,
  ],
  template: `
    <div
      class="mx-auto flex w-full max-w-7xl flex-auto flex-col gap-4 p-6 sm:gap-6 lg:p-8"
    >
      <!-- Header -->
      <div class="flex items-center justify-between gap-x-3">
        <div class="flex flex-col gap-y-0.5">
          <div class="text-3xl font-semibold tracking-tighter">Customers</div>
          <div class="text-neutral-a11 sm:text-lg">
            {{ customers().length }} customers, {{ segmentCounts().vip }} VIPs
            and {{ segmentCounts()['at-risk'] }} at risk.
          </div>
        </div>

        <!-- Spacer -->
        <div class="flex-auto"></div>

        <!-- Actions -->
        <div class="flex shrink-0 items-center gap-x-3">
          <button
            matButton
            class="hidden sm:flex"
          >
            <mat-icon svgIcon="download" />
            Export
          </button>

          <button
            matButton
            class="primary hidden sm:flex"
            (click)="addCustomerOpen.set(true)"
          >
            <mat-icon svgIcon="plus" />
            Add customer
          </button>

          <!-- Mobile actions -->
          <button
            matIconButton
            class="sm:hidden"
            [matMenuTriggerFor]="actionsMenu"
          >
            <mat-icon svgIcon="ellipsis-vertical" />
          </button>
          <mat-menu #actionsMenu>
            <button
              mat-menu-item
              (click)="addCustomerOpen.set(true)"
            >
              <mat-icon svgIcon="plus" />
              Add customer
            </button>
            <mat-divider />
            <button mat-menu-item>
              <mat-icon svgIcon="download" />
              Export
            </button>
          </mat-menu>
        </div>
      </div>

      <!-- Stats -->
      <mat-card
        appearance="filled"
        class="@container"
      >
        <div class="grid grid-cols-2 gap-1 @3xl:grid-cols-4">
          @for (stat of stats(); track stat.label) {
            <mat-card-content class="flex min-w-0 flex-col">
              <div class="truncate text-neutral-a11">{{ stat.label }}</div>
              <div class="mt-1 text-2xl font-semibold tabular-nums">
                @switch (stat.format) {
                  @case ('currency') {
                    {{ stat.value | currency: 'USD' : 'symbol' : '1.0-0' }}
                  }
                  @case ('percent') {
                    {{ stat.value | number: '1.1-1' }}%
                  }
                  @default {
                    {{ stat.value }}
                  }
                }
              </div>
              <div class="mt-2 flex min-w-0 items-center gap-x-1">
                <mat-icon
                  class="size-4 shrink-0"
                  [class.text-green-11]="stat.positive"
                  [class.text-red-11]="!stat.positive"
                  [svgIcon]="stat.change < 0 ? 'arrow-down' : 'arrow-up'"
                />
                <div
                  class="flex min-w-0 items-center gap-x-1 text-sm font-medium text-neutral-a11"
                >
                  <div class="shrink-0 tabular-nums">
                    {{ stat.change > 0 ? '+' : ''
                    }}{{ stat.change | number: '1.0-1' }}{{ stat.unit }}
                  </div>
                  <div class="truncate">vs last month</div>
                </div>
              </div>
            </mat-card-content>
          }
        </div>
      </mat-card>

      <div class="flex flex-col gap-y-3">
        <!-- Search & Sort -->
        <div class="flex items-center gap-x-2">
          <!-- Search -->
          <mat-form-field class="w-full max-w-72">
            <mat-icon
              svgIcon="search"
              matIconPrefix
            />
            <input
              matInput
              placeholder="Search customers"
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

          <!-- Spacer -->
          <div class="flex-auto"></div>

          <!-- Sort -->
          <div
            buiCombobox
            class="w-fit"
            [value]="[sort()]"
            (valueChange)="sort.set($event[0] ?? sort())"
          >
            <button
              matButton
              buiComboboxTrigger
              id="customers-sort"
              class="min-h-8 max-sm:icon-only"
            >
              <mat-icon svgIcon="arrow-down-up" />
              {{ sort().label }}
              <mat-icon
                svgIcon="chevron-down"
                class="max-sm:hidden"
                iconPositionEnd
              />
            </button>
            <ng-template
              buiComboboxPortal
              position="bottom-end"
              matchWidth="false"
            >
              <div
                buiComboboxContent
                class="min-w-40"
              >
                <div
                  buiComboboxListbox
                  aria-labelledby="customers-sort"
                  focusMode="activedescendant"
                  selectionMode="explicit"
                >
                  @for (option of sortOptions; track option.label) {
                    <div
                      buiComboboxOption
                      [value]="option"
                      [label]="option.label"
                    >
                      <span class="flex-auto truncate">{{ option.label }}</span>
                      <span buiComboboxOptionIndicator></span>
                    </div>
                  }
                </div>
              </div>
            </ng-template>
          </div>
        </div>

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
                id="customers-date-filter"
              >
                <span class="font-medium">
                  Last order:
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
                    aria-labelledby="customers-date-filter"
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
              >
                <button
                  matButton
                  class="tertiary tiny hover:bg-neutral-a4"
                  buiComboboxTrigger
                  [id]="'customers-' + filter.id + '-filter'"
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
                    <div
                      buiComboboxListbox
                      [attr.aria-labelledby]="
                        'customers-' + filter.id + '-filter'
                      "
                      multi
                      focusMode="activedescendant"
                      selectionMode="explicit"
                    >
                      @for (
                        option of filterOptions[filter.id];
                        track option.id
                      ) {
                        <div
                          buiComboboxOption
                          [value]="option.id"
                          [label]="option.label"
                        >
                          <span class="flex-auto truncate">{{
                            option.label
                          }}</span>
                          <span buiComboboxOptionIndicator></span>
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
          <div class="relative isolate overflow-x-visible overflow-y-hidden">
            <table
              class="whitespace-nowrap"
              mat-table
              [dataSource]="dataSource"
              [trackBy]="trackBy"
            >
              <!-- Customer column -->
              <ng-container matColumnDef="customer">
                <th
                  mat-header-cell
                  *matHeaderCellDef
                >
                  Customer
                </th>
                <td
                  mat-cell
                  *matCellDef="let row"
                >
                  <div class="flex items-center gap-x-2.5 py-1.5">
                    <div
                      class="flex size-7 shrink-0 items-center justify-center rounded-full bg-neutral-a3 font-semibold text-neutral-a11"
                    >
                      {{ row.name | slice: 0 : 1 }}
                    </div>
                    <div class="flex flex-col">
                      <div class="font-medium">{{ row.name }}</div>
                      <div class="text-sm text-neutral-a11">
                        {{ row.email }}
                      </div>
                    </div>
                  </div>
                </td>
              </ng-container>

              <!-- Segment column -->
              <ng-container matColumnDef="segment">
                <th
                  mat-header-cell
                  *matHeaderCellDef
                >
                  Segment
                </th>
                <td
                  mat-cell
                  *matCellDef="let row"
                >
                  <customer-segment-pill [segment]="row.segment" />
                </td>
              </ng-container>

              <!-- Location column -->
              <ng-container matColumnDef="location">
                <th
                  mat-header-cell
                  *matHeaderCellDef
                >
                  Location
                </th>
                <td
                  mat-cell
                  *matCellDef="let row"
                >
                  <div class="flex flex-col">
                    <div>{{ row.address.city }}</div>
                    <div class="text-sm text-neutral-a11">
                      {{ row.address.country }}
                    </div>
                  </div>
                </td>
              </ng-container>

              <!-- Orders column -->
              <ng-container matColumnDef="orders">
                <th
                  class="w-24 text-end"
                  mat-header-cell
                  *matHeaderCellDef
                >
                  Orders
                </th>
                <td
                  class="text-end tabular-nums"
                  mat-cell
                  *matCellDef="let row"
                >
                  {{ row.orderCount }}
                </td>
              </ng-container>

              <!-- Total spent column -->
              <ng-container matColumnDef="spent">
                <th
                  class="w-32 text-end"
                  mat-header-cell
                  *matHeaderCellDef
                >
                  Total spent
                </th>
                <td
                  class="text-end font-medium tabular-nums"
                  mat-cell
                  *matCellDef="let row"
                >
                  {{ row.spent | currency: 'USD' : 'symbol' : '1.2-2' }}
                </td>
              </ng-container>

              <!-- Last order column -->
              <ng-container matColumnDef="lastOrderAt">
                <th
                  mat-header-cell
                  *matHeaderCellDef
                >
                  Last order
                </th>
                <td
                  class="tabular-nums"
                  mat-cell
                  *matCellDef="let row"
                >
                  {{ row.lastOrderAt | date: 'MMM d, y' }}
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
                        svgIcon="users"
                      />
                      <div class="text-center text-neutral-a11">
                        No customers match these filters.
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
                [routerLink]="row.id"
              ></tr>
            </table>
          </div>
          <mat-paginator
            class="p-2"
            [length]="customers().length"
            [pageSize]="25"
            [pageSizeOptions]="[10, 25, 50]"
          />
        </div>
      </div>
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

    <!-- Add customer -->
    <customers-add-customer [(open)]="addCustomerOpen" />
  `,
})
export default class Customers {
  // Dependencies
  private customersService = inject(CustomersService);

  // Queries
  readonly paginator = viewChild(MatPaginator);

  // State
  private customers = this.customersService.customers;
  private filterOptions = FILTER_OPTIONS;
  private dateOptions = DATE_OPTIONS;
  private sortOptions = SORT_OPTIONS;
  private search = signal('');
  private sort = signal(SORT_OPTIONS[0]);
  private activeFilters = signal<Filter[]>([]);
  private selections = signal<Record<FilterId, string[]>>({
    segment: [],
    location: [],
  });
  private dateFilter = signal(DATE_OPTIONS[3]);
  private customizeOpen = signal(false);
  private addCustomerOpen = signal(false);
  private columns = signal<Column[]>([...COLUMNS]);
  private dataSource = new MatTableDataSource<CustomerItem>([]);

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
    () =>
      this.activeFilters().length > 0 || this.dateFilter() !== DATE_OPTIONS[3]
  );
  private segmentCounts = computed(
    () =>
      Object.fromEntries(
        FILTER_OPTIONS.segment.map((option) => [
          option.id,
          this.customers().filter((customer) => customer.segment === option.id)
            .length,
        ])
      ) as Record<Segment, number>
  );
  private stats = computed<Stat[]>(() => {
    const now = new Date();
    const current = this.summarize(now);
    const previous = this.summarize(add(now, { days: -30 }));
    const growth = (key: 'customers' | 'lifetimeValue') =>
      ((current[key] - previous[key]) / previous[key]) * 100;

    return [
      {
        label: 'Total customers',
        value: current.customers,
        format: 'number',
        change: growth('customers'),
        unit: '%',
        positive: growth('customers') >= 0,
      },
      {
        label: 'New in the last 30 days',
        value: current.new,
        format: 'number',
        change: current.new - previous.new,
        unit: '',
        positive: current.new >= previous.new,
      },
      {
        label: 'Returning rate',
        value: current.returningRate,
        format: 'percent',
        change: current.returningRate - previous.returningRate,
        unit: ' pts',
        positive: current.returningRate >= previous.returningRate,
      },
      {
        label: 'Avg. lifetime value',
        value: current.lifetimeValue,
        format: 'currency',
        change: growth('lifetimeValue'),
        unit: '%',
        positive: growth('lifetimeValue') >= 0,
      },
    ];
  });
  private dataSourceFilter = computed<DataSourceFilter>(() => ({
    search: this.search().trim().toLowerCase(),
    segments: this.selections().segment,
    locations: this.selections().location,
    days: this.dateFilter().days,
  }));

  constructor() {
    this.dataSource.filterPredicate = (customer, filter) => {
      const { search, segments, locations, days } = JSON.parse(
        filter
      ) as DataSourceFilter;

      return (
        (!search ||
          customer.name.toLowerCase().includes(search) ||
          customer.email.includes(search)) &&
        (!segments.length || segments.includes(customer.segment)) &&
        (!locations.length || locations.includes(customer.address.country)) &&
        (!days ||
          isAfter(customer.lastOrderAt, add(new Date(), { days: -days })))
      );
    };

    afterNextRender(() => {
      this.dataSource.paginator = this.paginator() ?? null;
    });

    effect(() => {
      this.dataSource.data = [...this.customers()].sort(this.sort().compare);
    });

    effect(() => {
      this.dataSource.filter = JSON.stringify(this.dataSourceFilter());
      this.paginator()?.firstPage();
    });
  }

  private summarize(date: Date) {
    const start = add(date, { days: -30 });
    const customers = this.customers().filter(
      (customer) => !isAfter(customer.since, date)
    );
    const orders = this.customers()
      .flatMap((customer) => customer.orders)
      .filter((order) => !isAfter(order.placedAt, date));
    const buyers = new Set(
      orders
        .filter((order) => isAfter(order.placedAt, start))
        .map((order) => order.customer)
    );

    return {
      customers: customers.length,
      new: customers.filter((customer) => isAfter(customer.since, start))
        .length,
      returningRate:
        ([...buyers].filter((customer) => !isAfter(customer.since, start))
          .length /
          buyers.size) *
        100,
      // Over buyers only, earlier signups may not have ordered yet
      lifetimeValue:
        orders.reduce((sum, order) => sum + order.total - order.refunded, 0) /
        new Set(orders.map((order) => order.customer)).size,
    };
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
      segment: [],
      location: [],
    });
    this.dateFilter.set(DATE_OPTIONS[3]);
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
      FILTER_OPTIONS[filter.id].find((option) => option.id === values[0])
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

  private trackBy(_: number, item: CustomerItem) {
    return item.id;
  }
}
