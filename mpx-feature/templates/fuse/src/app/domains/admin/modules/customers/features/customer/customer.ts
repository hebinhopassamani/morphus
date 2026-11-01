import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, effect, inject, input } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardHeader } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { Router, RouterLink } from '@angular/router';
import { differenceInSeconds, formatDistanceToNowStrict } from 'date-fns';
import { CustomersService } from '@/app/domains/admin/modules/customers/data/customers';
import { CustomerSegmentPill } from '@/app/domains/admin/modules/customers/ui/pills';
import { TimelineEntry } from '@/app/domains/admin/modules/orders/data/orders';
import {
  OrderFulfillmentTag,
  OrderPaymentTag,
} from '@/app/domains/admin/modules/orders/ui/tags';

@Component({
  selector: 'customer',
  imports: [
    CurrencyPipe,
    CustomerSegmentPill,
    DatePipe,
    MatButton,
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatIcon,
    MatIconButton,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    MatTableModule,
    OrderFulfillmentTag,
    OrderPaymentTag,
    RouterLink,
  ],
  template: `
    @if (customer(); as customer) {
      <div
        class="mx-auto flex w-full max-w-7xl flex-auto flex-col gap-4 p-6 sm:gap-6 lg:p-8"
      >
        <!-- Back link -->
        <a
          matButton
          class="link -mb-2 self-start"
          routerLink="/customers"
        >
          <mat-icon svgIcon="chevron-left" />
          Customers
        </a>

        <!-- Header -->
        <div class="flex flex-col gap-y-5">
          <div class="flex items-start gap-x-3">
            <div class="flex min-w-0 flex-col gap-y-1">
              <div class="flex flex-wrap items-center gap-x-2.5 gap-y-2">
                <div class="text-3xl font-semibold tracking-tighter">
                  {{ customer.name }}
                </div>
                <customer-segment-pill [segment]="customer.segment" />
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
                <mat-icon svgIcon="pencil" />
                Edit
              </button>
              <button
                matButton
                class="primary small"
              >
                <mat-icon svgIcon="plus" />
                Create order
              </button>

              <!-- Mobile actions -->
              <button
                matIconButton
                class="small sm:hidden"
                [matMenuTriggerFor]="customerMenu"
              >
                <mat-icon svgIcon="ellipsis-vertical" />
              </button>
              <mat-menu
                class="min-w-44"
                xPosition="before"
                #customerMenu="matMenu"
              >
                <button mat-menu-item>
                  <mat-icon svgIcon="pencil" />
                  Edit
                </button>
              </mat-menu>
            </div>
          </div>

          <!-- Meta -->
          <div
            class="flex flex-wrap items-center gap-x-5 gap-y-2 text-neutral-a11"
          >
            <div class="flex items-center gap-x-1.5">
              <mat-icon
                class="size-4"
                svgIcon="calendar"
              />
              Customer since {{ customer.since | date: 'MMM d, y' }}
            </div>
          </div>
        </div>

        <div class="grid gap-4 sm:gap-6 lg:grid-cols-3">
          <!-- Main column -->
          <div class="flex min-w-0 flex-col gap-4 sm:gap-6 lg:col-span-2">
            <!-- Stats -->
            <mat-card
              appearance="filled"
              class="@container"
            >
              <div class="grid grid-cols-2 gap-1 @xl:grid-cols-4">
                <mat-card-content class="flex min-w-0 flex-col">
                  <div class="truncate text-sm text-neutral-a11">Orders</div>
                  <div class="text-xl font-semibold tabular-nums">
                    {{ customer.orderCount }}
                  </div>
                </mat-card-content>
                <mat-card-content class="flex min-w-0 flex-col">
                  <div class="truncate text-sm text-neutral-a11">
                    Total spent
                  </div>
                  <div class="text-xl font-semibold tabular-nums">
                    {{ customer.spent | currency: 'USD' : 'symbol' : '1.0-0' }}
                  </div>
                </mat-card-content>
                <mat-card-content class="flex min-w-0 flex-col">
                  <div class="truncate text-sm text-neutral-a11">
                    Average order
                  </div>
                  <div class="text-xl font-semibold tabular-nums">
                    {{
                      customer.average | currency: 'USD' : 'symbol' : '1.0-0'
                    }}
                  </div>
                </mat-card-content>
                <mat-card-content class="flex min-w-0 flex-col">
                  <div class="truncate text-sm text-neutral-a11">
                    Last order
                  </div>
                  <div class="text-xl font-semibold tabular-nums">
                    {{ customer.lastOrderAt | date: 'MMM d' }}
                  </div>
                </mat-card-content>
              </div>
            </mat-card>

            <!-- Orders -->
            <mat-card
              appearance="filled"
              class="flex flex-col"
            >
              <mat-card-header>
                <div class="flex flex-auto items-center gap-x-2">
                  <mat-icon
                    class="size-4"
                    svgIcon="shopping-bag"
                  />
                  <div class="font-medium tracking-tight">Orders</div>
                  <div class="ms-auto text-sm text-neutral-a11 tabular-nums">
                    {{ customer.orderCount }}
                  </div>
                </div>
              </mat-card-header>
              <mat-card-content class="flex flex-col p-0">
                <div class="flex flex-col">
                  <div
                    class="relative isolate overflow-x-visible overflow-y-hidden"
                  >
                    <table
                      class="-mt-px whitespace-nowrap [--table-cell-padding-x:calc(var(--spacing)*3)]"
                      mat-table
                      [dataSource]="customer.orders"
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
                          <a
                            class="font-medium tabular-nums hover:underline"
                            [routerLink]="['/orders', row.id]"
                          >
                            #{{ row.id }}
                          </a>
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
                          {{ row.placedAt | date: 'MMM d, y' }}
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

                      <!-- Total column -->
                      <ng-container matColumnDef="total">
                        <th
                          class="text-end"
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

                      <!-- Header row definition -->
                      <tr
                        mat-header-row
                        *matHeaderRowDef="orderColumns"
                      ></tr>

                      <!-- Row definition -->
                      <tr
                        mat-row
                        *matRowDef="let row; columns: orderColumns"
                      ></tr>
                    </table>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>

            <!-- Timeline -->
            <mat-card
              appearance="filled"
              class="flex flex-col"
            >
              <mat-card-header>
                <div class="flex flex-auto items-center gap-x-2">
                  <mat-icon
                    class="size-4"
                    svgIcon="clock"
                  />
                  <div class="font-medium tracking-tight">Timeline</div>
                </div>
              </mat-card-header>
              <mat-card-content>
                <ul class="flex flex-col">
                  @for (entry of timeline(); track entry.id; let last = $last) {
                    <li class="flex gap-x-3">
                      <div class="flex flex-col items-center">
                        <div
                          class="flex size-7 shrink-0 items-center justify-center rounded-full bg-neutral-a4"
                        >
                          <mat-icon
                            class="size-3.5 text-neutral-a11"
                            [svgIcon]="timelineIcon(entry)"
                          />
                        </div>

                        @if (!last) {
                          <div class="w-px flex-auto bg-neutral-a4"></div>
                        }
                      </div>

                      <div
                        class="flex flex-auto flex-col"
                        [class.pb-5]="!last"
                      >
                        <div class="leading-7 text-pretty text-neutral-a11">
                          <span class="font-medium text-neutral-12">{{
                            entry.title
                          }}</span>
                          @if (entry.type === 'placed') {
                            {{
                              entry.order.total
                                | currency: 'USD' : 'symbol' : '1.2-2'
                            }}
                          } @else {
                            {{ entry.text }}
                          }
                        </div>
                        <div class="text-sm text-neutral-a11">
                          <a
                            class="font-medium tabular-nums hover:underline"
                            [routerLink]="['/orders', entry.order.id]"
                          >
                            #{{ entry.order.id }}
                          </a>
                          · {{ formatDate(entry.date) }}
                        </div>
                      </div>
                    </li>
                  }
                </ul>
              </mat-card-content>
            </mat-card>
          </div>

          <!-- Side column -->
          <div class="flex min-w-0 flex-col gap-4 sm:gap-6">
            <!-- Contact -->
            <mat-card
              appearance="filled"
              class="flex flex-col"
            >
              <mat-card-header>
                <div class="flex flex-auto items-center gap-x-2">
                  <mat-icon
                    class="size-4"
                    svgIcon="user-round"
                  />
                  <div class="font-medium tracking-tight">Contact</div>
                </div>
              </mat-card-header>
              <mat-card-content class="flex flex-col gap-y-2">
                <div class="flex items-center gap-x-2">
                  <mat-icon
                    class="size-4 shrink-0 text-neutral-a11"
                    svgIcon="mail"
                  />
                  <div class="truncate">{{ customer.email }}</div>
                </div>
                <div class="flex items-center gap-x-2">
                  <mat-icon
                    class="size-4 shrink-0 text-neutral-a11"
                    svgIcon="phone"
                  />
                  <div class="tabular-nums">{{ customer.phone }}</div>
                </div>
              </mat-card-content>
            </mat-card>

            <!-- Default address -->
            <mat-card
              appearance="filled"
              class="flex flex-col"
            >
              <mat-card-header>
                <div class="flex flex-auto items-center gap-x-2">
                  <mat-icon
                    class="size-4"
                    svgIcon="map-pin"
                  />
                  <div class="font-medium tracking-tight">Default address</div>
                </div>
              </mat-card-header>
              <mat-card-content>
                <div>{{ customer.address.street }}</div>
                <div>{{ customer.address.city }}</div>
                <div>{{ customer.address.country }}</div>
              </mat-card-content>
            </mat-card>

            <!-- Payment method -->
            <mat-card
              appearance="filled"
              class="flex flex-col"
            >
              <mat-card-header>
                <div class="flex flex-auto items-center gap-x-2">
                  <mat-icon
                    class="size-4"
                    svgIcon="credit-card"
                  />
                  <div class="font-medium tracking-tight">Payment method</div>
                </div>
              </mat-card-header>
              <mat-card-content class="flex items-center gap-x-3">
                <div
                  class="flex size-9 shrink-0 items-center justify-center rounded-md bg-neutral-a3 text-neutral-a11"
                >
                  <mat-icon
                    class="size-4"
                    [svgIcon]="customer.paymentMethod.icon"
                  />
                </div>
                <div class="truncate font-medium">
                  {{ customer.paymentMethod.label }}
                </div>
              </mat-card-content>
            </mat-card>

            <!-- Notes -->
            <mat-card
              appearance="filled"
              class="flex flex-col"
            >
              <mat-card-header>
                <div class="flex flex-auto items-center gap-x-2">
                  <mat-icon
                    class="size-4"
                    svgIcon="sticky-note"
                  />
                  <div class="font-medium tracking-tight">Notes</div>
                </div>
              </mat-card-header>
              <mat-card-content>
                <div class="text-neutral-a11">No notes yet.</div>
              </mat-card-content>
            </mat-card>
          </div>
        </div>
      </div>
    }
  `,
})
export default class Customer {
  // Dependencies
  private customersService = inject(CustomersService);
  private router = inject(Router);

  // Inputs / Outputs
  readonly id = input.required<string>();

  // State
  private orderColumns = [
    'order',
    'placedAt',
    'payment',
    'fulfillment',
    'total',
  ];

  // Computed state
  private customer = computed(() => this.customersService.byId(this.id()));
  private timeline = computed(() =>
    (this.customer()?.orders ?? [])
      .flatMap((order) =>
        order.timeline
          .filter((entry) => entry.type !== 'payment')
          .map((entry) => ({ ...entry, order }))
      )
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 8)
  );

  constructor() {
    effect(() => {
      if (!this.customer()) {
        this.router.navigate(['/customers']);
      }
    });
  }

  private timelineIcon(entry: TimelineEntry) {
    switch (entry.type) {
      case 'placed':
        return 'shopping-cart';
      case 'note':
        return 'message-square';
      case 'flag':
        return 'triangle-alert';
      case 'shipment':
        return 'truck';
      case 'return':
        return 'undo-2';
      default:
        return 'banknote-arrow-down';
    }
  }

  private formatDate(date: string) {
    if (differenceInSeconds(Date.now(), date) < 60) {
      return 'Just now';
    }

    return formatDistanceToNowStrict(date, { addSuffix: true });
  }
}
