import { DatePipe, SlicePipe } from '@angular/common';
import { Component, computed, effect, inject, input } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import {
  MatSidenav,
  MatSidenavContainer,
  MatSidenavContent,
} from '@angular/material/sidenav';
import { MatTooltip } from '@angular/material/tooltip';
import { Router, RouterLink } from '@angular/router';
import { Media } from '@/app/core/media';
import { CustomersService } from '@/app/domains/admin/modules/customers/data/customers';
import { CustomersDetailsPanel } from '@/app/domains/admin/modules/customers/features/customers/details-panel';
import {
  STATUSES,
  TicketsService,
} from '@/app/domains/admin/modules/tickets/data/tickets';
import { TicketStatusPill } from '@/app/domains/admin/modules/tickets/ui/pills';

@Component({
  selector: 'customer',
  imports: [
    CustomersDetailsPanel,
    DatePipe,
    MatDivider,
    MatIcon,
    MatIconButton,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    MatSidenav,
    MatSidenavContainer,
    MatSidenavContent,
    MatTooltip,
    RouterLink,
    SlicePipe,
    TicketStatusPill,
  ],
  host: {
    class: 'mx-auto flex h-dvh w-full max-w-7xl flex-col',
  },
  template: `
    @if (customer(); as customer) {
      <!-- Header -->
      <header
        class="mx-5 flex items-center gap-2 border-b border-neutral-a4 py-4"
      >
        <div class="-ms-2 flex min-w-0 items-center gap-x-3">
          <a
            matIconButton
            matTooltip="Customers"
            routerLink="/customers"
          >
            <mat-icon svgIcon="arrow-left" />
          </a>
          <div
            class="hidden size-10 shrink-0 items-center justify-center rounded-full bg-neutral-a3 text-xl font-medium text-neutral-a11 md:flex"
          >
            {{ customer.name | slice: 0 : 1 }}
          </div>
          <div class="flex min-w-0 flex-col">
            <div class="flex items-center gap-x-2">
              <div class="truncate text-2xl font-semibold tracking-tighter">
                {{ customer.name }}
              </div>
              @if (customer.vip) {
                <div
                  class="inline-flex items-center rounded-full border border-amber-a6 bg-amber-a3 px-2 py-px text-xs font-medium whitespace-nowrap text-amber-a11"
                >
                  VIP
                </div>
              }
            </div>
            <div class="truncate text-neutral-a11">{{ customer.email }}</div>
          </div>
        </div>

        <!-- Actions -->
        <div class="ms-auto -me-2 flex items-center gap-x-2">
          <button
            matIconButton
            matTooltip="More"
            [matMenuTriggerFor]="moreMenu"
          >
            <mat-icon svgIcon="ellipsis-vertical" />
          </button>
        </div>
      </header>

      <mat-sidenav-container class="min-h-0 flex-auto bg-transparent">
        <!-- Details panel -->
        <mat-sidenav
          class="w-80 bg-transparent"
          position="end"
          mode="side"
          disableClose
          [opened]="!isCompact()"
        >
          <customers-details-panel [customer]="customer" />
        </mat-sidenav>

        <mat-sidenav-content class="bg-transparent">
          <div class="flex min-h-0 flex-auto flex-col">
            <div class="flex min-h-0 flex-auto flex-col overflow-y-auto px-5">
              @if (isCompact()) {
                <!-- Details panel -->
                <customers-details-panel
                  class="flex-none"
                  [customer]="customer"
                />
                <mat-divider />
              }

              <!-- Tickets -->
              <div class="-mx-2 flex flex-col gap-y-1 py-3">
                @for (group of groups(); track group.id) {
                  <div
                    class="flex items-center gap-x-2 px-3 pt-3 pb-1 text-sm font-medium text-neutral-a11"
                  >
                    <ticket-status-pill [status]="group.id" />
                    <div class="tabular-nums">{{ group.tickets.length }}</div>
                  </div>
                  @for (ticket of group.tickets; track ticket.id) {
                    <a
                      class="flex flex-col gap-y-0.5 rounded-lg p-3 hover:bg-neutral-a3"
                      [routerLink]="['/tickets', ticket.id]"
                    >
                      <div class="truncate font-medium">
                        {{ ticket.subject }}
                      </div>
                      <div
                        class="flex items-center gap-x-2 text-sm text-neutral-a11"
                      >
                        <div class="tabular-nums">#{{ ticket.id }}</div>
                        ·
                        <div class="truncate">
                          Updated {{ ticket.updatedAt | date: 'MMM d, y' }}
                        </div>
                      </div>
                    </a>
                  }
                } @empty {
                  <div class="p-3 text-neutral-a9">No tickets yet.</div>
                }
              </div>
            </div>
          </div>
        </mat-sidenav-content>
      </mat-sidenav-container>

      <mat-menu
        xPosition="before"
        #moreMenu
      >
        <button mat-menu-item>
          <mat-icon svgIcon="pencil" />
          Edit
        </button>
        <mat-divider />
        <button mat-menu-item>
          <mat-icon svgIcon="ticket-plus" />
          New ticket
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
    }
  `,
})
export default class Customer {
  // Dependencies
  private customersService = inject(CustomersService);
  private ticketsService = inject(TicketsService);
  private media = inject(Media);
  private router = inject(Router);

  // Inputs / Outputs
  readonly id = input.required<string>();

  // State
  private isCompact = this.media.match(`(width < 64rem)`);

  // Computed state
  private customer = computed(() => this.customersService.byId(this.id()));
  private groups = computed(() => {
    const tickets = this.ticketsService
      .byCustomer(this.id())
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

    return STATUSES.map((status) => ({
      id: status.id,
      tickets: tickets.filter((ticket) => ticket.status === status.id),
    })).filter((group) => group.tickets.length);
  });

  constructor() {
    effect(() => {
      if (!this.customer()) {
        this.router.navigate(['/customers']);
      }
    });
  }
}
