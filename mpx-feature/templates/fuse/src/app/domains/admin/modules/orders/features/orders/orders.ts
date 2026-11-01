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
  MatLabel,
  MatPrefix,
  MatSuffix,
} from '@angular/material/input';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatPaginator } from '@angular/material/paginator';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import {
  MatTable,
  MatTableDataSource,
  MatTableModule,
} from '@angular/material/table';
import { MatTabLink, MatTabNav, MatTabNavPanel } from '@angular/material/tabs';
import { RouterLink } from '@angular/router';
import { add, isAfter } from 'date-fns';
import {
  Order,
  OrdersService,
} from '@/app/domains/admin/modules/orders/data/orders';
import { OrdersCreateOrder } from '@/app/domains/admin/modules/orders/features/orders/create-order';
import {
  OrderChannelPill,
  OrderItemStatusPill,
} from '@/app/domains/admin/modules/orders/ui/pills';
import {
  OrderFulfillmentTag,
  OrderPaymentTag,
} from '@/app/domains/admin/modules/orders/ui/tags';
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
  BuiPopover,
  BuiPopoverClose,
  BuiPopoverContent,
  BuiPopoverPortal,
  BuiPopoverTrigger,
} from '@/app/ui/popover';
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

type View = 'all' | 'unfulfilled' | 'unpaid' | 'returns' | 'flagged';

type ViewOption = {
  id: View;
  label: string;
  icon: string;
};

type FilterId = 'fulfillment' | 'payment' | 'channel';

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
  compare: (a: Order, b: Order) => number;
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
  view: View;
  fulfillments: string[];
  payments: string[];
  channels: string[];
  days: number | null;
};

const VIEW_OPTIONS: ViewOption[] = [
  {
    id: 'all',
    label: 'All',
    icon: 'shopping-cart',
  },
  {
    id: 'unfulfilled',
    label: 'Unfulfilled',
    icon: 'package',
  },
  {
    id: 'unpaid',
    label: 'Unpaid',
    icon: 'credit-card',
  },
  {
    id: 'returns',
    label: 'Returns',
    icon: 'undo-2',
  },
  {
    id: 'flagged',
    label: 'Flagged',
    icon: 'triangle-alert',
  },
];

const FILTERS: Filter[] = [
  {
    id: 'fulfillment',
    label: 'Fulfillment',
  },
  {
    id: 'payment',
    label: 'Payment',
  },
  {
    id: 'channel',
    label: 'Channel',
  },
];

const FILTER_OPTIONS: Record<FilterId, FilterOption[]> = {
  fulfillment: [
    {
      id: 'unfulfilled',
      label: 'Unfulfilled',
    },
    {
      id: 'partially-fulfilled',
      label: 'Partially fulfilled',
    },
    {
      id: 'fulfilled',
      label: 'Fulfilled',
    },
    {
      id: 'returned',
      label: 'Returned',
    },
  ],
  payment: [
    {
      id: 'paid',
      label: 'Paid',
    },
    {
      id: 'partially-paid',
      label: 'Partially paid',
    },
    {
      id: 'unpaid',
      label: 'Unpaid',
    },
    {
      id: 'refunded',
      label: 'Refunded',
    },
  ],
  channel: [
    {
      id: 'online',
      label: 'Online store',
    },
    {
      id: 'pos',
      label: 'Point of sale',
    },
    {
      id: 'marketplace',
      label: 'Marketplace',
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
    label: 'All time',
    days: null,
  },
];

const SORT_OPTIONS: SortOption[] = [
  {
    label: 'Newest first',
    compare: (a, b) => b.placedAt.localeCompare(a.placedAt),
  },
  {
    label: 'Oldest first',
    compare: (a, b) => a.placedAt.localeCompare(b.placedAt),
  },
  {
    label: 'Highest total',
    compare: (a, b) => b.total - a.total,
  },
  {
    label: 'Lowest total',
    compare: (a, b) => a.total - b.total,
  },
];

const COLUMNS: Column[] = [
  {
    id: 'order',
    label: 'Order',
    icon: 'hash',
    visible: true,
    locked: true,
  },
  {
    id: 'placedAt',
    label: 'Date',
    icon: 'calendar',
    visible: true,
    locked: false,
  },
  {
    id: 'customer',
    label: 'Customer',
    icon: 'user-round',
    visible: true,
    locked: false,
  },
  {
    id: 'channel',
    label: 'Channel',
    icon: 'store',
    visible: true,
    locked: false,
  },
  {
    id: 'payment',
    label: 'Payment',
    icon: 'credit-card',
    visible: true,
    locked: false,
  },
  {
    id: 'fulfillment',
    label: 'Fulfillment',
    icon: 'package',
    visible: true,
    locked: false,
  },
  {
    id: 'items',
    label: 'Items',
    icon: 'box',
    visible: true,
    locked: false,
  },
  {
    id: 'total',
    label: 'Total',
    icon: 'circle-dollar-sign',
    visible: true,
    locked: false,
  },
];

@Component({
  selector: 'orders',
  imports: [
    BuiCombobox,
    BuiComboboxContent,
    BuiComboboxListbox,
    BuiComboboxOption,
    BuiComboboxOptionIndicator,
    BuiComboboxPortal,
    BuiComboboxTrigger,
    BuiPopover,
    BuiPopoverClose,
    BuiPopoverContent,
    BuiPopoverPortal,
    BuiPopoverTrigger,
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
    MatLabel,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    MatPaginator,
    MatPrefix,
    MatSlideToggle,
    MatSuffix,
    MatTableModule,
    MatTabLink,
    MatTabNav,
    MatTabNavPanel,
    OrderChannelPill,
    OrderFulfillmentTag,
    OrderItemStatusPill,
    OrderPaymentTag,
    OrdersCreateOrder,
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
          <div class="text-3xl font-semibold tracking-tighter">Orders</div>
          <div class="text-neutral-a11 sm:text-lg">
            {{ orders().length }} orders,
            {{ viewCounts().unfulfilled }} awaiting fulfillment and
            {{ viewCounts().unpaid }} awaiting payment.
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
            (click)="createOrderOpen.set(true)"
          >
            <mat-icon svgIcon="plus" />
            Create order
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
              (click)="createOrderOpen.set(true)"
            >
              <mat-icon svgIcon="plus" />
              Create order
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
                    }}{{ stat.change | number: '1.1-1' }}{{ stat.unit }}
                  </div>
                  <div class="truncate">vs prior 30 days</div>
                </div>
              </div>
            </mat-card-content>
          }
        </div>
      </mat-card>

      <div class="flex flex-col">
        <!-- Views -->
        <nav
          mat-tab-nav-bar
          [tabPanel]="tabPanel"
          [mat-stretch-tabs]="false"
          ngSkipHydration
        >
          @for (option of viewOptions; track option.id) {
            <button
              mat-tab-link
              [active]="view() === option.id"
              (click)="view.set(option.id)"
            >
              <mat-icon
                class="size-4 text-current"
                [svgIcon]="option.icon"
              />
              <span class="ms-2">{{ option.label }}</span>
              <span
                class="ms-2 rounded-sm bg-neutral-a3 px-1.5 py-px text-xs font-medium text-neutral-a11 tabular-nums"
              >
                {{ viewCounts()[option.id] }}
              </span>
            </button>
          }
        </nav>

        <mat-tab-nav-panel
          class="flex flex-col gap-y-3 pt-4"
          #tabPanel
        >
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
                placeholder="Search orders"
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
                id="orders-sort"
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
                    aria-labelledby="orders-sort"
                    focusMode="activedescendant"
                    selectionMode="explicit"
                  >
                    @for (option of sortOptions; track option.label) {
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
                  id="orders-date-filter"
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
                      aria-labelledby="orders-date-filter"
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
                    [id]="'orders-' + filter.id + '-filter'"
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
                          'orders-' + filter.id + '-filter'
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
              <div
                buiPopover
                class="w-72"
                position="bottom-start"
              >
                <button
                  matButton
                  class="tiny"
                  buiPopoverTrigger
                >
                  <mat-icon svgIcon="bookmark-plus" />
                  Save view
                </button>
                <ng-template buiPopoverPortal>
                  <div
                    buiPopoverContent
                    class="gap-y-4"
                  >
                    <mat-form-field class="w-full">
                      <mat-label>Name</mat-label>
                      <input
                        matInput
                        placeholder="Unfulfilled this week"
                      />
                    </mat-form-field>
                    <div class="flex justify-end gap-x-2">
                      <button
                        matButton
                        class="small"
                        buiPopoverClose
                      >
                        Cancel
                      </button>
                      <button
                        matButton
                        class="primary small"
                        buiPopoverClose
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </ng-template>
              </div>
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
                multiTemplateDataRows
              >
                <!-- Order column -->
                <ng-container matColumnDef="order">
                  <th
                    mat-header-cell
                    *matHeaderCellDef
                  >
                    Order
                  </th>
                  <td
                    mat-cell
                    *matCellDef="let row"
                  >
                    <div class="flex items-center gap-x-1.5">
                      <a
                        class="font-medium tabular-nums hover:underline"
                        [routerLink]="row.id"
                        (click)="$event.stopPropagation()"
                      >
                        #{{ row.id }}
                      </a>
                      @if (row.flagged) {
                        <mat-icon
                          class="size-4 text-red-a11"
                          svgIcon="triangle-alert"
                        />
                      }
                    </div>
                  </td>
                </ng-container>

                <!-- Date column -->
                <ng-container matColumnDef="placedAt">
                  <th
                    mat-header-cell
                    *matHeaderCellDef
                  >
                    Date
                  </th>
                  <td
                    class="tabular-nums"
                    mat-cell
                    *matCellDef="let row"
                  >
                    {{ row.placedAt | date: 'MMM d, h:mm a' }}
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

                <!-- Channel column -->
                <ng-container matColumnDef="channel">
                  <th
                    mat-header-cell
                    *matHeaderCellDef
                  >
                    Channel
                  </th>
                  <td
                    mat-cell
                    *matCellDef="let row"
                  >
                    <order-channel-pill [channel]="row.channel" />
                  </td>
                </ng-container>

                <!-- Payment column -->
                <ng-container matColumnDef="payment">
                  <th
                    mat-header-cell
                    *matHeaderCellDef
                  >
                    Payment
                  </th>
                  <td
                    mat-cell
                    *matCellDef="let row"
                  >
                    <order-payment-tag [status]="row.payment" />
                  </td>
                </ng-container>

                <!-- Fulfillment column -->
                <ng-container matColumnDef="fulfillment">
                  <th
                    class="w-40"
                    mat-header-cell
                    *matHeaderCellDef
                  >
                    Fulfillment
                  </th>
                  <td
                    mat-cell
                    *matCellDef="let row"
                  >
                    <order-fulfillment-tag [status]="row.fulfillment" />
                  </td>
                </ng-container>

                <!-- Items column -->
                <ng-container matColumnDef="items">
                  <th
                    class="w-20 text-end"
                    mat-header-cell
                    *matHeaderCellDef
                  >
                    Items
                  </th>
                  <td
                    class="text-end tabular-nums"
                    mat-cell
                    *matCellDef="let row"
                  >
                    {{ row.itemCount }}
                  </td>
                </ng-container>

                <!-- Total column -->
                <ng-container matColumnDef="total">
                  <th
                    class="w-28 text-end"
                    mat-header-cell
                    *matHeaderCellDef
                  >
                    Total
                  </th>
                  <td
                    class="text-end font-medium tabular-nums"
                    mat-cell
                    *matCellDef="let row"
                  >
                    {{ row.total | currency: 'USD' : 'symbol' : '1.2-2' }}
                  </td>
                </ng-container>

                <!-- Expand column -->
                <ng-container matColumnDef="expand">
                  <th
                    class="w-12"
                    mat-header-cell
                    *matHeaderCellDef
                  ></th>
                  <td
                    mat-cell
                    *matCellDef="let row"
                  >
                    <div class="flex items-center justify-center">
                      <mat-icon
                        class="size-4"
                        svgIcon="chevron-right"
                        [class.rotate-90]="expanded() === row.id"
                      />
                    </div>
                  </td>
                </ng-container>

                <!-- Detail column -->
                <ng-container matColumnDef="detail">
                  <td
                    class="whitespace-normal"
                    mat-cell
                    *matCellDef="let row"
                    [attr.colspan]="columnIds().length"
                  >
                    <!-- Cancel cell padding so line slots match the column geometry -->
                    <div
                      class="-mx-(--table-cell-padding-x) flex flex-col gap-4 py-4"
                    >
                      <!-- Items -->
                      <div class="flex flex-col">
                        @for (item of row.items; track item.sku) {
                          <div class="flex items-center py-2">
                            <div
                              class="flex min-w-0 flex-auto items-center gap-x-3 px-(--table-cell-padding-x)"
                            >
                              <div
                                class="flex size-9 shrink-0 items-center justify-center rounded-md bg-neutral-a3 text-neutral-a11"
                              >
                                <mat-icon
                                  class="size-4"
                                  [svgIcon]="item.icon"
                                />
                              </div>
                              <div class="flex min-w-0 flex-col">
                                <div class="truncate font-medium">
                                  {{ item.name }}
                                </div>
                                <div class="truncate text-sm text-neutral-a11">
                                  {{ item.variant }} · {{ item.sku }} ·
                                  {{
                                    item.price
                                      | currency: 'USD' : 'symbol' : '1.2-2'
                                  }}
                                  each
                                </div>
                              </div>
                            </div>
                            <div
                              class="w-40 shrink-0 px-(--table-cell-padding-x)"
                            >
                              <order-item-status-pill [status]="item.status" />
                            </div>
                            <div
                              class="w-20 shrink-0 px-(--table-cell-padding-x) text-end text-neutral-a11 tabular-nums"
                            >
                              {{ item.quantity }}
                            </div>
                            <div
                              class="w-28 shrink-0 px-(--table-cell-padding-x) text-end font-medium tabular-nums"
                            >
                              {{
                                item.price * item.quantity
                                  | currency: 'USD' : 'symbol' : '1.2-2'
                              }}
                            </div>
                            <div class="w-12 shrink-0"></div>
                          </div>
                        }
                      </div>

                      <!-- Shipping -->
                      <div
                        class="flex flex-col gap-4 px-(--table-cell-padding-x) sm:flex-row sm:gap-12"
                      >
                        <div>
                          <div class="text-sm font-medium text-neutral-a10">
                            Ship to
                          </div>
                          <div class="mt-0.5">
                            @if (row.shippingAddress; as address) {
                              <div>{{ address.street }}</div>
                              <div>{{ address.city }}</div>
                              <div>{{ address.country }}</div>
                            } @else {
                              <span class="text-neutral-a8">—</span>
                            }
                          </div>
                        </div>
                        <div>
                          <div class="text-sm font-medium text-neutral-a10">
                            Method
                          </div>
                          <div class="mt-0.5">
                            {{ row.shippingMethod.label }}
                            @if (row.shippingMethod.carrier) {
                              <span class="text-neutral-a11">
                                · {{ row.shippingMethod.carrier }}
                              </span>
                            }
                          </div>
                        </div>
                        <div>
                          <div class="text-sm font-medium text-neutral-a10">
                            Note
                          </div>
                          <div class="mt-0.5">
                            @if (row.note) {
                              {{ row.note }}
                            } @else {
                              <span class="text-neutral-a8">—</span>
                            }
                          </div>
                        </div>
                        <a
                          matButton
                          class="small self-start sm:ms-auto sm:self-end"
                          [routerLink]="row.id"
                        >
                          Open order
                          <mat-icon
                            svgIcon="arrow-right"
                            iconPositionEnd
                          />
                        </a>
                      </div>
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
                          svgIcon="shopping-cart"
                        />
                        <div class="text-center text-neutral-a11">
                          No orders match this view.
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
                  (click)="toggleExpanded(row)"
                ></tr>

                <!-- Detail row definition -->
                <tr
                  mat-row
                  *matRowDef="let row; columns: ['detail']; when: isExpanded"
                ></tr>
              </table>
            </div>
            <mat-paginator
              class="p-2"
              [length]="orders().length"
              [pageSize]="25"
              [pageSizeOptions]="[10, 25, 50]"
            />
          </div>
        </mat-tab-nav-panel>
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

    <!-- Create order -->
    <orders-create-order [(open)]="createOrderOpen" />
  `,
})
export default class Orders {
  // Dependencies
  private ordersService = inject(OrdersService);

  // Queries
  readonly table = viewChild.required(MatTable);
  readonly paginator = viewChild(MatPaginator);

  // State
  private orders = this.ordersService.orders;
  private viewOptions = VIEW_OPTIONS;
  private filterOptions = FILTER_OPTIONS;
  private dateOptions = DATE_OPTIONS;
  private sortOptions = SORT_OPTIONS;
  private view = signal<View>('all');
  private search = signal('');
  private sort = signal(SORT_OPTIONS[0]);
  private activeFilters = signal<Filter[]>([]);
  private selections = signal<Record<FilterId, string[]>>({
    fulfillment: [],
    payment: [],
    channel: [],
  });
  private dateFilter = signal(DATE_OPTIONS[3]);
  private expanded = signal<string | null>(null);
  private customizeOpen = signal(false);
  private createOrderOpen = signal(false);
  private columns = signal<Column[]>([...COLUMNS]);
  private dataSource = new MatTableDataSource<Order>([]);

  // Arrow keeps `this` bound, MatTable calls it as the detail row's `when` predicate
  private isExpanded = (_: number, order: Order) =>
    this.expanded() === order.id;

  // Computed state
  private columnIds = computed(() => [
    ...this.columns()
      .filter((column) => column.visible)
      .map((column) => column.id),
    'expand',
  ]);
  private availableFilters = computed(() =>
    FILTERS.filter((filter) => !this.activeFilters().includes(filter))
  );
  private hasFilters = computed(
    () =>
      this.activeFilters().length > 0 || this.dateFilter() !== DATE_OPTIONS[3]
  );
  private viewCounts = computed(
    () =>
      Object.fromEntries(
        VIEW_OPTIONS.map((option) => [
          option.id,
          this.orders().filter((order) => this.inView(order, option.id)).length,
        ])
      ) as Record<View, number>
  );
  private stats = computed<Stat[]>(() => {
    const now = new Date();
    const current = this.summarize(
      this.orders().filter((order) =>
        isAfter(order.placedAt, add(now, { days: -30 }))
      )
    );
    const previous = this.summarize(
      this.orders().filter(
        (order) =>
          !isAfter(order.placedAt, add(now, { days: -30 })) &&
          isAfter(order.placedAt, add(now, { days: -60 }))
      )
    );
    const growth = (key: 'revenue' | 'orders' | 'average') =>
      ((current[key] - previous[key]) / previous[key]) * 100;

    return [
      {
        label: 'Revenue',
        value: current.revenue,
        format: 'currency',
        change: growth('revenue'),
        unit: '%',
        positive: growth('revenue') >= 0,
      },
      {
        label: 'Orders',
        value: current.orders,
        format: 'number',
        change: growth('orders'),
        unit: '%',
        positive: growth('orders') >= 0,
      },
      {
        label: 'Avg. order value',
        value: current.average,
        format: 'currency',
        change: growth('average'),
        unit: '%',
        positive: growth('average') >= 0,
      },
      {
        label: 'Refund rate',
        value: current.refundRate,
        format: 'percent',
        change: current.refundRate - previous.refundRate,
        unit: ' pts',
        positive: current.refundRate <= previous.refundRate,
      },
    ];
  });
  private dataSourceFilter = computed<DataSourceFilter>(() => ({
    search: this.search().trim().toLowerCase(),
    view: this.view(),
    fulfillments: this.selections().fulfillment,
    payments: this.selections().payment,
    channels: this.selections().channel,
    days: this.dateFilter().days,
  }));

  constructor() {
    this.dataSource.filterPredicate = (order, filter) => {
      const { search, view, fulfillments, payments, channels, days } =
        JSON.parse(filter) as DataSourceFilter;

      return (
        (!search ||
          order.id.includes(search.replace('#', '')) ||
          order.customer.name.toLowerCase().includes(search) ||
          order.customer.email.includes(search)) &&
        this.inView(order, view) &&
        (!fulfillments.length || fulfillments.includes(order.fulfillment)) &&
        (!payments.length || payments.includes(order.payment)) &&
        (!channels.length || channels.includes(order.channel)) &&
        (!days || isAfter(order.placedAt, add(new Date(), { days: -days })))
      );
    };

    afterNextRender(() => {
      this.dataSource.paginator = this.paginator() ?? null;
    });

    effect(() => {
      this.dataSource.data = [...this.orders()].sort(this.sort().compare);
    });

    effect(() => {
      this.dataSource.filter = JSON.stringify(this.dataSourceFilter());
      this.paginator()?.firstPage();
    });
  }

  private inView(order: Order, view: View) {
    switch (view) {
      case 'unfulfilled':
        return (
          order.fulfillment === 'unfulfilled' ||
          order.fulfillment === 'partially-fulfilled'
        );
      case 'unpaid':
        return order.payment === 'unpaid' || order.payment === 'partially-paid';
      case 'returns':
        return order.fulfillment === 'returned';
      case 'flagged':
        return order.flagged;
      default:
        return true;
    }
  }

  private summarize(orders: Order[]) {
    const revenue = orders.reduce(
      (sum, order) => sum + order.total - order.refunded,
      0
    );

    return {
      revenue,
      orders: orders.length,
      average: revenue / orders.length,
      refundRate:
        (orders.filter((order) => order.payment === 'refunded').length /
          orders.length) *
        100,
    };
  }

  private toggleExpanded(order: Order) {
    this.expanded.update((current) => (current === order.id ? null : order.id));

    // MatTable re-evaluates `when` predicates only on render, not on signal changes
    this.table().renderRows();
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
      fulfillment: [],
      payment: [],
      channel: [],
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

  private trackBy(_: number, item: Order) {
    return item.id;
  }
}
