import { SelectionModel } from '@angular/cdk/collections';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDragHandle,
  CdkDragPlaceholder,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { CurrencyPipe, DatePipe, SlicePipe } from '@angular/common';
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
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import {
  add,
  formatDistanceToNowStrict,
  isAfter,
  isWithinInterval,
} from 'date-fns';
import {
  Invoice,
  InvoicesService,
} from '@/app/domains/admin/modules/invoices/data/invoices';
import { InvoicesCreateInvoice } from '@/app/domains/admin/modules/invoices/features/invoices/create-invoice';
import { InvoiceStatusTag } from '@/app/domains/admin/modules/invoices/ui/tags';
import { Column } from '@/app/domains/admin/modules/projects/data/projects';
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

type FilterId = 'status' | 'customer';

type Filter = {
  id: FilterId;
  label: string;
  search?: string;
};

type FilterOption = {
  id: string;
  label: string;
};

type DateOption = {
  label: string;
  range: { start: number; end: number } | null;
};

type SortOption = {
  label: string;
  compare: (a: Invoice, b: Invoice) => number;
};

type Stat = {
  label: string;
  value: number;
  caption: string;
};

type DataSourceFilter = {
  search: string;
  statuses: string[];
  customers: string[];
  range: DateOption['range'];
};

const FILTERS: Filter[] = [
  {
    id: 'status',
    label: 'Status',
  },
  {
    id: 'customer',
    label: 'Customer',
    search: 'customers',
  },
];

const STATUS_OPTIONS: FilterOption[] = [
  {
    id: 'open',
    label: 'Open',
  },
  {
    id: 'partially-paid',
    label: 'Partially paid',
  },
  {
    id: 'overdue',
    label: 'Overdue',
  },
  {
    id: 'paid',
    label: 'Paid',
  },
  {
    id: 'refunded',
    label: 'Refunded',
  },
];

const DATE_OPTIONS: DateOption[] = [
  {
    label: 'Next 7 days',
    range: { start: 0, end: 7 },
  },
  {
    label: 'Last 7 days',
    range: { start: -7, end: 0 },
  },
  {
    label: 'Last 30 days',
    range: { start: -30, end: 0 },
  },
  {
    label: 'Any time',
    range: null,
  },
];

const SORT_OPTIONS: SortOption[] = [
  {
    label: 'Newest first',
    compare: (a, b) => b.issuedAt.localeCompare(a.issuedAt),
  },
  {
    label: 'Oldest first',
    compare: (a, b) => a.issuedAt.localeCompare(b.issuedAt),
  },
  {
    label: 'Due soonest',
    compare: (a, b) => a.dueAt.localeCompare(b.dueAt),
  },
  {
    label: 'Highest balance',
    compare: (a, b) => b.balance - a.balance,
  },
];

const COLUMNS: Column[] = [
  {
    id: 'id',
    label: 'Invoice',
    icon: 'hash',
    visible: true,
    locked: true,
  },
  {
    id: 'customer',
    label: 'Customer',
    icon: 'user-round',
    visible: true,
    locked: false,
  },
  {
    id: 'status',
    label: 'Status',
    icon: 'tag',
    visible: true,
    locked: false,
  },
  {
    id: 'issuedAt',
    label: 'Issued',
    icon: 'calendar',
    visible: true,
    locked: false,
  },
  {
    id: 'dueAt',
    label: 'Due',
    icon: 'calendar-clock',
    visible: true,
    locked: false,
  },
  {
    id: 'total',
    label: 'Amount',
    icon: 'circle-dollar-sign',
    visible: true,
    locked: false,
  },
  {
    id: 'balance',
    label: 'Balance due',
    icon: 'wallet',
    visible: true,
    locked: false,
  },
];

@Component({
  selector: 'invoices',
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
    CurrencyPipe,
    DatePipe,
    FormsModule,
    InvoiceStatusTag,
    InvoicesCreateInvoice,
    MatButton,
    MatCard,
    MatCardContent,
    MatCheckbox,
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
          <div class="text-3xl font-semibold tracking-tighter">Invoices</div>
          <div class="text-neutral-a11 sm:text-lg">
            {{ invoices().length }} invoices, {{ outstanding().length }}
            awaiting payment.
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
            (click)="createInvoiceOpen.set(true)"
          >
            <mat-icon svgIcon="plus" />
            Create invoice
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
              (click)="createInvoiceOpen.set(true)"
            >
              <mat-icon svgIcon="plus" />
              Create invoice
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
                {{ stat.value | currency: 'USD' : 'symbol' : '1.0-0' }}
              </div>
              <div
                class="mt-2 truncate text-sm font-medium text-neutral-a11 tabular-nums"
              >
                {{ stat.caption }}
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
              placeholder="Search invoices"
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
              id="invoices-sort"
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
                  aria-labelledby="invoices-sort"
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
                id="invoices-date-filter"
              >
                <span class="font-medium">
                  Due:
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
                    aria-labelledby="invoices-date-filter"
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
                  [id]="'invoices-' + filter.id + '-filter'"
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
                        'invoices-' + filter.id + '-filter'
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
                          <span class="flex-auto truncate">{{
                            option.label
                          }}</span>
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
          <div class="relative">
            <div class="relative isolate overflow-x-visible overflow-y-hidden">
              <table
                class="whitespace-nowrap"
                mat-table
                [dataSource]="dataSource"
                [trackBy]="trackBy"
              >
                <!-- Select column -->
                <ng-container matColumnDef="select">
                  <th
                    class="w-4"
                    mat-header-cell
                    *matHeaderCellDef
                  >
                    <mat-checkbox
                      [checked]="selection.hasValue() && isAllSelected()"
                      [indeterminate]="selection.hasValue() && !isAllSelected()"
                      (change)="toggleAllRows()"
                    />
                  </th>
                  <td
                    mat-cell
                    *matCellDef="let row"
                  >
                    <mat-checkbox
                      [checked]="selection.isSelected(row)"
                      (click)="$event.stopPropagation()"
                      (change)="selection.toggle(row)"
                    />
                  </td>
                </ng-container>

                <!-- Invoice column -->
                <ng-container matColumnDef="id">
                  <th
                    mat-header-cell
                    *matHeaderCellDef
                  >
                    Invoice
                  </th>
                  <td
                    class="font-medium tabular-nums"
                    mat-cell
                    *matCellDef="let row"
                  >
                    {{ row.id }}
                  </td>
                </ng-container>

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
                    <div class="flex items-center gap-x-2">
                      <div
                        class="flex size-6 shrink-0 items-center justify-center rounded-full bg-neutral-a3 font-semibold text-neutral-a11"
                      >
                        {{ row.customer.name | slice: 0 : 1 }}
                      </div>
                      {{ row.customer.name }}
                    </div>
                  </td>
                </ng-container>

                <!-- Status column -->
                <ng-container matColumnDef="status">
                  <th
                    mat-header-cell
                    *matHeaderCellDef
                  >
                    Status
                  </th>
                  <td
                    mat-cell
                    *matCellDef="let row"
                  >
                    <invoice-status-tag [status]="row.status" />
                  </td>
                </ng-container>

                <!-- Issued column -->
                <ng-container matColumnDef="issuedAt">
                  <th
                    mat-header-cell
                    *matHeaderCellDef
                  >
                    Issued
                  </th>
                  <td
                    class="tabular-nums"
                    mat-cell
                    *matCellDef="let row"
                  >
                    {{ row.issuedAt | date: 'MMM d, y' }}
                  </td>
                </ng-container>

                <!-- Due column -->
                <ng-container matColumnDef="dueAt">
                  <th
                    mat-header-cell
                    *matHeaderCellDef
                  >
                    Due
                  </th>
                  <td
                    class="tabular-nums"
                    mat-cell
                    *matCellDef="let row"
                  >
                    @if (row.status === 'overdue') {
                      <div class="flex flex-col py-1.5 text-red-a11">
                        <div>{{ row.dueAt | date: 'MMM d, y' }}</div>
                        <div class="text-sm">
                          {{ overdueBy(row.dueAt) }} overdue
                        </div>
                      </div>
                    } @else {
                      {{ row.dueAt | date: 'MMM d, y' }}
                    }
                  </td>
                </ng-container>

                <!-- Amount column -->
                <ng-container matColumnDef="total">
                  <th
                    class="w-32 text-end"
                    mat-header-cell
                    *matHeaderCellDef
                  >
                    Amount
                  </th>
                  <td
                    class="text-end tabular-nums"
                    mat-cell
                    *matCellDef="let row"
                  >
                    {{ row.total | currency: 'USD' : 'symbol' : '1.2-2' }}
                  </td>
                </ng-container>

                <!-- Balance due column -->
                <ng-container matColumnDef="balance">
                  <th
                    class="w-32 text-end"
                    mat-header-cell
                    *matHeaderCellDef
                  >
                    Balance due
                  </th>
                  <td
                    class="text-end font-medium tabular-nums"
                    mat-cell
                    *matCellDef="let row"
                  >
                    @if (row.balance) {
                      {{ row.balance | currency: 'USD' : 'symbol' : '1.2-2' }}
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
                          svgIcon="receipt-text"
                        />
                        <div class="text-center text-neutral-a11">
                          No invoices match these filters.
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
            <!-- Selection bar -->
            @if (selection.hasValue()) {
              <div
                class="absolute inset-x-0 top-0 flex h-10 items-center gap-x-2 border-t border-b border-neutral-a3 bg-neutral-2 ps-2 pe-1.5"
              >
                <div class="w-6">
                  <mat-checkbox
                    [checked]="isAllSelected()"
                    [indeterminate]="!isAllSelected()"
                    (change)="toggleAllRows()"
                  />
                </div>
                <div class="text-sm font-medium text-neutral-a10">
                  {{ selection.selected.length }} selected
                </div>
                <div class="ms-auto flex items-center gap-x-1.5">
                  <button
                    matButton
                    class="small"
                  >
                    <mat-icon svgIcon="send" />
                    Send reminder
                  </button>
                  <button
                    matButton
                    class="small"
                  >
                    <mat-icon svgIcon="download" />
                    Download
                  </button>
                  <button
                    matIconButton
                    class="small"
                    (click)="selection.clear()"
                  >
                    <mat-icon svgIcon="x" />
                  </button>
                </div>
              </div>
            }
          </div>
          <mat-paginator
            class="p-2"
            [length]="invoices().length"
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

    <!-- Create invoice -->
    <invoices-create-invoice [(open)]="createInvoiceOpen" />
  `,
})
export default class Invoices {
  // Dependencies
  private invoicesService = inject(InvoicesService);

  // Queries
  readonly paginator = viewChild(MatPaginator);

  // State
  private invoices = this.invoicesService.invoices;
  private dateOptions = DATE_OPTIONS;
  private sortOptions = SORT_OPTIONS;
  private search = signal('');
  private sort = signal(SORT_OPTIONS[0]);
  private activeFilters = signal<Filter[]>([]);
  private selections = signal<Record<FilterId, string[]>>({
    status: [],
    customer: [],
  });
  private filterQuery = signal('');
  private dateFilter = signal(DATE_OPTIONS[3]);
  private customizeOpen = signal(false);
  private createInvoiceOpen = signal(false);
  private columns = signal<Column[]>([...COLUMNS]);
  private dataSource = new MatTableDataSource<Invoice>([]);
  private selection = new SelectionModel<Invoice>(true, []);

  // Computed state
  private columnIds = computed(() => [
    'select',
    ...this.columns()
      .filter((column) => column.visible)
      .map((column) => column.id),
  ]);
  private availableFilters = computed(() =>
    FILTERS.filter((filter) => !this.activeFilters().includes(filter))
  );
  private hasFilters = computed(
    () =>
      this.activeFilters().length > 0 || this.dateFilter() !== DATE_OPTIONS[3]
  );
  private filterOptions = computed<Record<FilterId, FilterOption[]>>(() => ({
    status: STATUS_OPTIONS,
    customer: [
      ...new Map(
        this.invoices().map((invoice) => [
          invoice.customer.id,
          { id: invoice.customer.id, label: invoice.customer.name },
        ])
      ).values(),
    ].sort((a, b) => a.label.localeCompare(b.label)),
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
  private outstanding = computed(() =>
    this.invoices().filter(
      (invoice) => invoice.balance && invoice.status !== 'refunded'
    )
  );
  private stats = computed<Stat[]>(() => {
    const start = add(new Date(), { days: -30 });
    const overdue = this.outstanding().filter(
      (invoice) => invoice.status === 'overdue'
    );
    const issued = this.invoices().filter((invoice) =>
      isAfter(invoice.issuedAt, start)
    );
    const balance = (invoices: Invoice[]) =>
      invoices.reduce((sum, invoice) => sum + invoice.balance, 0);
    const count = (invoices: Invoice[]) =>
      `${invoices.length} ${invoices.length === 1 ? 'invoice' : 'invoices'}`;

    return [
      {
        label: 'Issued',
        value: issued.reduce((sum, invoice) => sum + invoice.total, 0),
        caption: count(issued),
      },
      {
        label: 'Paid',
        value: this.invoices()
          .flatMap((invoice) => invoice.payments)
          .filter(
            (payment) => payment.kind === 'sale' && isAfter(payment.date, start)
          )
          .reduce((sum, payment) => sum + payment.amount, 0),
        caption: 'Last 30 days',
      },
      {
        label: 'Outstanding',
        value: balance(this.outstanding()),
        caption: count(this.outstanding()),
      },
      {
        label: 'Overdue',
        value: balance(overdue),
        caption: count(overdue),
      },
    ];
  });
  private dataSourceFilter = computed<DataSourceFilter>(() => ({
    search: this.search().trim().toLowerCase(),
    statuses: this.selections().status,
    customers: this.selections().customer,
    range: this.dateFilter().range,
  }));

  constructor() {
    this.dataSource.filterPredicate = (invoice, filter) => {
      const { search, statuses, customers, range } = JSON.parse(
        filter
      ) as DataSourceFilter;

      return (
        (!search ||
          invoice.id.toLowerCase().includes(search) ||
          invoice.customer.name.toLowerCase().includes(search) ||
          invoice.customer.email.includes(search)) &&
        (!statuses.length || statuses.includes(invoice.status)) &&
        (!customers.length || customers.includes(invoice.customer.id)) &&
        (!range ||
          isWithinInterval(invoice.dueAt, {
            start: add(new Date(), { days: range.start }),
            end: add(new Date(), { days: range.end }),
          }))
      );
    };

    afterNextRender(() => {
      this.dataSource.paginator = this.paginator() ?? null;
    });

    effect(() => {
      this.dataSource.data = [...this.invoices()].sort(this.sort().compare);
    });

    effect(() => {
      this.dataSource.filter = JSON.stringify(this.dataSourceFilter());
      this.paginator()?.firstPage();
    });
  }

  private overdueBy(date: string) {
    return formatDistanceToNowStrict(date, { unit: 'day' });
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
      status: [],
      customer: [],
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
      this.filterOptions()[filter.id].find((option) => option.id === values[0])
        ?.label ?? 'Any'
    );
  }

  private isAllSelected() {
    return (
      this.selection.selected.length === this.dataSource.filteredData.length
    );
  }

  private toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.dataSource.filteredData.forEach((row) => this.selection.select(row));
    }
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

  private trackBy(_: number, item: Invoice) {
    return item.id;
  }
}
