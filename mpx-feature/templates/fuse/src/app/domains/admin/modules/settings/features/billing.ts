import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { MatTooltip } from '@angular/material/tooltip';
import { add } from 'date-fns';

type Invoice = {
  id: string;
  date: Date;
  plan: string;
  amount: number;
  status: 'Paid' | 'Pending';
};

const now = new Date();

const INVOICES: Invoice[] = [
  {
    id: 'inv-1052',
    date: add(now, { months: -1 }),
    plan: 'Pro · Monthly',
    amount: 348,
    status: 'Pending',
  },
  {
    id: 'inv-1049',
    date: add(now, { months: -1, days: -9 }),
    plan: 'AI credits · 5,000',
    amount: 40,
    status: 'Paid',
  },
  {
    id: 'inv-1031',
    date: add(now, { months: -2 }),
    plan: 'Pro · Monthly',
    amount: 132,
    status: 'Paid',
  },
  {
    id: 'inv-1017',
    date: add(now, { months: -3 }),
    plan: 'Pro · Monthly',
    amount: 96,
    status: 'Paid',
  },
  {
    id: 'inv-1002',
    date: add(now, { months: -4 }),
    plan: 'Pro · Monthly',
    amount: 72,
    status: 'Paid',
  },
  {
    id: 'inv-0986',
    date: add(now, { months: -5 }),
    plan: 'Starter · Monthly',
    amount: 29,
    status: 'Paid',
  },
];

@Component({
  selector: 'settings-billing',
  imports: [
    CurrencyPipe,
    DatePipe,
    DecimalPipe,
    MatButton,
    MatDivider,
    MatIcon,
    MatIconButton,
    MatProgressBar,
    MatSlideToggle,
    MatTableModule,
    MatTooltip,
  ],
  host: {
    class: 'flex flex-auto flex-col',
  },
  template: `
    <div class="flex flex-auto flex-col gap-y-10">
      <!-- Plan -->
      <section class="grid gap-x-10 gap-y-8 sm:grid-cols-3">
        <div class="flex flex-col gap-y-0.5">
          <div class="text-lg font-semibold">Plan</div>
          <div class="text-neutral-a11">
            Your subscription and the seats it covers
          </div>
        </div>

        <div class="flex flex-col gap-y-4 sm:col-span-2">
          <!-- Pro plan -->
          <div class="flex items-center gap-4">
            <div class="flex flex-auto flex-col">
              <div class="flex items-center gap-x-2">
                <h3 class="font-medium">Pro plan</h3>
                <div
                  class="rounded-lg bg-primary-a3 px-2 py-0.5 text-sm font-medium text-primary-a11"
                >
                  Current
                </div>
              </div>
              <p class="text-sm text-neutral-a11">
                {{ pricePerMember | currency: 'USD' : 'symbol' : '1.0-0' }} per
                member a month · Renews on {{ renewalDate | date: 'longDate' }}
              </p>
            </div>

            <button
              matButton
              type="button"
              class="small shrink-0"
            >
              <mat-icon svgIcon="arrow-up-down" />
              Change
            </button>
          </div>

          <mat-divider />

          <!-- Seats -->
          <div class="flex flex-col gap-4">
            <div class="flex items-center gap-4">
              <div class="flex flex-auto flex-col">
                <h3 class="font-medium">Seats</h3>
                <p class="text-sm text-neutral-a11">
                  {{ seats.used }} of {{ seats.total }} seats in use
                </p>
              </div>

              <button
                matButton
                type="button"
                class="small shrink-0"
              >
                <mat-icon svgIcon="users" />
                Manage
              </button>
            </div>

            <mat-progress-bar
              aria-label="Seats in use"
              [value]="(seats.used / seats.total) * 100"
            />
          </div>

          <mat-divider />

          <!-- Cancel subscription -->
          <div class="flex items-center gap-4">
            <div class="flex flex-auto flex-col">
              <h3 class="font-medium">Cancel subscription</h3>
              <p class="text-sm text-neutral-a11">
                Pro stays active until {{ renewalDate | date: 'longDate' }},
                then the workspace moves to the Free plan
              </p>
            </div>

            <button
              matButton
              type="button"
              class="primary destructive small shrink-0"
            >
              <mat-icon svgIcon="circle-x" />
              Cancel
            </button>
          </div>
        </div>
      </section>

      <!-- Divider -->
      <mat-divider />

      <!-- AI credits -->
      <section class="grid gap-x-10 gap-y-8 sm:grid-cols-3">
        <div class="flex flex-col gap-y-0.5">
          <div class="text-lg font-semibold">AI credits</div>
          <div class="text-neutral-a11">
            Usage for AI features across the workspace
          </div>
        </div>

        <div class="flex flex-col gap-y-4 sm:col-span-2">
          <!-- Monthly allowance -->
          <div class="flex flex-col gap-4">
            <div class="flex items-center gap-4">
              <div class="flex flex-auto flex-col">
                <h3 class="font-medium">Monthly allowance</h3>
                <p class="text-sm text-neutral-a11">
                  {{ credits.used | number }} of
                  {{ credits.total | number }} used this month · Resets on
                  {{ renewalDate | date: 'longDate' }}
                </p>
              </div>

              <button
                matButton
                type="button"
                class="small shrink-0"
              >
                <mat-icon svgIcon="sparkles" />
                Buy credits
              </button>
            </div>

            <mat-progress-bar
              aria-label="AI credits used"
              [value]="(credits.used / credits.total) * 100"
            />
          </div>

          <mat-divider />

          <!-- Auto recharge -->
          <mat-slide-toggle
            class="[--slide-toggle-gap-x:1rem]"
            fullWidth
            labelPosition="before"
            [checked]="autoRecharge()"
            (change)="autoRecharge.set($event.checked)"
          >
            <div class="flex flex-col">
              <div class="font-medium">Auto recharge</div>
              <div class="text-sm text-neutral-a11">
                Buys {{ creditPack.credits | number }} credits for
                {{ creditPack.price | currency: 'USD' : 'symbol' : '1.0-0' }}
                when your balance runs low
              </div>
            </div>
          </mat-slide-toggle>
        </div>
      </section>

      <!-- Divider -->
      <mat-divider />

      <!-- Payment -->
      <section class="grid gap-x-10 gap-y-8 sm:grid-cols-3">
        <div class="flex flex-col gap-y-0.5">
          <div class="text-lg font-semibold">Payment</div>
          <div class="text-neutral-a11">How you pay and where invoices go</div>
        </div>

        <div class="flex flex-col gap-y-4 sm:col-span-2">
          <!-- Payment method -->
          <div class="flex items-center gap-4">
            <div class="flex flex-auto flex-col">
              <h3 class="font-medium">Payment method</h3>
              <p class="text-sm text-neutral-a11">
                {{ card.brand }} •••• {{ card.last4 }} · Expires
                {{ card.expiryDate | date: 'MM/yy' }}
              </p>
            </div>

            <button
              matButton
              type="button"
              class="small shrink-0"
            >
              <mat-icon svgIcon="credit-card" />
              Update
            </button>
          </div>

          <mat-divider />

          <!-- Billing email -->
          <div class="flex items-center gap-4">
            <div class="flex flex-auto flex-col">
              <h3 class="font-medium">Billing email</h3>
              <p class="text-sm text-neutral-a11">
                Invoices and receipts go to {{ billingEmail }}
              </p>
            </div>

            <button
              matButton
              type="button"
              class="small shrink-0"
            >
              <mat-icon svgIcon="mail" />
              Change
            </button>
          </div>

          <mat-divider />

          <!-- Billing address -->
          <div class="flex flex-col gap-4">
            <div class="flex items-center gap-4">
              <div class="flex flex-auto flex-col">
                <h3 class="font-medium">Billing address</h3>
                <p class="text-sm text-neutral-a11">Printed on every invoice</p>
              </div>

              <button
                matButton
                type="button"
                class="small shrink-0"
              >
                <mat-icon svgIcon="square-pen" />
                Edit
              </button>
            </div>

            <div class="flex flex-col">
              <div class="font-medium">Example Labs</div>
              <div class="text-neutral-a11">123 Example Street, Suite 400</div>
              <div class="text-neutral-a11">
                Austin, TX 78701, United States
              </div>
              <div class="text-neutral-a11">EIN XX-XXXXXXX</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Divider -->
      <mat-divider />

      <!-- Billing history -->
      <div class="flex flex-col gap-y-6">
        <div class="flex items-center gap-4">
          <div class="flex flex-auto flex-col gap-y-0.5">
            <div class="text-lg font-semibold">Billing history</div>
            <div class="text-neutral-a11">
              Plan invoices and credit packs from the last five months
            </div>
          </div>

          <button
            matButton
            type="button"
            class="small shrink-0"
          >
            <mat-icon svgIcon="calendar-clock" />
            View
          </button>
        </div>

        <div class="overflow-x-auto">
          <table
            mat-table
            [dataSource]="invoices"
          >
            <!-- Mobile Details Column -->
            <ng-container matColumnDef="details">
              <th
                class="sm:hidden"
                mat-header-cell
                *matHeaderCellDef
              >
                Details
              </th>
              <td
                class="sm:hidden"
                mat-cell
                *matCellDef="let row"
              >
                <div class="flex flex-col gap-y-0.5 py-3">
                  <div class="whitespace-nowrap">
                    {{ row.date | date: 'mediumDate' }}
                  </div>
                  <div class="whitespace-nowrap text-neutral-a10">
                    {{ row.plan }}
                  </div>
                  <div class="whitespace-nowrap text-neutral-a11 tabular-nums">
                    {{ row.amount | currency: 'USD' : 'symbol' : '1.2-2' }}
                  </div>
                </div>
              </td>
            </ng-container>

            <!-- Date -->
            <ng-container matColumnDef="date">
              <th
                class="hidden sm:table-cell"
                mat-header-cell
                *matHeaderCellDef
              >
                Date
              </th>
              <td
                class="hidden sm:table-cell"
                mat-cell
                *matCellDef="let row"
              >
                {{ row.date | date: 'mediumDate' }}
              </td>
            </ng-container>

            <!-- Plan -->
            <ng-container matColumnDef="plan">
              <th
                class="hidden sm:table-cell"
                mat-header-cell
                *matHeaderCellDef
              >
                Item
              </th>
              <td
                class="hidden sm:table-cell"
                mat-cell
                *matCellDef="let row"
              >
                {{ row.plan }}
              </td>
            </ng-container>

            <!-- Amount -->
            <ng-container matColumnDef="amount">
              <th
                class="hidden sm:table-cell"
                mat-header-cell
                *matHeaderCellDef
              >
                Amount
              </th>
              <td
                class="hidden sm:table-cell"
                mat-cell
                *matCellDef="let row"
              >
                {{ row.amount | currency: 'USD' : 'symbol' : '1.2-2' }}
              </td>
            </ng-container>

            <!-- Status -->
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
                <span
                  class="rounded-lg px-2 py-0.5 text-center text-sm font-medium"
                  [class.bg-green-a3]="row.status === 'Paid'"
                  [class.text-green-a11]="row.status === 'Paid'"
                  [class.bg-amber-a3]="row.status === 'Pending'"
                  [class.text-amber-a11]="row.status === 'Pending'"
                >
                  {{ row.status }}
                </span>
              </td>
            </ng-container>

            <!-- Invoice -->
            <ng-container matColumnDef="invoice">
              <th
                mat-header-cell
                *matHeaderCellDef
                class="w-20 text-center"
              >
                Invoice
              </th>
              <td
                mat-cell
                *matCellDef="let row"
              >
                @if (row.status === 'Paid') {
                  <button
                    class="small mx-auto"
                    type="button"
                    matIconButton
                    matTooltip="Download invoice"
                  >
                    <mat-icon svgIcon="download" />
                  </button>
                } @else {
                  <div class="text-center text-neutral-a8">—</div>
                }
              </td>
            </ng-container>

            <!-- Header and Row Declarations -->
            <tr
              mat-header-row
              *matHeaderRowDef="invoiceColumns"
            ></tr>
            <tr
              mat-row
              *matRowDef="let row; columns: invoiceColumns"
            ></tr>
          </table>
        </div>
      </div>
    </div>
  `,
})
export default class SettingsBilling {
  // State
  private invoices = INVOICES;
  private invoiceColumns = [
    'details',
    'date',
    'plan',
    'amount',
    'status',
    'invoice',
  ];
  private pricePerMember = 12;
  private renewalDate = add(now, { days: 12 });
  private seats = { used: 29, total: 40 };
  private credits = { used: 8400, total: 10000 };
  private creditPack = { credits: 5000, price: 40 };
  private autoRecharge = signal(true);
  private card = {
    brand: 'Visa',
    last4: '4242',
    expiryDate: add(now, { months: 18 }),
  };
  private billingEmail = 'billing@example.com';
}
