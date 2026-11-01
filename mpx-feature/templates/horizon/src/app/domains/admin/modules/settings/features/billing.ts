import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatInput } from '@angular/material/input';
import { add } from 'date-fns';
import { AgentsService } from '@/app/domains/admin/modules/agents/data/agents';
import { SettingsEyebrow } from '@/app/domains/admin/modules/settings/ui/eyebrow';

@Component({
  selector: 'billing-settings',
  imports: [
    CurrencyPipe,
    DatePipe,
    MatButton,
    MatCard,
    MatCardContent,
    MatDivider,
    MatFormField,
    MatIcon,
    MatInput,
    SettingsEyebrow,
  ],
  template: `
    <div class="flex flex-col gap-y-10">
      <!-- Header -->
      <div class="flex flex-col gap-y-3">
        <settings-eyebrow />
        <div class="flex flex-col gap-y-0.5">
          <div class="text-2xl font-semibold tracking-tighter">Billing</div>
          <div class="text-neutral-a11">
            Your plan, agent seats, payment details and invoices.
          </div>
        </div>
      </div>

      <!-- Plan -->
      <section class="flex flex-col gap-y-3">
        <div class="flex flex-col gap-y-0.5">
          <div class="text-lg font-medium">Plan</div>
          <div class="text-neutral-a11">
            Your subscription and the seats it covers.
          </div>
        </div>

        <mat-card>
          <mat-card-content class="flex flex-col gap-y-4">
            <!-- Team plan -->
            <div class="flex items-center gap-4">
              <div class="flex flex-auto flex-col">
                <div class="flex items-center gap-x-2">
                  <h3 class="font-medium">Team plan</h3>
                  <div
                    class="inline-flex items-center rounded-full border border-primary-a6 bg-primary-a3 px-2 py-px text-xs font-medium whitespace-nowrap text-primary-a11"
                  >
                    Current
                  </div>
                </div>
                <p class="text-sm text-neutral-a11">
                  {{ pricePerAgent | currency: 'USD' : 'symbol' : '1.0-0' }}
                  per agent a month · Renews on
                  {{ renewalDate | date: 'longDate' }}
                </p>
              </div>

              <button
                matButton
                type="button"
                class="small shrink-0"
              >
                <mat-icon svgIcon="arrow-up-down" />
                Change plan
              </button>
            </div>

            <mat-divider />

            <!-- Agent seats -->
            <div class="flex items-center gap-4">
              <div class="flex flex-auto flex-col">
                <h3 class="font-medium">Agent seats</h3>
                <p class="text-sm text-neutral-a11">
                  {{ agentsService.agents().length }} of {{ seats }} seats in
                  use
                </p>
              </div>

              <button
                matButton
                type="button"
                class="small shrink-0"
              >
                <mat-icon svgIcon="user-round-plus" />
                Add seats
              </button>
            </div>

            <mat-divider />

            <!-- Cancel subscription -->
            <div class="flex items-center gap-4">
              <div class="flex flex-auto flex-col">
                <h3 class="font-medium">Cancel subscription</h3>
                <p class="text-sm text-neutral-a11">
                  Your team keeps access until the end of the billing period,
                  then moves to the Free plan
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
          </mat-card-content>
        </mat-card>
      </section>

      <!-- Payment -->
      <section class="flex flex-col gap-y-3">
        <div class="flex flex-col gap-y-0.5">
          <div class="text-lg font-medium">Payment</div>
          <div class="text-neutral-a11">How you pay and where invoices go.</div>
        </div>

        <mat-card>
          <mat-card-content class="flex flex-col gap-y-4">
            <!-- Payment method -->
            <div class="flex items-center gap-4">
              <div class="flex flex-auto flex-col">
                <h3 class="font-medium">Payment method</h3>
                <p class="text-sm text-neutral-a11">
                  Visa •••• 4242 · Expires
                  {{ paymentExpiryDate | date: 'MM/yy' }}
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
            <div
              class="flex flex-col items-start gap-4 sm:flex-row sm:items-center"
            >
              <div class="flex flex-auto flex-col">
                <h3 class="font-medium">Billing email</h3>
                <p class="text-sm text-neutral-a11">
                  Invoices and receipts go here
                </p>
              </div>

              <mat-form-field class="small w-full shrink-0 sm:w-56">
                <input
                  matInput
                  type="email"
                  aria-label="Billing email"
                  value="billing@example.com"
                />
              </mat-form-field>
            </div>

            <mat-divider />

            <!-- Billing address -->
            <div class="flex items-center gap-4">
              <div class="flex flex-auto flex-col">
                <h3 class="font-medium">Billing address</h3>
                <p class="text-sm text-neutral-a11">
                  Tideline, 123 Example Street, Austin, TX 78701, United States
                </p>
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
          </mat-card-content>
        </mat-card>
      </section>

      <!-- Invoices -->
      <section class="flex flex-col gap-y-3">
        <div class="flex items-end gap-4">
          <div class="flex flex-auto flex-col gap-y-0.5">
            <div class="text-lg font-medium">Invoices</div>
            <div class="text-neutral-a11">
              Plan invoices and receipts for your records.
            </div>
          </div>

          <button
            matButton
            type="button"
            class="small shrink-0"
          >
            <mat-icon svgIcon="calendar-clock" />
            View all
          </button>
        </div>

        <mat-card>
          <mat-card-content class="flex flex-col gap-y-4">
            @for (invoice of invoices; track $index; let last = $last) {
              <div class="flex items-center gap-4">
                <div class="flex flex-auto flex-col">
                  <h3 class="font-medium">
                    {{ invoice.plan }} plan ·
                    {{ invoice.amount | currency: 'USD' : 'symbol' : '1.2-2' }}
                  </h3>
                  <p class="text-sm text-neutral-a11">
                    {{ invoice.date | date: 'mediumDate' }} ·
                    {{ invoice.status }}
                  </p>
                </div>

                @if (invoice.status === 'Paid') {
                  <button
                    matButton
                    type="button"
                    class="small shrink-0"
                  >
                    <mat-icon svgIcon="download" />
                    Download
                  </button>
                }
              </div>

              @if (!last) {
                <mat-divider />
              }
            }
          </mat-card-content>
        </mat-card>
      </section>
    </div>
  `,
})
export default class BillingSettings {
  // Dependencies
  private agentsService = inject(AgentsService);

  // State
  private pricePerAgent = 19;
  private seats = 10;
  private renewalDate = add(new Date(), { months: 1 });
  private paymentExpiryDate = add(new Date(), { months: 18 });
  private invoices = [
    {
      date: new Date(),
      amount: 190.0,
      status: 'Pending',
      plan: 'Team',
    },
    {
      date: add(new Date(), { months: -1 }),
      amount: 190.0,
      status: 'Paid',
      plan: 'Team',
    },
    {
      date: add(new Date(), { months: -2 }),
      amount: 190.0,
      status: 'Paid',
      plan: 'Team',
    },
    {
      date: add(new Date(), { months: -3 }),
      amount: 190.0,
      status: 'Paid',
      plan: 'Team',
    },
    {
      date: add(new Date(), { months: -4 }),
      amount: 190.0,
      status: 'Paid',
      plan: 'Team',
    },
    {
      date: add(new Date(), { months: -5 }),
      amount: 190.0,
      status: 'Paid',
      plan: 'Team',
    },
  ];
}
