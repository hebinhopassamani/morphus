import { DatePipe, SlicePipe, TitleCasePipe } from '@angular/common';
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
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { differenceInDays } from 'date-fns';
import { Media } from '@/app/core/media';
import {
  Customer,
  CustomersService,
  Organization,
  Plan,
} from '@/app/domains/admin/modules/customers/data/customers';
import { TicketsService } from '@/app/domains/admin/modules/tickets/data/tickets';
import {
  BuiCombobox,
  BuiComboboxContent,
  BuiComboboxListbox,
  BuiComboboxOption,
  BuiComboboxOptionIndicator,
  BuiComboboxPortal,
  BuiComboboxTrigger,
} from '@/app/ui/combobox';

type CustomerRow = Customer & {
  organization: Organization | null;
  openTickets: number;
  lastContact: string | null;
};

const PLANS: { id: Plan; label: string }[] = [
  {
    id: 'free',
    label: 'Free',
  },
  {
    id: 'team',
    label: 'Team',
  },
  {
    id: 'business',
    label: 'Business',
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
    MatSort,
    MatSortHeader,
    MatSuffix,
    MatTableModule,
    RouterLink,
    SlicePipe,
    TitleCasePipe,
  ],
  template: `
    <div
      class="mx-auto flex w-full max-w-7xl min-w-0 flex-auto flex-col gap-y-5 p-5"
    >
      <!-- Header -->
      <div class="flex flex-col gap-y-4">
        <!-- Title -->
        <div class="flex items-center justify-between gap-x-3">
          <div class="text-3xl font-semibold tracking-tighter">Customers</div>

          <!-- New customer -->
          <button
            matButton
            class="primary max-sm:icon-only"
          >
            <mat-icon svgIcon="user-round-plus" />
            New customer
          </button>
        </div>

        <!-- Search & Filter -->
        <div class="flex flex-wrap items-center gap-2">
          <!-- Search -->
          <mat-form-field
            class="min-w-0 flex-auto max-sm:basis-full sm:max-w-72"
          >
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

          <!-- Segment -->
          <mat-button-toggle-group
            class="segmented"
            name="segment"
            [value]="segment()"
            (valueChange)="segment.set($event)"
          >
            <mat-button-toggle value="all">All</mat-button-toggle>
            <mat-button-toggle value="active">Active</mat-button-toggle>
            <mat-button-toggle value="new">New</mat-button-toggle>
            <mat-button-toggle value="vip">VIP</mat-button-toggle>
          </mat-button-toggle-group>

          <!-- Plan filter -->
          <div
            buiCombobox
            class="w-fit"
            [(value)]="plans"
          >
            <button
              matButton
              buiComboboxTrigger
              id="customers-plan-filter"
            >
              <span class="inline-flex items-center gap-x-1.5">
                Plan
                @if (plans().length) {
                  <span
                    class="rounded-sm bg-neutral-a3 px-1.5 py-px text-xs font-medium text-neutral-a11"
                  >
                    {{ plans().length }}
                  </span>
                }
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
                  aria-labelledby="customers-plan-filter"
                  multi
                  focusMode="activedescendant"
                  selectionMode="explicit"
                >
                  @for (option of planOptions; track option.id) {
                    <div
                      buiComboboxOption
                      [value]="option.id"
                      [label]="option.label"
                    >
                      <span class="flex-auto">{{ option.label }}</span>
                      <span buiComboboxOptionIndicator></span>
                    </div>
                  }
                </div>
                @if (plans().length) {
                  <mat-divider />
                  <button
                    matButton
                    class="tertiary m-1 justify-start rounded-[calc(var(--theme-border-radius)*2/3)] px-2"
                    (click)="plans.set([])"
                  >
                    <mat-icon svgIcon="x" />
                    Clear filter
                  </button>
                }
              </div>
            </ng-template>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="flex flex-col gap-y-1">
        <mat-divider />

        <div class="-mx-3 flex flex-col">
          <div class="relative isolate overflow-x-visible overflow-y-hidden">
            <table
              class="border-spacing-y-1 whitespace-nowrap [--table-body-border-color:transparent] [--table-body-row-height:--spacing(14)] [--table-header-border-color:transparent]"
              mat-table
              [dataSource]="dataSource"
              [trackBy]="trackBy"
              matSort
              matSortActive="lastContact"
              matSortDirection="desc"
            >
              <!-- Customer column -->
              <ng-container matColumnDef="customer">
                <th
                  class="w-full"
                  mat-header-cell
                  *matHeaderCellDef
                  mat-sort-header
                >
                  Customer
                </th>
                <td
                  class="w-full"
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
                      <div class="flex items-center gap-x-2">
                        <div class="font-medium">{{ row.name }}</div>
                        @if (row.vip) {
                          <div
                            class="inline-flex items-center rounded-full border border-amber-a6 bg-amber-a3 px-2 py-px text-xs font-medium whitespace-nowrap text-amber-a11"
                          >
                            VIP
                          </div>
                        }
                      </div>
                      <div class="text-sm text-neutral-a11">
                        {{ row.email }}
                      </div>
                    </div>
                  </div>
                </td>
              </ng-container>

              <!-- Organization column -->
              <ng-container matColumnDef="organization">
                <th
                  mat-header-cell
                  *matHeaderCellDef
                  mat-sort-header
                >
                  Organization
                </th>
                <td
                  mat-cell
                  *matCellDef="let row"
                >
                  @if (row.organization; as organization) {
                    <div class="flex flex-col">
                      <div>{{ organization.name }}</div>
                      <div class="text-sm text-neutral-a11">
                        {{ organization.plan | titlecase }} plan
                      </div>
                    </div>
                  } @else {
                    <span class="text-neutral-a11">None</span>
                  }
                </td>
              </ng-container>

              <!-- Location column -->
              <ng-container matColumnDef="location">
                <th
                  mat-header-cell
                  *matHeaderCellDef
                  mat-sort-header
                >
                  Location
                </th>
                <td
                  mat-cell
                  *matCellDef="let row"
                >
                  {{ row.location }}
                </td>
              </ng-container>

              <!-- Open tickets column -->
              <ng-container matColumnDef="openTickets">
                <th
                  class="text-end"
                  mat-header-cell
                  *matHeaderCellDef
                  mat-sort-header
                  arrowPosition="before"
                >
                  Open tickets
                </th>
                <td
                  class="text-end tabular-nums"
                  mat-cell
                  *matCellDef="let row"
                >
                  {{ row.openTickets }}
                </td>
              </ng-container>

              <!-- Last contact column -->
              <ng-container matColumnDef="lastContact">
                <th
                  mat-header-cell
                  *matHeaderCellDef
                  mat-sort-header
                >
                  Last contact
                </th>
                <td
                  class="tabular-nums"
                  mat-cell
                  *matCellDef="let row"
                >
                  @if (row.lastContact) {
                    {{ row.lastContact | date: 'MMM d, y' }}
                  } @else {
                    <span class="text-neutral-a11">Never</span>
                  }
                </td>
              </ng-container>

              <!-- Customer since column -->
              <ng-container matColumnDef="since">
                <th
                  mat-header-cell
                  *matHeaderCellDef
                  mat-sort-header
                >
                  Customer since
                </th>
                <td
                  class="tabular-nums"
                  mat-cell
                  *matCellDef="let row"
                >
                  {{ row.since | date: 'MMM d, y' }}
                </td>
              </ng-container>

              <!-- Actions column -->
              <ng-container matColumnDef="actions">
                <th
                  mat-header-cell
                  *matHeaderCellDef
                ></th>
                <td
                  mat-cell
                  *matCellDef="let row"
                >
                  <button
                    matIconButton
                    class="tiny mx-auto"
                    [matMenuTriggerFor]="customerActions"
                    (click)="$event.stopPropagation()"
                  >
                    <mat-icon svgIcon="ellipsis-vertical" />
                  </button>
                  <mat-menu
                    xPosition="before"
                    #customerActions="matMenu"
                  >
                    <button
                      mat-menu-item
                      [routerLink]="row.id"
                    >
                      <mat-icon svgIcon="eye" />
                      View
                    </button>
                    <button mat-menu-item>
                      <mat-icon svgIcon="ticket-plus" />
                      New ticket
                    </button>
                    <button mat-menu-item>
                      <mat-icon svgIcon="pencil" />
                      Edit
                    </button>
                    <mat-divider />
                    <button
                      mat-menu-item
                      class="text-red-a11 hover:bg-red-a3"
                    >
                      <mat-icon
                        class="text-red-a11"
                        svgIcon="trash"
                      />
                      Delete
                    </button>
                  </mat-menu>
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
                        No customers match your search.
                      </div>
                    </div>
                  </td>
                </tr>
              </ng-template>

              <!-- Header row definition -->
              <tr
                class="*:not-first:ps-6 *:first:ps-3 *:last:pe-3"
                mat-header-row
                *matHeaderRowDef="columnIds()"
              ></tr>

              <!-- Row definition -->
              <!-- Hover tile: cells paint the background, end cells round it -->
              <tr
                class="cursor-pointer *:not-first:ps-6 *:first:rounded-s-lg *:first:ps-3 *:last:rounded-e-lg *:last:pe-3 hover:*:bg-neutral-a3"
                mat-row
                *matRowDef="let row; columns: columnIds()"
                [routerLink]="row.id"
              ></tr>
            </table>
          </div>
          <mat-paginator
            class="px-3 py-2"
            [pageSize]="25"
            [pageSizeOptions]="[10, 25, 50]"
          />
        </div>
      </div>
    </div>
  `,
})
export default class Customers {
  // Dependencies
  private customersService = inject(CustomersService);
  private media = inject(Media);
  private ticketsService = inject(TicketsService);

  // Queries
  readonly paginator = viewChild(MatPaginator);
  readonly sort = viewChild(MatSort);

  // State
  private planOptions = PLANS;
  private search = signal('');
  private segment = signal<'all' | 'active' | 'new' | 'vip'>('all');
  private plans = signal<Plan[]>([]);
  private dataSource = new MatTableDataSource<CustomerRow>([]);
  private isCompact = this.media.match(`(width < 64rem)`);
  private isMobile = this.media.match(`(width < 48rem)`);

  // Computed state
  private columnIds = computed(() =>
    [
      'customer',
      'organization',
      'location',
      'openTickets',
      'lastContact',
      'since',
      'actions',
    ].filter(
      (columnId) =>
        !(this.isCompact() && ['since', 'location'].includes(columnId)) &&
        !(this.isMobile() && ['organization', 'lastContact'].includes(columnId))
    )
  );
  private rows = computed(() =>
    this.customersService.customers().map((customer): CustomerRow => {
      const tickets = this.ticketsService.byCustomer(customer.id);

      return {
        ...customer,
        organization: customer.organizationId
          ? this.customersService.organizationById(customer.organizationId)
          : null,
        openTickets: tickets.filter((ticket) => ticket.status !== 'closed')
          .length,
        lastContact:
          tickets
            .map((ticket) => ticket.updatedAt)
            .sort()
            .at(-1) ?? null,
      };
    })
  );
  private customers = computed(() => {
    const search = this.search().trim().toLowerCase();
    const segment = this.segment();
    const plans = this.plans();

    return this.rows().filter(
      (customer) =>
        (segment === 'all' ||
          (segment === 'active' && customer.openTickets > 0) ||
          (segment === 'new' &&
            differenceInDays(new Date(), customer.since) < 30) ||
          (segment === 'vip' && customer.vip)) &&
        (!plans.length ||
          (customer.organization &&
            plans.includes(customer.organization.plan))) &&
        (!search ||
          [
            customer.name,
            customer.email,
            customer.organization?.name ?? '',
          ].some((text) => text.toLowerCase().includes(search)))
    );
  });

  constructor() {
    this.dataSource.sortingDataAccessor = (customer, id) => {
      if (id === 'customer') {
        return customer.name;
      }

      if (id === 'organization') {
        return customer.organization?.name ?? '';
      }

      return customer[id as keyof CustomerRow] as string;
    };

    afterNextRender(() => {
      this.dataSource.paginator = this.paginator() ?? null;
      this.dataSource.sort = this.sort() ?? null;
    });

    effect(() => {
      this.dataSource.data = this.customers();
      this.paginator()?.firstPage();
    });
  }

  private trackBy(_: number, item: CustomerRow) {
    return item.id;
  }
}
