import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatSlideToggle } from '@angular/material/slide-toggle';

@Component({
  selector: 'settings-billing',
  imports: [
    CurrencyPipe,
    DatePipe,
    DecimalPipe,
    MatButton,
    MatDivider,
    MatIcon,
    MatProgressBar,
    MatSlideToggle,
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
          <div class="flex flex-col gap-4">
            <div class="flex items-center gap-4">
              <div class="flex flex-auto flex-col">
                <h3 class="font-medium">Monthly allowance</h3>
                <p class="text-sm text-neutral-a11">
                  {{ credits.used | number }} of
                  {{ credits.total | number }} used this month
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
                Automatically recharges credits when your balance runs low
              </div>
            </div>
          </mat-slide-toggle>
        </div>
      </section>
    </div>
  `,
})
export default class SettingsBilling {
  protected readonly pricePerMember = 12;
  protected readonly renewalDate = new Date(Date.now() + 12 * 86400000);
  protected readonly seats = { used: 29, total: 40 };
  protected readonly credits = { used: 8400, total: 10000 };
  protected readonly autoRecharge = signal(true);
}

