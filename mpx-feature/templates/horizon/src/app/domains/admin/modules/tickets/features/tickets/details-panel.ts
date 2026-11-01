import { DatePipe, LowerCasePipe, TitleCasePipe } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { CustomersService } from '@/app/domains/admin/modules/customers/data/customers';
import {
  CHANNELS,
  Ticket,
  TicketsService,
} from '@/app/domains/admin/modules/tickets/data/tickets';
import { TicketBuckets } from '@/app/domains/admin/modules/tickets/ui/buckets';
import { TicketStatusPill } from '@/app/domains/admin/modules/tickets/ui/pills';

@Component({
  selector: 'tickets-details-panel',
  imports: [
    DatePipe,
    LowerCasePipe,
    MatDivider,
    MatIcon,
    RouterLink,
    TicketBuckets,
    TicketStatusPill,
    TitleCasePipe,
  ],
  host: {
    class: 'flex h-fit min-w-0 flex-auto flex-col gap-y-6 p-5',
  },
  template: `
    <!-- Ticket -->
    <div class="flex flex-col gap-y-2">
      <div class="font-medium">Ticket #{{ ticket().id }}</div>
      <div class="flex items-center gap-x-2">
        <mat-icon
          class="size-4 shrink-0 text-neutral-a11"
          [svgIcon]="channel().icon"
        />
        <div class="truncate">Via {{ channel().label | lowercase }}</div>
      </div>
      <div class="flex items-center gap-x-2">
        <mat-icon
          class="size-4 shrink-0 text-neutral-a11"
          svgIcon="tag"
        />
        <ticket-buckets [buckets]="ticket().buckets" />
      </div>
    </div>

    <mat-divider />

    <!-- Customer -->
    <div class="flex flex-col gap-y-2">
      <div class="font-medium">Customer</div>
      <div class="flex items-center gap-x-2">
        <mat-icon
          class="size-4 shrink-0 text-neutral-a11"
          svgIcon="user-round"
        />
        <a
          class="truncate hover:underline"
          [routerLink]="['/customers', customer().id]"
        >
          {{ customer().name }}
        </a>
        @if (customer().vip) {
          <div
            class="inline-flex items-center rounded-full border border-amber-a6 bg-amber-a3 px-2 py-px text-xs font-medium whitespace-nowrap text-amber-a11"
          >
            VIP
          </div>
        }
      </div>
      <div class="flex items-center gap-x-2">
        <mat-icon
          class="size-4 shrink-0 text-neutral-a11"
          svgIcon="mail"
        />
        <div class="truncate">{{ customer().email }}</div>
      </div>
      @if (organization(); as organization) {
        <div class="flex items-center gap-x-2">
          <mat-icon
            class="size-4 shrink-0 text-neutral-a11"
            svgIcon="building"
          />
          <div class="truncate">
            {{ organization.name }} · {{ organization.plan | titlecase }} plan
          </div>
        </div>
      }
      <div class="flex items-center gap-x-2">
        <mat-icon
          class="size-4 shrink-0 text-neutral-a11"
          svgIcon="map-pin"
        />
        <div class="truncate">{{ customer().location }}</div>
      </div>
      <div class="flex items-center gap-x-2">
        <mat-icon
          class="size-4 shrink-0 text-neutral-a11"
          svgIcon="clock"
        />
        <div class="truncate">{{ localTime() }} local time</div>
      </div>
      <div class="flex items-center gap-x-2">
        <mat-icon
          class="size-4 shrink-0 text-neutral-a11"
          svgIcon="calendar"
        />
        <div class="truncate">
          Customer since {{ customer().since | date: 'MMM d, y' }}
        </div>
      </div>
    </div>

    <mat-divider />

    <!-- Summary -->
    <div class="flex flex-col gap-y-2">
      <div class="flex items-center gap-x-2">
        <mat-icon
          class="size-4"
          svgIcon="sparkles"
        />
        <div class="font-medium">Summary</div>
      </div>
      <p>{{ ticket().summary }}</p>
    </div>

    <mat-divider />

    <!-- Previous conversations -->
    <div class="flex flex-col gap-y-2">
      <div class="font-medium">Previous conversations</div>
      <div class="flex flex-col gap-y-1">
        @for (item of previous(); track item.id; let last = $last) {
          <a
            class="-mx-3 flex flex-col gap-y-0.5 rounded-lg p-3 hover:bg-neutral-a3"
            [routerLink]="['/tickets', item.id]"
          >
            <div class="truncate">{{ item.subject }}</div>
            <div class="flex items-center gap-x-2 text-sm text-neutral-a11">
              <div class="tabular-nums">#{{ item.id }}</div>
              ·
              <ticket-status-pill [status]="item.status" />
              ·
              <div class="truncate">
                {{ item.createdAt | date: 'MMM d, y' }}
              </div>
            </div>
          </a>
        } @empty {
          <div class="text-neutral-a9">No previous conversations.</div>
        }
      </div>
    </div>
  `,
})
export class TicketsDetailsPanel {
  // Dependencies
  private customersService = inject(CustomersService);
  private ticketsService = inject(TicketsService);

  // Inputs / Outputs
  readonly ticket = input.required<Ticket>();

  // Computed state
  private channel = computed(() =>
    CHANNELS.find((item) => item.id === this.ticket().channel)!
  );
  private customer = computed(() =>
    this.customersService.byId(this.ticket().customerId)!
  );
  private organization = computed(() => {
    const organizationId = this.customer().organizationId;
    return organizationId
      ? this.customersService.organizationById(organizationId)
      : null;
  });
  private localTime = computed(() =>
    new Date().toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: this.customer().timezone,
    })
  );
  private previous = computed(() =>
    this.ticketsService
      .byCustomer(this.ticket().customerId)
      .filter((ticket) => ticket.id !== this.ticket().id)
  );
}
