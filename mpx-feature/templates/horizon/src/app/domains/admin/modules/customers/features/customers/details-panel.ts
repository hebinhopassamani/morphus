import { DatePipe, TitleCasePipe } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatTabLink, MatTabNav, MatTabNavPanel } from '@angular/material/tabs';
import {
  Customer,
  CustomersService,
} from '@/app/domains/admin/modules/customers/data/customers';
import {
  CHANNELS,
  PRIORITIES,
  TicketsService,
} from '@/app/domains/admin/modules/tickets/data/tickets';

type Breakdown = 'buckets' | 'channel' | 'priority';

const BREAKDOWN_OPTIONS: { id: Breakdown; label: string }[] = [
  {
    id: 'buckets',
    label: 'Buckets',
  },
  {
    id: 'channel',
    label: 'Channel',
  },
  {
    id: 'priority',
    label: 'Priority',
  },
];

@Component({
  selector: 'customers-details-panel',
  imports: [
    DatePipe,
    MatIcon,
    MatTabLink,
    MatTabNav,
    MatTabNavPanel,
    TitleCasePipe,
  ],
  host: {
    class: 'flex h-fit min-w-0 flex-auto flex-col gap-y-5 py-5 lg:px-5',
  },
  template: `
    <!-- Details -->
    <div class="flex flex-col gap-y-2">
      <div class="flex items-center gap-x-2">
        <div class="w-28 shrink-0 text-neutral-a11">Role</div>
        <div class="truncate">{{ customer().title }}</div>
      </div>
      <div class="flex items-center gap-x-2">
        <div class="w-28 shrink-0 text-neutral-a11">Location</div>
        <div class="truncate">{{ customer().location }}</div>
      </div>
      <div class="flex items-center gap-x-2">
        <div class="w-28 shrink-0 text-neutral-a11">Local time</div>
        <div class="truncate">{{ localTime() }}</div>
      </div>
      <div class="flex items-center gap-x-2">
        <div class="w-28 shrink-0 text-neutral-a11">Customer since</div>
        <div class="truncate">{{ customer().since | date: 'MMM d, y' }}</div>
      </div>
      @if (organization(); as organization) {
        <div class="flex items-center gap-x-2">
          <div class="w-28 shrink-0 text-neutral-a11">Organization</div>
          <div class="truncate">{{ organization.name }}</div>
        </div>
        <div class="flex items-center gap-x-2">
          <div class="w-28 shrink-0 text-neutral-a11">Website</div>
          <div class="truncate">{{ organization.domain }}</div>
        </div>
        <div class="flex items-center gap-x-2">
          <div class="w-28 shrink-0 text-neutral-a11">Plan</div>
          <div class="truncate">
            {{ organization.plan | titlecase }} plan ·
            {{ organization.seats }}
            {{ organization.seats === 1 ? 'seat' : 'seats' }}
          </div>
        </div>
      }
    </div>

    <!-- Breakdown -->
    <div class="flex flex-col">
      <nav
        mat-tab-nav-bar
        [tabPanel]="tabPanel"
        [mat-stretch-tabs]="false"
        ngSkipHydration
      >
        @for (option of breakdownOptions; track option.id) {
          <button
            mat-tab-link
            [active]="breakdown() === option.id"
            (click)="breakdown.set(option.id)"
          >
            {{ option.label }}
          </button>
        }
      </nav>

      <mat-tab-nav-panel
        class="flex flex-col gap-y-2 pt-4"
        #tabPanel
      >
        @for (row of breakdownRows(); track row.id) {
          <div class="flex items-center gap-x-2">
            @if (row.icon) {
              <mat-icon
                class="size-4 shrink-0"
                [class]="row.color"
                [svgIcon]="row.icon"
              />
            } @else {
              <div class="flex size-4 shrink-0 items-center justify-center">
                <div
                  class="size-2 rounded-full"
                  [class]="row.color"
                ></div>
              </div>
            }
            <div class="flex-auto truncate">{{ row.label }}</div>
            <div class="text-neutral-a11 tabular-nums">{{ row.count }}</div>
          </div>
        } @empty {
          <div class="text-neutral-a9">No tickets yet.</div>
        }
      </mat-tab-nav-panel>
    </div>
  `,
})
export class CustomersDetailsPanel {
  // Dependencies
  private customersService = inject(CustomersService);
  private ticketsService = inject(TicketsService);

  // Inputs / Outputs
  readonly customer = input.required<Customer>();

  // State
  private breakdownOptions = BREAKDOWN_OPTIONS;
  private breakdown = signal<Breakdown>('buckets');

  // Computed state
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
  private breakdownRows = computed(() => {
    const tickets = this.ticketsService.byCustomer(this.customer().id);
    const rows = {
      buckets: this.ticketsService.buckets().map((bucket) => ({
        id: bucket.id,
        label: bucket.name,
        icon: null,
        color: bucket.color,
        count: tickets.filter((ticket) => ticket.buckets.includes(bucket.id))
          .length,
      })),
      channel: CHANNELS.map((channel) => ({
        id: channel.id,
        label: channel.label,
        icon: channel.icon,
        color: 'text-neutral-a11',
        count: tickets.filter((ticket) => ticket.channel === channel.id).length,
      })),
      priority: PRIORITIES.map((priority) => ({
        id: priority.id,
        label: priority.label,
        icon: 'flag',
        color: priority.color,
        count: tickets.filter((ticket) => ticket.priority === priority.id)
          .length,
      })),
    }[this.breakdown()];

    return rows.filter((row) => row.count);
  });
}
