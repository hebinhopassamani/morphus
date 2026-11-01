import {
  CurrencyPipe,
  DatePipe,
  I18nPluralPipe,
  SlicePipe,
  TitleCasePipe,
} from '@angular/common';
import { Component, computed, effect, inject, input } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardHeader } from '@angular/material/card';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { Router, RouterLink } from '@angular/router';
import { differenceInSeconds, formatDistanceToNowStrict } from 'date-fns';
import { InvoicesService } from '@/app/domains/admin/modules/invoices/data/invoices';
import {
  OrdersService,
  TimelineEntry,
} from '@/app/domains/admin/modules/orders/data/orders';
import {
  OrderChannelPill,
  OrderItemStatusPill,
} from '@/app/domains/admin/modules/orders/ui/pills';
import {
  OrderFulfillmentTag,
  OrderPaymentTag,
} from '@/app/domains/admin/modules/orders/ui/tags';

@Component({
  selector: 'order',
  imports: [
    CurrencyPipe,
    DatePipe,
    I18nPluralPipe,
    MatButton,
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatDivider,
    MatIcon,
    MatIconButton,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    MatTableModule,
    OrderChannelPill,
    OrderFulfillmentTag,
    OrderItemStatusPill,
    OrderPaymentTag,
    RouterLink,
    SlicePipe,
    TitleCasePipe,
  ],
  template: `
    @if (order(); as order) {
      <div
        class="mx-auto flex w-full max-w-7xl flex-auto flex-col gap-4 p-6 sm:gap-6 lg:p-8"
      >
        <!-- Back link -->
        <a
          matButton
          class="link -mb-2 self-start"
          routerLink="/orders"
        >
          <mat-icon svgIcon="chevron-left" />
          Orders
        </a>

        <!-- Header -->
        <div class="flex flex-col gap-y-5">
          <div class="flex items-start gap-x-3">
            <div class="flex min-w-0 flex-col gap-y-1">
              <div class="flex flex-wrap items-center gap-x-2.5 gap-y-2">
                <div class="text-3xl font-semibold tracking-tighter">
                  #{{ order.id }}
                </div>
                <order-payment-tag [status]="order.payment" />
                <order-fulfillment-tag [status]="order.fulfillment" />
                @if (order.flagged) {
                  <div
                    class="inline-flex items-center gap-x-1.5 rounded-lg bg-red-a3 px-2 py-0.5 text-sm font-medium whitespace-nowrap text-red-a11"
                  >
                    <mat-icon
                      class="size-3.5"
                      svgIcon="triangle-alert"
                    />
                    Flagged
                  </div>
                }
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
                <mat-icon svgIcon="printer" />
                Print invoice
              </button>
              <button
                matButton
                class="small hidden sm:flex"
              >
                <mat-icon svgIcon="undo-2" />
                Refund
              </button>
              <button
                matButton
                class="primary small"
              >
                <mat-icon svgIcon="package-check" />
                Fulfill items
              </button>

              <!-- Mobile actions -->
              <button
                matIconButton
                class="small sm:hidden"
                [matMenuTriggerFor]="orderMenu"
              >
                <mat-icon svgIcon="ellipsis-vertical" />
              </button>
              <mat-menu
                class="min-w-44"
                xPosition="before"
                #orderMenu="matMenu"
              >
                <button mat-menu-item>
                  <mat-icon svgIcon="printer" />
                  Print invoice
                </button>
                <mat-divider />
                <button mat-menu-item>
                  <mat-icon svgIcon="undo-2" />
                  Refund
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
              Placed {{ order.placedAt | date: 'MMM d, y, h:mm a' }}
            </div>
            <order-channel-pill [channel]="order.channel" />
            <div class="flex items-center gap-x-1.5">
              <mat-icon
                class="size-4"
                svgIcon="box"
              />
              {{ order.itemCount | i18nPlural: itemPlural }}
            </div>
          </div>
        </div>

        <div class="grid gap-4 sm:gap-6 lg:grid-cols-3">
          <!-- Main column -->
          <div class="flex min-w-0 flex-col gap-4 sm:gap-6 lg:col-span-2">
            <!-- Items -->
            <mat-card
              appearance="filled"
              class="flex flex-col"
            >
              <mat-card-header>
                <div class="flex flex-auto items-center gap-x-2">
                  <mat-icon
                    class="size-4"
                    svgIcon="package"
                  />
                  <div class="font-medium tracking-tight">Items</div>
                  <div class="ms-auto text-sm text-neutral-a11 tabular-nums">
                    {{ order.itemCount | i18nPlural: itemPlural }}
                  </div>
                </div>
              </mat-card-header>
              <mat-card-content class="flex flex-col py-0">
                @for (item of order.items; track item.sku; let last = $last) {
                  <div class="flex items-center gap-x-3 py-2.5">
                    <div
                      class="flex size-9 shrink-0 items-center justify-center rounded-md bg-neutral-a3 text-neutral-a11"
                    >
                      <mat-icon
                        class="size-4"
                        [svgIcon]="item.icon"
                      />
                    </div>
                    <div class="flex min-w-0 flex-auto flex-col">
                      <div class="truncate font-medium">{{ item.name }}</div>
                      <div class="truncate text-sm text-neutral-a11">
                        {{ item.variant }} · {{ item.sku }}
                      </div>
                    </div>
                    <div class="hidden sm:block">
                      <order-item-status-pill [status]="item.status" />
                    </div>
                    <div class="shrink-0 text-neutral-a11 tabular-nums">
                      {{ item.quantity }} ×
                      {{ item.price | currency: 'USD' : 'symbol' : '1.2-2' }}
                    </div>
                    <div
                      class="w-20 shrink-0 text-end font-medium tabular-nums"
                    >
                      {{
                        item.price * item.quantity
                          | currency: 'USD' : 'symbol' : '1.2-2'
                      }}
                    </div>
                  </div>

                  @if (!last) {
                    <mat-divider />
                  }
                }
              </mat-card-content>
              <mat-card-content class="flex flex-col gap-y-2">
                <div class="flex items-center gap-x-1">
                  <div class="text-neutral-a11">Subtotal</div>
                  <div class="flex-auto"></div>
                  <div class="tabular-nums">
                    {{ order.subtotal | currency: 'USD' : 'symbol' : '1.2-2' }}
                  </div>
                </div>
                @if (order.discount) {
                  <div class="flex items-center gap-x-1">
                    <div class="text-neutral-a11">
                      Discount ({{ order.discountCode }})
                    </div>
                    <div class="flex-auto"></div>
                    <div class="tabular-nums">
                      -{{
                        order.discount | currency: 'USD' : 'symbol' : '1.2-2'
                      }}
                    </div>
                  </div>
                }
                <div class="flex items-center gap-x-1">
                  <div class="text-neutral-a11">
                    Shipping ({{ order.shippingMethod.label }})
                  </div>
                  <div class="flex-auto"></div>
                  <div class="tabular-nums">
                    {{ order.shipping | currency: 'USD' : 'symbol' : '1.2-2' }}
                  </div>
                </div>
                <div class="flex items-center gap-x-1">
                  <div class="text-neutral-a11">Tax</div>
                  <div class="flex-auto"></div>
                  <div class="tabular-nums">
                    {{ order.tax | currency: 'USD' : 'symbol' : '1.2-2' }}
                  </div>
                </div>
                <div
                  class="flex items-center gap-x-1 border-t border-neutral-a4 pt-2 font-semibold"
                >
                  <div>Total</div>
                  <div class="flex-auto"></div>
                  <div class="tabular-nums">
                    {{ order.total | currency: 'USD' : 'symbol' : '1.2-2' }}
                  </div>
                </div>
                <div class="flex items-center gap-x-1">
                  <div class="text-neutral-a11">Paid</div>
                  <div class="flex-auto"></div>
                  <div class="tabular-nums">
                    {{ order.paid | currency: 'USD' : 'symbol' : '1.2-2' }}
                  </div>
                </div>
                @if (order.refunded) {
                  <div class="flex items-center gap-x-1">
                    <div class="text-neutral-a11">Refunded</div>
                    <div class="flex-auto"></div>
                    <div class="tabular-nums">
                      -{{
                        order.refunded | currency: 'USD' : 'symbol' : '1.2-2'
                      }}
                    </div>
                  </div>
                }
                <div class="flex items-center gap-x-1 font-medium">
                  <div>Balance due</div>
                  <div class="flex-auto"></div>
                  <div
                    class="tabular-nums"
                    [class.text-amber-a11]="order.balance"
                  >
                    {{ order.balance | currency: 'USD' : 'symbol' : '1.2-2' }}
                  </div>
                </div>
              </mat-card-content>
            </mat-card>

            <!-- Payment -->
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
                  <div class="font-medium tracking-tight">Payment</div>
                  @if (invoice(); as invoice) {
                    <a
                      class="ms-auto text-sm font-medium tabular-nums hover:underline"
                      [routerLink]="['/invoices', invoice.id]"
                    >
                      {{ invoice.id }}
                    </a>
                  }
                </div>
              </mat-card-header>
              <mat-card-content class="flex items-center gap-x-3">
                <div
                  class="flex size-9 shrink-0 items-center justify-center rounded-md bg-neutral-a3 text-neutral-a11"
                >
                  <mat-icon
                    class="size-4"
                    [svgIcon]="order.paymentMethod.icon"
                  />
                </div>
                <div class="flex min-w-0 flex-auto flex-col">
                  <div class="truncate font-medium">
                    {{ order.paymentMethod.label }}
                  </div>
                  <div class="text-sm text-neutral-a11 tabular-nums">
                    {{ order.paid | currency: 'USD' : 'symbol' : '1.2-2' }}
                    paid of
                    {{ order.total | currency: 'USD' : 'symbol' : '1.2-2' }}
                  </div>
                </div>
                <order-payment-tag [status]="order.payment" />
              </mat-card-content>
              <mat-card-content class="flex flex-col p-0">
                <div class="flex flex-col">
                  <div
                    class="relative isolate overflow-x-visible overflow-y-hidden"
                  >
                    <table
                      class="-mt-px whitespace-nowrap [--table-cell-padding-x:calc(var(--spacing)*3)]"
                      mat-table
                      [dataSource]="order.transactions"
                    >
                      <!-- Type column -->
                      <ng-container matColumnDef="kind">
                        <th
                          mat-header-cell
                          *matHeaderCellDef
                        >
                          Type
                        </th>
                        <td
                          mat-cell
                          *matCellDef="let row"
                        >
                          {{ row.kind | titlecase }}
                        </td>
                      </ng-container>

                      <!-- Reference column -->
                      <ng-container matColumnDef="id">
                        <th
                          mat-header-cell
                          *matHeaderCellDef
                        >
                          Reference
                        </th>
                        <td
                          class="text-neutral-a11 tabular-nums"
                          mat-cell
                          *matCellDef="let row"
                        >
                          {{ row.id }}
                        </td>
                      </ng-container>

                      <!-- Date column -->
                      <ng-container matColumnDef="date">
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
                          {{ row.date | date: 'MMM d, h:mm a' }}
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
                          <div class="inline-flex items-center gap-x-1.5">
                            <div
                              class="size-1.5 rounded-full"
                              [class.bg-jade-9]="row.status === 'success'"
                              [class.bg-amber-9]="row.status === 'pending'"
                            ></div>
                            {{ row.status | titlecase }}
                          </div>
                        </td>
                      </ng-container>

                      <!-- Amount column -->
                      <ng-container matColumnDef="amount">
                        <th
                          class="text-end"
                          mat-header-cell
                          *matHeaderCellDef
                        >
                          Amount
                        </th>
                        <td
                          class="text-end font-medium tabular-nums"
                          mat-cell
                          *matCellDef="let row"
                        >
                          {{ row.kind === 'refund' ? '-' : ''
                          }}{{
                            row.amount | currency: 'USD' : 'symbol' : '1.2-2'
                          }}
                        </td>
                      </ng-container>

                      <!-- Header row definition -->
                      <tr
                        mat-header-row
                        *matHeaderRowDef="transactionColumns"
                      ></tr>

                      <!-- Row definition -->
                      <tr
                        mat-row
                        *matRowDef="let row; columns: transactionColumns"
                      ></tr>
                    </table>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>

            <!-- Fulfillment -->
            <mat-card
              appearance="filled"
              class="@container flex flex-col"
            >
              <mat-card-header>
                <div class="flex flex-auto items-center gap-x-2">
                  <mat-icon
                    class="size-4"
                    svgIcon="truck"
                  />
                  <div class="font-medium tracking-tight">Fulfillment</div>
                </div>
              </mat-card-header>
              <mat-card-content
                class="grid grid-cols-1 items-center gap-x-4 gap-y-3 @xs:grid-cols-[6rem_1fr]"
              >
                <div class="text-neutral-a11">Status</div>
                <order-fulfillment-tag [status]="order.fulfillment" />

                <div class="text-neutral-a11">Items</div>
                <div class="tabular-nums">
                  {{ fulfilledCount() }} of {{ order.itemCount }} fulfilled
                </div>

                <div class="text-neutral-a11">Method</div>
                <div>{{ order.shippingMethod.label }}</div>

                <div class="text-neutral-a11">Carrier</div>
                <div>
                  @if (order.shippingMethod.carrier) {
                    {{ order.shippingMethod.carrier }}
                  } @else {
                    <span class="text-neutral-a8">—</span>
                  }
                </div>

                <div class="text-neutral-a11">Tracking</div>
                <div class="truncate tabular-nums">
                  @if (order.tracking) {
                    {{ order.tracking }}
                  } @else {
                    <span class="text-neutral-a8">—</span>
                  }
                </div>

                <div class="text-neutral-a11">Fulfilled</div>
                <div class="tabular-nums">
                  @if (order.shippedAt) {
                    {{ order.shippedAt | date: 'MMM d, y, h:mm a' }}
                  } @else {
                    <span class="text-neutral-a8">—</span>
                  }
                </div>
              </mat-card-content>
            </mat-card>

            <!-- Return -->
            @if (order.returned; as returned) {
              <mat-card
                appearance="filled"
                class="@container flex flex-col"
              >
                <mat-card-header>
                  <div class="flex flex-auto items-center gap-x-2">
                    <mat-icon
                      class="size-4"
                      svgIcon="undo-2"
                    />
                    <div class="font-medium tracking-tight">Return</div>
                  </div>
                </mat-card-header>
                <mat-card-content
                  class="grid grid-cols-1 items-center gap-x-4 gap-y-3 @xs:grid-cols-[6rem_1fr]"
                >
                  <div class="text-neutral-a11">Reason</div>
                  <div>{{ returned.reason }}</div>

                  <div class="text-neutral-a11">Received</div>
                  <div class="tabular-nums">
                    {{ returned.date | date: 'MMM d, y' }}
                  </div>

                  <div class="text-neutral-a11">Refund</div>
                  <div class="tabular-nums">
                    @if (order.refunded) {
                      {{
                        order.refunded | currency: 'USD' : 'symbol' : '1.2-2'
                      }}
                      issued
                    } @else {
                      <span class="text-amber-a11">Pending</span>
                    }
                  </div>
                </mat-card-content>
              </mat-card>
            }

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
                  @for (
                    entry of order.timeline;
                    track entry.id;
                    let last = $last
                  ) {
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
                          {{ entry.text }}
                        </div>
                        <div class="text-sm text-neutral-a11">
                          {{ formatDate(entry.date) }}
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
            <!-- Customer -->
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
                  <div class="font-medium tracking-tight">Customer</div>
                </div>
              </mat-card-header>
              <mat-card-content class="flex flex-col gap-y-4">
                <div class="flex items-center gap-x-3">
                  <div
                    class="flex size-10 shrink-0 items-center justify-center rounded-full bg-neutral-a3 text-lg font-semibold text-neutral-a11"
                  >
                    {{ order.customer.name | slice: 0 : 1 }}
                  </div>
                  <div class="flex min-w-0 flex-col">
                    <a
                      class="truncate font-medium hover:underline"
                      [routerLink]="['/customers', order.customer.id]"
                    >
                      {{ order.customer.name }}
                    </a>
                    <div class="text-sm text-neutral-a11">
                      Customer since {{ order.customer.since | date: 'MMM y' }}
                    </div>
                  </div>
                </div>

                <div class="flex flex-col gap-y-2">
                  <div class="flex items-center gap-x-2">
                    <mat-icon
                      class="size-4 shrink-0 text-neutral-a11"
                      svgIcon="mail"
                    />
                    <div class="truncate">{{ order.customer.email }}</div>
                  </div>
                  <div class="flex items-center gap-x-2">
                    <mat-icon
                      class="size-4 shrink-0 text-neutral-a11"
                      svgIcon="phone"
                    />
                    <div class="tabular-nums">{{ order.customer.phone }}</div>
                  </div>
                </div>

                <div
                  class="grid grid-cols-3 gap-4 border-t border-neutral-a4 pt-4"
                >
                  <div class="flex flex-col">
                    <div class="text-sm text-neutral-a11">Orders</div>
                    <div class="text-xl font-semibold tabular-nums">
                      {{ customerStats().orders }}
                    </div>
                  </div>
                  <div class="flex flex-col">
                    <div class="text-sm text-neutral-a11">Spent</div>
                    <div class="text-xl font-semibold tabular-nums">
                      {{
                        customerStats().spent
                          | currency: 'USD' : 'symbol' : '1.0-0'
                      }}
                    </div>
                  </div>
                  <div class="flex flex-col">
                    <div class="text-sm text-neutral-a11">Avg. order</div>
                    <div class="text-xl font-semibold tabular-nums">
                      {{
                        customerStats().average
                          | currency: 'USD' : 'symbol' : '1.0-0'
                      }}
                    </div>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>

            <!-- Addresses -->
            <mat-card
              appearance="filled"
              class="@container flex flex-col"
            >
              <mat-card-header>
                <div class="flex flex-auto items-center gap-x-2">
                  <mat-icon
                    class="size-4"
                    svgIcon="map-pin"
                  />
                  <div class="font-medium tracking-tight">Addresses</div>
                </div>
              </mat-card-header>
              <mat-card-content
                class="grid grid-cols-1 items-start gap-x-4 gap-y-3 @xs:grid-cols-[6rem_1fr]"
              >
                <div class="text-neutral-a11">Shipping</div>
                <div>
                  @if (order.shippingAddress; as address) {
                    <div>{{ address.street }}</div>
                    <div>{{ address.city }}</div>
                    <div>{{ address.country }}</div>
                  } @else {
                    <span class="text-neutral-a11">No shipping required</span>
                  }
                </div>

                <div class="text-neutral-a11">Billing</div>
                <div>
                  @if (order.billingAddress === order.shippingAddress) {
                    <span class="text-neutral-a11">
                      Same as shipping address
                    </span>
                  } @else {
                    <div>{{ order.billingAddress.street }}</div>
                    <div>{{ order.billingAddress.city }}</div>
                    <div>{{ order.billingAddress.country }}</div>
                  }
                </div>
              </mat-card-content>
            </mat-card>

            <!-- Other orders -->
            @if (otherOrders().length) {
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
                    <div class="font-medium tracking-tight">Other orders</div>
                    <div class="ms-auto text-sm text-neutral-a11 tabular-nums">
                      {{ otherOrders().length }}
                    </div>
                  </div>
                </mat-card-header>
                <mat-card-content class="flex flex-col gap-y-1 py-2">
                  @for (other of otherOrders(); track other.id) {
                    <a
                      class="-mx-2 flex cursor-pointer items-center gap-x-3 rounded-md px-2 py-2 hover:bg-neutral-a2"
                      [routerLink]="['/orders', other.id]"
                    >
                      <div class="flex min-w-0 flex-auto flex-col">
                        <div class="font-medium tabular-nums">
                          #{{ other.id }}
                        </div>
                        <div class="text-sm text-neutral-a11 tabular-nums">
                          {{ other.placedAt | date: 'MMM d, y' }}
                        </div>
                      </div>
                      <div class="tabular-nums">
                        {{ other.total | currency: 'USD' : 'symbol' : '1.2-2' }}
                      </div>
                      <mat-icon
                        class="size-4 shrink-0 text-neutral-a8"
                        svgIcon="chevron-right"
                      />
                    </a>
                  }
                </mat-card-content>
              </mat-card>
            }
          </div>
        </div>
      </div>
    }
  `,
})
export default class Order {
  // Dependencies
  private invoicesService = inject(InvoicesService);
  private ordersService = inject(OrdersService);
  private router = inject(Router);

  // Inputs / Outputs
  readonly id = input.required<string>();

  // State
  private itemPlural = { '=1': '# item', other: '# items' };
  private transactionColumns = ['kind', 'id', 'date', 'status', 'amount'];

  // Computed state
  private order = computed(() => this.ordersService.byId(this.id()));
  private invoice = computed(() =>
    this.invoicesService
      .invoices()
      .find((invoice) => invoice.order === this.order())
  );
  private customerOrders = computed(() =>
    this.ordersService
      .orders()
      .filter((order) => order.customer === this.order()?.customer)
  );
  private otherOrders = computed(() =>
    this.customerOrders().filter((order) => order.id !== this.id())
  );
  private customerStats = computed(() => {
    const orders = this.customerOrders();
    const spent = orders.reduce(
      (sum, order) => sum + order.total - order.refunded,
      0
    );

    return {
      orders: orders.length,
      spent,
      average: spent / orders.length,
    };
  });
  private fulfilledCount = computed(() =>
    (this.order()?.items ?? [])
      .filter((item) => item.status !== 'unfulfilled')
      .reduce((sum, item) => sum + item.quantity, 0)
  );

  constructor() {
    effect(() => {
      if (!this.order()) {
        this.router.navigate(['/orders']);
      }
    });
  }

  private timelineIcon(entry: TimelineEntry) {
    switch (entry.type) {
      case 'placed':
        return 'shopping-cart';
      case 'note':
        return 'message-square';
      case 'payment':
        return 'credit-card';
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
