import { NgOptimizedImage } from '@angular/common';
import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import {
  MatFormField,
  MatInput,
  MatPrefix,
  MatSuffix,
} from '@angular/material/input';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import {
  MatSidenav,
  MatSidenavContainer,
  MatSidenavContent,
} from '@angular/material/sidenav';
import { MatTooltip } from '@angular/material/tooltip';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { format, isToday } from 'date-fns';
import { Media } from '@/app/core/media';
import { AgentsService } from '@/app/domains/admin/modules/agents/data/agents';
import { CustomersService } from '@/app/domains/admin/modules/customers/data/customers';
import {
  Bucket,
  Channel,
  CHANNELS,
  inQueue,
  PRIORITIES,
  Queue,
  Ticket,
  TicketPriority,
  TicketsService,
  VIEWS,
} from '@/app/domains/admin/modules/tickets/data/tickets';
import { TicketsDetailsPanel } from '@/app/domains/admin/modules/tickets/features/tickets/details-panel';
import TicketPanel from '@/app/domains/admin/modules/tickets/features/tickets/ticket';
import { TicketBucketDialog } from '@/app/domains/admin/modules/tickets/ui/bucket-dialog';
import { TicketStatusPill } from '@/app/domains/admin/modules/tickets/ui/pills';
import {
  BuiCombobox,
  BuiComboboxContent,
  BuiComboboxGroup,
  BuiComboboxGroupLabel,
  BuiComboboxListbox,
  BuiComboboxOption,
  BuiComboboxOptionIndicator,
  BuiComboboxPortal,
  BuiComboboxTrigger,
} from '@/app/ui/combobox';
import {
  BuiSidebar,
  BuiSidebarAction,
  BuiSidebarBadge,
  BuiSidebarBody,
  BuiSidebarButton,
  BuiSidebarHeader,
  BuiSidebarIcon,
  BuiSidebarLabel,
  BuiSidebarMenu,
  BuiSidebarMenuItem,
  BuiSidebarMenuRow,
  BuiSidebarSection,
  BuiSidebarSectionContent,
  BuiSidebarSectionHeader,
} from '@/app/ui/sidebar';
import { bui } from '@/app/ui/utils';

type SortOption = {
  label: string;
  compare: (a: Ticket, b: Ticket) => number;
};

const rank = (ticket: Ticket) =>
  PRIORITIES.findIndex((option) => option.id === ticket.priority);

const SORT_OPTIONS: SortOption[] = [
  {
    label: 'Newest activity',
    compare: (a, b) => b.updatedAt.localeCompare(a.updatedAt),
  },
  {
    label: 'Oldest activity',
    compare: (a, b) => a.updatedAt.localeCompare(b.updatedAt),
  },
  {
    label: 'Priority',
    compare: (a, b) => rank(a) - rank(b),
  },
];

@Component({
  selector: 'tickets',
  imports: [
    BuiCombobox,
    BuiComboboxContent,
    BuiComboboxGroup,
    BuiComboboxGroupLabel,
    BuiComboboxListbox,
    BuiComboboxOption,
    BuiComboboxOptionIndicator,
    BuiComboboxPortal,
    BuiComboboxTrigger,
    BuiSidebar,
    BuiSidebarAction,
    BuiSidebarBadge,
    BuiSidebarBody,
    BuiSidebarButton,
    BuiSidebarHeader,
    BuiSidebarIcon,
    BuiSidebarLabel,
    BuiSidebarMenu,
    BuiSidebarMenuItem,
    BuiSidebarMenuRow,
    BuiSidebarSection,
    BuiSidebarSectionContent,
    BuiSidebarSectionHeader,
    FormsModule,
    MatButton,
    MatDivider,
    MatFormField,
    MatIcon,
    MatIconButton,
    MatInput,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    MatPrefix,
    MatSidenav,
    MatSidenavContainer,
    MatSidenavContent,
    MatSuffix,
    MatTooltip,
    NgOptimizedImage,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    TicketsDetailsPanel,
    TicketStatusPill,
  ],
  host: {
    class: 'flex h-dvh',
  },
  template: `
    <mat-sidenav-container class="bg-transparent">
      <!-- Queues -->
      <mat-sidenav
        class="w-60 bg-(--page-bg)"
        [mode]="isNarrow() ? 'over' : 'side'"
        [opened]="!isNarrow()"
        [disableClose]="!isNarrow()"
        #sidenav
      >
        <aside
          buiSidebar
          class="flex-auto"
        >
          <!-- Header -->
          <div
            buiSidebarHeader
            class="ps-5 pe-4 pt-6 pb-2"
          >
            <div class="text-3xl font-semibold tracking-tighter">Tickets</div>
          </div>

          <!-- Body -->
          <div buiSidebarBody>
            <!-- New ticket -->
            <div buiSidebarSection>
              <div buiSidebarSectionContent>
                <ul buiSidebarMenu>
                  <li buiSidebarMenuItem>
                    <div buiSidebarMenuRow>
                      <button buiSidebarButton>
                        <mat-icon
                          buiSidebarIcon
                          svgIcon="ticket-plus"
                        />
                        <span buiSidebarLabel>New ticket</span>
                      </button>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <!-- Views -->
            <div buiSidebarSection>
              <div buiSidebarSectionHeader>
                <span buiSidebarLabel>Views</span>
              </div>
              <div buiSidebarSectionContent>
                <ul buiSidebarMenu>
                  @for (view of views; track view.id) {
                    <li buiSidebarMenuItem>
                      <div buiSidebarMenuRow>
                        <button
                          buiSidebarButton
                          [class.active]="queue() === view.id"
                          (click)="select(view.id)"
                        >
                          <mat-icon
                            buiSidebarIcon
                            [svgIcon]="view.icon"
                          />
                          <span buiSidebarLabel>{{ view.name }}</span>
                          @if (counts()[view.id]) {
                            <div buiSidebarBadge>{{ counts()[view.id] }}</div>
                          }
                        </button>
                      </div>
                    </li>
                  }
                </ul>
              </div>
            </div>

            <!-- Buckets -->
            <div buiSidebarSection>
              <div buiSidebarSectionHeader>
                <span buiSidebarLabel>Buckets</span>
                <button
                  buiSidebarAction
                  matTooltip="New bucket"
                  (click)="openBucketDialog()"
                >
                  <mat-icon
                    buiSidebarIcon
                    svgIcon="plus"
                  />
                </button>
              </div>
              <div buiSidebarSectionContent>
                <ul buiSidebarMenu>
                  @for (bucket of buckets(); track bucket.id) {
                    <li buiSidebarMenuItem>
                      <div buiSidebarMenuRow>
                        <button
                          buiSidebarButton
                          [class.active]="queue() === bucket.id"
                          (click)="select(bucket.id)"
                        >
                          <span buiSidebarIcon>
                            <span
                              class="size-2 rounded-full"
                              [class]="bucket.color"
                            ></span>
                          </span>
                          <span buiSidebarLabel>{{ bucket.name }}</span>
                          @if (counts()[bucket.id]) {
                            <div
                              buiSidebarBadge
                              class="absolute end-1.5 top-1/2 -translate-y-1/2 text-neutral-a11 group-hover/bui-sidebar-menu-row:invisible group-has-focus-visible/bui-sidebar-menu-row:invisible"
                              [class.invisible]="trigger.menuOpen"
                            >
                              {{ counts()[bucket.id] }}
                            </div>
                          }
                        </button>
                        <button
                          buiSidebarAction
                          class="opacity-0 group-hover/bui-sidebar-menu-row:opacity-100 focus-visible:opacity-100 aria-expanded:opacity-100"
                          [matMenuTriggerFor]="bucketMenu"
                          #trigger="matMenuTrigger"
                        >
                          <mat-icon
                            buiSidebarIcon
                            svgIcon="ellipsis"
                          />
                        </button>
                        <mat-menu #bucketMenu>
                          <button
                            mat-menu-item
                            (click)="openBucketDialog(bucket)"
                          >
                            <mat-icon svgIcon="pencil" />
                            Edit
                          </button>
                          <mat-divider />
                          <button
                            mat-menu-item
                            class="text-red-a11 hover:bg-red-a3"
                            (click)="removeBucket(bucket.id)"
                          >
                            <mat-icon
                              class="text-red-a11"
                              svgIcon="trash"
                            />
                            Delete
                          </button>
                        </mat-menu>
                      </div>
                    </li>
                  }
                </ul>
              </div>
            </div>
          </div>
        </aside>
      </mat-sidenav>

      <!-- Details panel -->
      <mat-sidenav
        class="w-80 bg-neutral-2"
        position="end"
        mode="side"
        disableClose
        [opened]="!!panel()?.details() && !isCompact()"
      >
        @if (panel()?.ticket(); as ticket) {
          <tickets-details-panel [ticket]="ticket" />
        }
      </mat-sidenav>

      <mat-sidenav-content class="bg-transparent">
        <div class="flex min-h-0 flex-auto">
          <!-- List -->
          <div
            class="flex min-w-0 flex-auto flex-col md:w-96 md:flex-none md:border-e md:border-neutral-a4"
            [class.max-md:hidden]="panel()"
          >
            <!-- Header -->
            @if (isNarrow()) {
              <header class="flex items-center gap-x-2 px-4 py-3">
                <button
                  matIconButton
                  class="small"
                  (click)="sidenav.toggle()"
                >
                  <mat-icon svgIcon="panel-left" />
                </button>
                <div class="flex min-w-0 flex-auto items-baseline gap-x-2">
                  <div class="truncate text-lg font-medium">
                    {{ queueItem().name }}
                  </div>
                  <div class="text-neutral-a11 tabular-nums">
                    {{ tickets().length }}
                  </div>
                </div>
              </header>
            }

            <!-- Search, Filter & Sort -->
            <div
              class="flex items-center gap-x-2 border-b border-neutral-a4 px-4 pb-4"
              [class.pt-4]="!isNarrow()"
            >
              <!-- Search -->
              <mat-form-field class="min-w-0 flex-auto">
                <mat-icon
                  svgIcon="search"
                  matIconPrefix
                />
                <input
                  matInput
                  placeholder="Search tickets"
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

              <div class="flex items-center gap-x-0.5">
                <!-- Filter -->
                <div
                  buiCombobox
                  class="w-fit"
                  [value]="filters()"
                  (valueChange)="setFilters($event)"
                >
                  <button
                    matIconButton
                    matTooltip="Filter"
                    buiComboboxTrigger
                    id="tickets-filter"
                    [class.bg-neutral-a3]="filterCount()"
                  >
                    <mat-icon svgIcon="list-filter" />
                  </button>
                  <ng-template
                    buiComboboxPortal
                    position="bottom-end"
                    matchWidth="false"
                  >
                    <div
                      buiComboboxContent
                      class="min-w-40"
                    >
                      <div
                        buiComboboxListbox
                        aria-labelledby="tickets-filter"
                        multi
                        focusMode="activedescendant"
                        selectionMode="explicit"
                      >
                        @for (group of filterGroups; track group.label) {
                          @if (!$first) {
                            <mat-divider class="-mx-1 my-0.5" />
                          }
                          <div buiComboboxGroup>
                            <div buiComboboxGroupLabel>{{ group.label }}</div>
                            @for (option of group.options; track option.id) {
                              <div
                                buiComboboxOption
                                [value]="option.id"
                                [label]="option.label"
                              >
                                <span class="flex-auto">{{
                                  option.label
                                }}</span>
                                <span buiComboboxOptionIndicator></span>
                              </div>
                            }
                          </div>
                        }
                      </div>
                      @if (filterCount()) {
                        <mat-divider />
                        <button
                          matButton
                          class="tertiary m-1 justify-start rounded-[calc(var(--theme-border-radius)*2/3)] px-2"
                          (click)="priorities.set([]); channels.set([])"
                        >
                          <mat-icon svgIcon="x" />
                          Clear filter
                        </button>
                      }
                    </div>
                  </ng-template>
                </div>

                <!-- Sort -->
                <div
                  buiCombobox
                  class="w-fit"
                  [value]="[sort()]"
                  (valueChange)="sort.set($event[0] ?? sort())"
                >
                  <button
                    matIconButton
                    matTooltip="Sort"
                    buiComboboxTrigger
                    id="tickets-sort"
                  >
                    <mat-icon svgIcon="arrow-down-up" />
                  </button>
                  <ng-template
                    buiComboboxPortal
                    position="bottom-end"
                    matchWidth="false"
                  >
                    <div
                      buiComboboxContent
                      class="min-w-40"
                    >
                      <div
                        buiComboboxListbox
                        aria-labelledby="tickets-sort"
                        focusMode="activedescendant"
                        selectionMode="explicit"
                      >
                        @for (option of sortOptions; track option.label) {
                          <div
                            buiComboboxOption
                            [value]="option"
                            [label]="option.label"
                          >
                            <span class="flex-auto">{{ option.label }}</span>
                            <span buiComboboxOptionIndicator></span>
                          </div>
                        }
                      </div>
                    </div>
                  </ng-template>
                </div>
              </div>
            </div>

            <!-- Tickets -->
            <div
              class="flex min-h-0 flex-auto flex-col gap-y-1 overflow-y-auto p-2"
            >
              @for (ticket of tickets(); track ticket.id; let last = $last) {
                @let customer = customersService.byId(ticket.customerId)!;
                <div
                  class="flex cursor-pointer flex-col gap-y-0.5 rounded-lg p-3 hover:bg-neutral-a3"
                  routerLinkActive="bg-neutral-a3"
                  [routerLink]="['/tickets', ticket.id]"
                >
                  <div class="flex items-center gap-x-2">
                    @if (ticket.unread) {
                      <div
                        class="size-1.5 shrink-0 rounded-full bg-primary"
                      ></div>
                    }
                    <div class="truncate font-medium">{{ ticket.subject }}</div>
                    <div
                      class="ms-auto shrink-0 text-sm text-neutral-a11 tabular-nums"
                    >
                      {{ time(ticket.updatedAt) }}
                    </div>
                  </div>
                  <div class="line-clamp-2 text-neutral-a11">
                    {{ preview(ticket) }}
                  </div>
                  <div
                    class="mt-1.5 flex min-h-5 items-center gap-x-2 text-sm text-neutral-a11"
                  >
                    <div class="tabular-nums">#{{ ticket.id }}</div>
                    ·
                    <div class="truncate">{{ customer.name }}</div>
                    ·
                    <ticket-status-pill [status]="ticket.status" />
                    @if (queue() !== 'mine' && queue() !== 'unassigned') {
                      @if (ticket.assigneeId; as assigneeId) {
                        @let assignee = agentsService.byId(assigneeId)!;
                        <img
                          class="ms-auto size-5 shrink-0 rounded-full object-cover"
                          width="20"
                          height="20"
                          [ngSrc]="assignee.photo"
                          [alt]="assignee.name"
                          [matTooltip]="assignee.name"
                        />
                      } @else {
                        <mat-icon
                          class="ms-auto size-5 shrink-0 text-neutral-a8"
                          svgIcon="circle-dashed"
                          matTooltip="Unassigned"
                        />
                      }
                    }
                  </div>
                </div>

                @if (!last) {
                  <mat-divider class="mx-3 my-0.5" />
                }
              } @empty {
                <div
                  class="flex flex-col items-center justify-center gap-y-2 px-4 py-10"
                >
                  <mat-icon
                    class="size-10"
                    svgIcon="inbox"
                  />
                  <div class="text-center text-neutral-a11">
                    {{
                      search() || filterCount()
                        ? 'No tickets match your search.'
                        : queueItem().empty
                    }}
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Ticket -->
          <div
            class="flex min-w-0 flex-auto flex-col"
            [class.max-md:hidden]="!panel()"
          >
            <router-outlet
              (activate)="panel.set($event)"
              (deactivate)="panel.set(null)"
            />
            @if (!panel()) {
              <div
                class="flex flex-auto flex-col items-center justify-center gap-y-2 p-6"
              >
                <mat-icon
                  class="size-10"
                  svgIcon="ticket"
                />
                <div class="text-center text-neutral-a11">
                  Select a ticket to read it.
                </div>
              </div>
            }
          </div>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
})
export default class Tickets {
  // Dependencies
  private agentsService = inject(AgentsService);
  private customersService = inject(CustomersService);
  private ticketsService = inject(TicketsService);
  private matDialog = inject(MatDialog);
  private media = inject(Media);
  private router = inject(Router);

  // Queries
  readonly sidenav = viewChild.required<MatSidenav>('sidenav');

  // State
  private views = VIEWS;
  private buckets = this.ticketsService.buckets;
  private filterGroups = [
    { label: 'Priority', options: PRIORITIES },
    { label: 'Channel', options: CHANNELS },
  ];
  private sortOptions = SORT_OPTIONS;
  private counts = this.ticketsService.counts;
  private isCompact = this.media.match(`(width < 64rem)`);
  private isNarrow = this.media.match(`(width < 80rem)`);
  private queue = signal<Queue>('mine');
  private search = signal('');
  private priorities = signal<TicketPriority[]>([]);
  private channels = signal<Channel[]>([]);
  private sort = signal(SORT_OPTIONS[0]);
  private panel = signal<TicketPanel | null>(null);

  // Computed state
  private queueItem = computed(() =>
    [...VIEWS, ...this.buckets()].find((item) => item.id === this.queue())!
  );
  private filters = computed(() => [...this.priorities(), ...this.channels()]);
  private filterCount = computed(
    () => this.priorities().length + this.channels().length
  );
  private tickets = computed(() => {
    const queue = this.queue();
    const search = this.search().trim().toLowerCase();
    const priorities = this.priorities();
    const channels = this.channels();

    return this.ticketsService
      .tickets()
      .filter(
        (ticket) =>
          inQueue(ticket, queue) &&
          (!priorities.length || priorities.includes(ticket.priority)) &&
          (!channels.length || channels.includes(ticket.channel)) &&
          (!search ||
            [
              ticket.id,
              ticket.subject,
              this.customersService.byId(ticket.customerId)!.name,
              ...ticket.messages.flatMap((message) => message.body),
            ].some((text) => text.toLowerCase().includes(search)))
      )
      .sort(this.sort().compare);
  });

  private setFilters(filters: (TicketPriority | Channel)[]) {
    this.priorities.set(
      filters.filter((id): id is TicketPriority =>
        PRIORITIES.some((option) => option.id === id)
      )
    );
    this.channels.set(
      filters.filter((id): id is Channel =>
        CHANNELS.some((option) => option.id === id)
      )
    );
  }

  private select(queue: Queue) {
    this.queue.set(queue);
    this.router.navigate(['/tickets']);

    if (this.isNarrow()) {
      this.sidenav().close();
    }
  }

  private openBucketDialog(bucket?: Bucket) {
    this.matDialog.open(TicketBucketDialog, {
      autoFocus: false,
      panelClass: bui('w-full max-w-sm').split(' '),
      data: { bucket },
    });
  }

  private removeBucket(id: string) {
    this.ticketsService.removeBucket(id);

    if (this.queue() === id) {
      this.select('mine');
    }
  }

  private preview(ticket: Ticket) {
    return ticket.messages
      .filter((message) => !message.internal)
      .at(-1)!
      .body.join(' ');
  }

  private time(date: string) {
    return format(date, isToday(date) ? 'h:mm a' : 'MMM d');
  }
}
