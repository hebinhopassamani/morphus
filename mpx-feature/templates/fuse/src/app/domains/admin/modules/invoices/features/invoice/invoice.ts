import { CurrencyPipe, DatePipe, NgOptimizedImage } from '@angular/common';
import {
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardHeader } from '@angular/material/card';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { Router, RouterLink } from '@angular/router';
import { differenceInSeconds, formatDistanceToNowStrict } from 'date-fns';
import { WINDOW } from '@/app/core/window';
import {
  InvoiceEvent,
  InvoicesService,
  TERMS,
} from '@/app/domains/admin/modules/invoices/data/invoices';
import { InvoiceRecordPayment } from '@/app/domains/admin/modules/invoices/features/invoice/record-payment';
import { InvoiceStatusTag } from '@/app/domains/admin/modules/invoices/ui/tags';

@Component({
  selector: 'invoice',
  imports: [
    CurrencyPipe,
    DatePipe,
    InvoiceRecordPayment,
    InvoiceStatusTag,
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
    NgOptimizedImage,
    RouterLink,
  ],
  template: `
    @if (invoice(); as invoice) {
      <div
        class="mx-auto flex w-full max-w-7xl flex-auto flex-col gap-4 p-6 sm:gap-6 lg:p-8 print:p-0"
      >
        <!-- Back link -->
        <a
          matButton
          class="link -mb-2 self-start print:hidden"
          routerLink="/invoices"
        >
          <mat-icon svgIcon="chevron-left" />
          Invoices
        </a>

        <!-- Header -->
        <div class="flex items-start gap-x-3 print:hidden">
          <div class="flex flex-wrap items-center gap-x-2.5 gap-y-2">
            <div class="text-3xl font-semibold tracking-tighter">
              {{ invoice.id }}
            </div>
            <invoice-status-tag [status]="invoice.status" />
          </div>

          <!-- Spacer -->
          <div class="flex-auto"></div>

          <!-- Actions -->
          <div class="flex shrink-0 items-center gap-x-2">
            <button
              matButton
              class="small hidden sm:flex"
            >
              <mat-icon svgIcon="send" />
              Send
            </button>
            <button
              matButton
              class="small hidden sm:flex"
            >
              <mat-icon svgIcon="file-down" />
              Download PDF
            </button>
            <button
              matButton
              class="small hidden sm:flex"
              (click)="print()"
            >
              <mat-icon svgIcon="printer" />
              Print
            </button>
            <button
              matButton
              class="primary small"
              (click)="recordPaymentOpen.set(true)"
            >
              <mat-icon svgIcon="banknote" />
              Record payment
            </button>

            <!-- Mobile actions -->
            <button
              matIconButton
              class="small sm:hidden"
              [matMenuTriggerFor]="invoiceMenu"
            >
              <mat-icon svgIcon="ellipsis-vertical" />
            </button>
            <mat-menu
              class="min-w-44"
              xPosition="before"
              #invoiceMenu="matMenu"
            >
              <button mat-menu-item>
                <mat-icon svgIcon="send" />
                Send
              </button>
              <button mat-menu-item>
                <mat-icon svgIcon="file-down" />
                Download PDF
              </button>
              <mat-divider />
              <button
                mat-menu-item
                (click)="print()"
              >
                <mat-icon svgIcon="printer" />
                Print
              </button>
            </mat-menu>
          </div>
        </div>

        <div class="grid gap-4 sm:gap-6 lg:grid-cols-3 print:block">
          <!-- Document -->
          <mat-card
            appearance="filled"
            class="min-w-0 [--card-border-radius:var(--radius-2xl)] [--card-surface-padding:--spacing(6)] sm:[--card-surface-padding:--spacing(12)] lg:col-span-2 print:[--card-bg-color:transparent] print:[--card-border-color:transparent] print:[--card-padding:0] print:[--card-shadow-color:transparent] print:[--card-surface-padding:0]"
          >
            <mat-card-content class="@container flex flex-col gap-y-10">
              <!-- Letterhead -->
              <div
                class="flex flex-col gap-6 @lg:flex-row @lg:items-start @lg:justify-between"
              >
                <div class="inline-flex items-center gap-x-3">
                  <div
                    class="flex size-9 items-center justify-center rounded-xl border bg-neutral-a3 p-1.5"
                  >
                    <img
                      ngSrc="/images/logo/logomark.svg"
                      width="32"
                      height="32"
                      alt="Fuse logo"
                    />
                  </div>
                  <div class="flex flex-col gap-y-0.5">
                    <div
                      class="text-2xl leading-none font-bold tracking-tighter"
                    >
                      FUSE
                    </div>
                    <div
                      class="text-xs leading-none font-medium text-neutral-a10"
                    >
                      by BuilderKit
                    </div>
                  </div>
                </div>

                <div class="flex flex-col text-neutral-a11 @lg:text-end">
                  <div class="font-medium text-neutral-12">
                    Fuse Outdoor Co.
                  </div>
                  <div>820 SE Belmont St</div>
                  <div>Portland, OR 97214</div>
                  <div>billing&#64;example.com</div>
                </div>
              </div>

              <!-- Title -->
              <div class="flex flex-col gap-y-1">
                <div class="text-3xl font-semibold tracking-tighter">
                  Invoice
                </div>
                <div class="text-neutral-a11 tabular-nums">
                  {{ invoice.id }}
                </div>
              </div>

              <!-- Parties -->
              <div class="grid gap-6 @lg:grid-cols-2">
                <div class="flex flex-col">
                  <div class="mb-1 text-sm text-neutral-a11">Bill to</div>
                  <div class="font-medium">{{ invoice.customer.name }}</div>
                  <div>{{ invoice.billingAddress.street }}</div>
                  <div>{{ invoice.billingAddress.city }}</div>
                  <div>{{ invoice.billingAddress.country }}</div>
                  <div class="text-neutral-a11">
                    {{ invoice.customer.email }}
                  </div>
                </div>

                <div
                  class="grid grid-cols-[6rem_1fr] content-start items-center gap-x-4 gap-y-2"
                >
                  <div class="text-neutral-a11">Issued</div>
                  <div class="tabular-nums">
                    {{ invoice.issuedAt | date: 'MMM d, y' }}
                  </div>

                  <div class="text-neutral-a11">Due</div>
                  <div class="tabular-nums">
                    {{ invoice.dueAt | date: 'MMM d, y' }}
                  </div>

                  <div class="text-neutral-a11">Order</div>
                  <div class="tabular-nums">#{{ invoice.order.id }}</div>

                  <div class="text-neutral-a11">Status</div>
                  <invoice-status-tag [status]="invoice.status" />
                </div>
              </div>

              <!-- Items -->
              <div class="flex flex-col gap-y-6">
                <table
                  class="[&_:is(th,td):first-child]:ps-0 [&_:is(th,td):last-child]:pe-0"
                  mat-table
                  [dataSource]="invoice.items"
                >
                  <!-- Item column -->
                  <ng-container matColumnDef="item">
                    <th
                      mat-header-cell
                      *matHeaderCellDef
                    >
                      Item
                    </th>
                    <td
                      class="py-2.5"
                      mat-cell
                      *matCellDef="let row"
                    >
                      <div class="font-medium">{{ row.name }}</div>
                      <div class="text-sm text-neutral-a11">
                        {{ row.variant }} · {{ row.sku }}
                      </div>
                    </td>
                  </ng-container>

                  <!-- Quantity column -->
                  <ng-container matColumnDef="quantity">
                    <th
                      class="w-16 text-end"
                      mat-header-cell
                      *matHeaderCellDef
                    >
                      Qty
                    </th>
                    <td
                      class="text-end tabular-nums"
                      mat-cell
                      *matCellDef="let row"
                    >
                      {{ row.quantity }}
                    </td>
                  </ng-container>

                  <!-- Unit price column -->
                  <ng-container matColumnDef="price">
                    <th
                      class="hidden w-28 text-end whitespace-nowrap @lg:table-cell"
                      mat-header-cell
                      *matHeaderCellDef
                    >
                      Unit price
                    </th>
                    <td
                      class="hidden text-end tabular-nums @lg:table-cell"
                      mat-cell
                      *matCellDef="let row"
                    >
                      {{ row.price | currency: 'USD' : 'symbol' : '1.2-2' }}
                    </td>
                  </ng-container>

                  <!-- Amount column -->
                  <ng-container matColumnDef="amount">
                    <th
                      class="w-28 text-end"
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
                      {{
                        row.price * row.quantity
                          | currency: 'USD' : 'symbol' : '1.2-2'
                      }}
                    </td>
                  </ng-container>

                  <!-- Header row definition -->
                  <tr
                    mat-header-row
                    *matHeaderRowDef="itemColumns"
                  ></tr>

                  <!-- Row definition -->
                  <tr
                    class="break-inside-avoid"
                    mat-row
                    *matRowDef="let row; columns: itemColumns"
                  ></tr>
                </table>

                <!-- Totals -->
                <div
                  class="ms-auto flex w-full max-w-xs break-inside-avoid flex-col gap-y-2"
                >
                  <div class="flex items-center gap-x-1">
                    <div class="text-neutral-a11">Subtotal</div>
                    <div class="flex-auto"></div>
                    <div class="tabular-nums">
                      {{
                        invoice.subtotal | currency: 'USD' : 'symbol' : '1.2-2'
                      }}
                    </div>
                  </div>
                  @if (invoice.discount) {
                    <div class="flex items-center gap-x-1">
                      <div class="text-neutral-a11">
                        Discount ({{ invoice.discountCode }})
                      </div>
                      <div class="flex-auto"></div>
                      <div class="tabular-nums">
                        -{{
                          invoice.discount
                            | currency: 'USD' : 'symbol' : '1.2-2'
                        }}
                      </div>
                    </div>
                  }
                  <div class="flex items-center gap-x-1">
                    <div class="text-neutral-a11">Tax</div>
                    <div class="flex-auto"></div>
                    <div class="tabular-nums">
                      {{ invoice.tax | currency: 'USD' : 'symbol' : '1.2-2' }}
                    </div>
                  </div>
                  <div class="flex items-center gap-x-1">
                    <div class="text-neutral-a11">Shipping</div>
                    <div class="flex-auto"></div>
                    <div class="tabular-nums">
                      {{
                        invoice.shipping | currency: 'USD' : 'symbol' : '1.2-2'
                      }}
                    </div>
                  </div>
                  <div
                    class="flex items-center gap-x-1 border-t border-neutral-a4 pt-2 font-semibold"
                  >
                    <div>Total</div>
                    <div class="flex-auto"></div>
                    <div class="tabular-nums">
                      {{ invoice.total | currency: 'USD' : 'symbol' : '1.2-2' }}
                    </div>
                  </div>
                  <div class="flex items-center gap-x-1">
                    <div class="text-neutral-a11">Amount paid</div>
                    <div class="flex-auto"></div>
                    <div class="tabular-nums">
                      {{ invoice.paid | currency: 'USD' : 'symbol' : '1.2-2' }}
                    </div>
                  </div>
                  @if (invoice.refunded) {
                    <div class="flex items-center gap-x-1">
                      <div class="text-neutral-a11">Refunded</div>
                      <div class="flex-auto"></div>
                      <div class="tabular-nums">
                        -{{
                          invoice.refunded
                            | currency: 'USD' : 'symbol' : '1.2-2'
                        }}
                      </div>
                    </div>
                  }
                  <div
                    class="flex items-center gap-x-1 border-t border-neutral-a4 pt-2 text-lg font-semibold"
                  >
                    <div>Balance due</div>
                    <div class="flex-auto"></div>
                    <div class="tabular-nums">
                      {{
                        invoice.balance | currency: 'USD' : 'symbol' : '1.2-2'
                      }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Note -->
              <div
                class="flex break-inside-avoid flex-col gap-y-1 border-t border-neutral-a4 pt-6 text-sm text-neutral-a11"
              >
                <div>
                  Payment is due within {{ terms }} days of the issue date.
                </div>
                <div>
                  Thank you for shopping with Fuse Outdoor Co. Questions about
                  this invoice? Write to billing&#64;example.com.
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Side column -->
          <div class="flex min-w-0 flex-col gap-4 sm:gap-6 print:hidden">
            <!-- Summary -->
            <mat-card
              appearance="filled"
              class="@container flex flex-col"
            >
              <mat-card-header>
                <div class="flex flex-auto items-center gap-x-2">
                  <mat-icon
                    class="size-4"
                    svgIcon="receipt-text"
                  />
                  <div class="font-medium tracking-tight">Summary</div>
                </div>
              </mat-card-header>
              <mat-card-content
                class="grid grid-cols-1 items-center gap-x-4 gap-y-3 @xs:grid-cols-[6rem_1fr]"
              >
                <div class="text-neutral-a11">Status</div>
                <invoice-status-tag [status]="invoice.status" />

                <div class="text-neutral-a11">Due</div>
                <div class="tabular-nums">
                  @if (invoice.status === 'overdue') {
                    <span class="text-red-a11">
                      {{ invoice.dueAt | date: 'MMM d, y' }},
                      {{ overdueBy(invoice.dueAt) }} overdue
                    </span>
                  } @else {
                    {{ invoice.dueAt | date: 'MMM d, y' }}
                  }
                </div>

                <div class="text-neutral-a11">Amount</div>
                <div class="tabular-nums">
                  {{ invoice.total | currency: 'USD' : 'symbol' : '1.2-2' }}
                </div>

                <div class="text-neutral-a11">Balance due</div>
                <div class="font-medium tabular-nums">
                  {{ invoice.balance | currency: 'USD' : 'symbol' : '1.2-2' }}
                </div>
              </mat-card-content>
            </mat-card>

            <!-- Payment history -->
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
                  <div class="font-medium tracking-tight">Payment history</div>
                  <div class="ms-auto text-sm text-neutral-a11 tabular-nums">
                    {{ invoice.payments.length }}
                  </div>
                </div>
              </mat-card-header>
              <mat-card-content class="flex flex-col py-0">
                @for (
                  payment of invoice.payments;
                  track payment.id;
                  let last = $last
                ) {
                  <div class="flex items-center gap-x-3 py-2.5">
                    <div
                      class="flex size-9 shrink-0 items-center justify-center rounded-md bg-neutral-a3 text-neutral-a11"
                    >
                      <mat-icon
                        class="size-4"
                        [svgIcon]="
                          payment.kind === 'refund' ? 'undo-2' : 'banknote'
                        "
                      />
                    </div>
                    <div class="flex min-w-0 flex-auto flex-col">
                      <div class="truncate font-medium">
                        {{ payment.kind === 'refund' ? 'Refund' : 'Payment' }}
                      </div>
                      <div class="truncate text-sm text-neutral-a11">
                        {{ payment.date | date: 'MMM d, y' }} ·
                        {{ invoice.paymentMethod.label }}
                      </div>
                    </div>
                    <div class="shrink-0 font-medium tabular-nums">
                      {{ payment.kind === 'refund' ? '-' : ''
                      }}{{
                        payment.amount | currency: 'USD' : 'symbol' : '1.2-2'
                      }}
                    </div>
                  </div>

                  @if (!last) {
                    <mat-divider />
                  }
                } @empty {
                  <div class="py-4 text-neutral-a11">No payments yet.</div>
                }
              </mat-card-content>
            </mat-card>

            <!-- Related -->
            <mat-card
              appearance="filled"
              class="flex flex-col"
            >
              <mat-card-header>
                <div class="flex flex-auto items-center gap-x-2">
                  <mat-icon
                    class="size-4"
                    svgIcon="link"
                  />
                  <div class="font-medium tracking-tight">Related</div>
                </div>
              </mat-card-header>
              <mat-card-content class="flex flex-col gap-y-1 py-2">
                <a
                  class="-mx-2 flex cursor-pointer items-center gap-x-3 rounded-md px-2 py-2 hover:bg-neutral-a2"
                  [routerLink]="['/orders', invoice.order.id]"
                >
                  <mat-icon
                    class="size-4 shrink-0 text-neutral-a11"
                    svgIcon="shopping-bag"
                  />
                  <div class="flex min-w-0 flex-auto flex-col">
                    <div class="font-medium tabular-nums">
                      Order #{{ invoice.order.id }}
                    </div>
                    <div class="text-sm text-neutral-a11 tabular-nums">
                      Placed {{ invoice.order.placedAt | date: 'MMM d, y' }}
                    </div>
                  </div>
                  <mat-icon
                    class="size-4 shrink-0 text-neutral-a8"
                    svgIcon="chevron-right"
                  />
                </a>
                <a
                  class="-mx-2 flex cursor-pointer items-center gap-x-3 rounded-md px-2 py-2 hover:bg-neutral-a2"
                  [routerLink]="['/customers', invoice.customer.id]"
                >
                  <mat-icon
                    class="size-4 shrink-0 text-neutral-a11"
                    svgIcon="user-round"
                  />
                  <div class="flex min-w-0 flex-auto flex-col">
                    <div class="truncate font-medium">
                      {{ invoice.customer.name }}
                    </div>
                    <div class="truncate text-sm text-neutral-a11">
                      {{ invoice.customer.email }}
                    </div>
                  </div>
                  <mat-icon
                    class="size-4 shrink-0 text-neutral-a8"
                    svgIcon="chevron-right"
                  />
                </a>
              </mat-card-content>
            </mat-card>

            <!-- Activity -->
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
                  <div class="font-medium tracking-tight">Activity</div>
                </div>
              </mat-card-header>
              <mat-card-content>
                <ul class="flex flex-col">
                  @for (
                    entry of invoice.activity;
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
                            [svgIcon]="activityIcon(entry)"
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
        </div>
      </div>

      <!-- Record payment -->
      <invoice-record-payment
        [balance]="invoice.balance"
        [(open)]="recordPaymentOpen"
      />
    }
  `,
})
export default class Invoice {
  // Dependencies
  private invoicesService = inject(InvoicesService);
  private router = inject(Router);
  private window = inject(WINDOW);

  // Inputs / Outputs
  readonly id = input.required<string>();

  // State
  private terms = TERMS;
  private itemColumns = ['item', 'quantity', 'price', 'amount'];
  private recordPaymentOpen = signal(false);

  // Computed state
  private invoice = computed(() => this.invoicesService.byId(this.id()));

  constructor() {
    effect(() => {
      if (!this.invoice()) {
        this.router.navigate(['/invoices']);
      }
    });
  }

  private print() {
    this.window?.print();
  }

  private overdueBy(date: string) {
    return formatDistanceToNowStrict(date, { unit: 'day' });
  }

  private activityIcon(entry: InvoiceEvent) {
    switch (entry.type) {
      case 'issued':
        return 'file-text';
      case 'sent':
        return 'send';
      case 'payment':
        return 'credit-card';
      case 'refund':
        return 'banknote-arrow-down';
      default:
        return 'triangle-alert';
    }
  }

  private formatDate(date: string) {
    if (differenceInSeconds(Date.now(), date) < 60) {
      return 'Just now';
    }

    return formatDistanceToNowStrict(date, { addSuffix: true });
  }
}
