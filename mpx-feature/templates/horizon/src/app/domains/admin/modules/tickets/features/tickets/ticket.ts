import { Listbox, Option } from '@angular/aria/listbox';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { DatePipe, NgOptimizedImage } from '@angular/common';
import {
  afterRenderEffect,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  linkedSignal,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import {
  MatButtonToggle,
  MatButtonToggleGroup,
} from '@angular/material/button-toggle';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatTooltip } from '@angular/material/tooltip';
import { Router, RouterLink } from '@angular/router';
import { Media } from '@/app/core/media';
import {
  AgentsService,
  ME,
} from '@/app/domains/admin/modules/agents/data/agents';
import { CustomersService } from '@/app/domains/admin/modules/customers/data/customers';
import { CANNED_REPLIES } from '@/app/domains/admin/modules/tickets/data/canned-replies';
import {
  PRIORITIES,
  STATUSES,
  TicketsService,
  TicketStatus,
} from '@/app/domains/admin/modules/tickets/data/tickets';
import {
  Tone,
  TONES,
  WRITING_TOOLS,
} from '@/app/domains/admin/modules/tickets/data/writing-tools';
import { TicketsDetailsPanel } from '@/app/domains/admin/modules/tickets/features/tickets/details-panel';
import { TicketStatusPill } from '@/app/domains/admin/modules/tickets/ui/pills';
import {
  BuiCombobox,
  BuiComboboxContent,
  BuiComboboxEmpty,
  BuiComboboxListbox,
  BuiComboboxOption,
  BuiComboboxOptionIndicator,
  BuiComboboxPortal,
  BuiComboboxSearch,
  BuiComboboxTrigger,
} from '@/app/ui/combobox';
import {
  BuiPopover,
  BuiPopoverClose,
  BuiPopoverContent,
  BuiPopoverPortal,
  BuiPopoverTrigger,
} from '@/app/ui/popover';

@Component({
  selector: 'ticket',
  imports: [
    BuiCombobox,
    BuiComboboxContent,
    BuiComboboxEmpty,
    BuiComboboxListbox,
    BuiComboboxOption,
    BuiComboboxOptionIndicator,
    BuiComboboxPortal,
    BuiComboboxSearch,
    BuiComboboxTrigger,
    BuiPopover,
    BuiPopoverClose,
    BuiPopoverContent,
    BuiPopoverPortal,
    BuiPopoverTrigger,
    CdkTextareaAutosize,
    DatePipe,
    FormsModule,
    Listbox,
    MatButton,
    MatButtonToggle,
    MatButtonToggleGroup,
    MatDivider,
    MatIcon,
    MatIconButton,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    MatTooltip,
    NgOptimizedImage,
    Option,
    RouterLink,
    TicketsDetailsPanel,
    TicketStatusPill,
  ],
  host: {
    class: ' @container flex min-h-0 min-w-0 flex-auto flex-col',
  },
  template: `
    @if (ticket(); as ticket) {
      @let customer = customersService.byId(ticket.customerId)!;
      @let assignee =
        ticket.assigneeId ? agentsService.byId(ticket.assigneeId) : null;

      <!-- Header -->
      <header
        class="flex min-h-8 shrink-0 items-center gap-2 border-b border-neutral-a4 p-4 md:ps-5 @max-xl:flex-wrap"
      >
        <!-- Title -->
        <div class="flex h-7 min-w-0 items-center gap-x-2 @max-xl:w-full">
          <a
            matIconButton
            class="tiny md:hidden"
            routerLink="/tickets"
          >
            <mat-icon svgIcon="arrow-left" />
          </a>
          <div class="truncate text-lg font-medium">
            {{ ticket.subject }}
          </div>
        </div>

        <!-- Actions -->
        <div class="ms-auto flex h-8 shrink-0 items-center gap-x-0.5">
          <!-- Status -->
          <div
            buiCombobox
            class="w-fit"
            [value]="[ticket.status]"
            (valueChange)="
              ticketsService.setStatus(ticket.id, $event[0] ?? ticket.status)
            "
          >
            <button
              matButton
              buiComboboxTrigger
              id="ticket-status"
              class="tertiary small"
              matTooltip="Status"
            >
              <ticket-status-pill [status]="ticket.status" />
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
                  aria-labelledby="ticket-status"
                  focusMode="activedescendant"
                  selectionMode="explicit"
                >
                  @for (option of statuses; track option.id) {
                    <div
                      buiComboboxOption
                      [value]="option.id"
                      [label]="option.label"
                    >
                      <ticket-status-pill
                        class="flex-auto"
                        [status]="option.id"
                      />
                      <span buiComboboxOptionIndicator></span>
                    </div>
                  }
                </div>
              </div>
            </ng-template>
          </div>

          <!-- Priority -->
          <div
            buiCombobox
            class="w-fit"
            [value]="[ticket.priority]"
            (valueChange)="
              ticketsService.setPriority(
                ticket.id,
                $event[0] ?? ticket.priority
              )
            "
          >
            <button
              matButton
              buiComboboxTrigger
              id="ticket-priority"
              class="small tertiary"
              matTooltip="Priority"
            >
              <mat-icon
                svgIcon="flag"
                [class]="priority().color"
              />
              {{ priority().label }}
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
                  aria-labelledby="ticket-priority"
                  focusMode="activedescendant"
                  selectionMode="explicit"
                >
                  @for (option of priorities; track option.id) {
                    <div
                      buiComboboxOption
                      [value]="option.id"
                      [label]="option.label"
                    >
                      <mat-icon
                        class="size-4 shrink-0"
                        svgIcon="flag"
                        [class]="option.color"
                      />
                      <span class="flex-auto">{{ option.label }}</span>
                      <span buiComboboxOptionIndicator></span>
                    </div>
                  }
                </div>
              </div>
            </ng-template>
          </div>

          <!-- Buckets -->
          <div
            buiCombobox
            class="w-fit"
            [value]="ticket.buckets"
            (valueChange)="ticketsService.setBuckets(ticket.id, $event)"
          >
            <button
              matButton
              buiComboboxTrigger
              id="ticket-buckets"
              class="small tertiary"
              matTooltip="Buckets"
            >
              <mat-icon svgIcon="tag" />
              {{ bucketLabel() }}
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
                  aria-labelledby="ticket-buckets"
                  multi
                  focusMode="activedescendant"
                  selectionMode="explicit"
                >
                  @for (bucket of buckets(); track bucket.id) {
                    <div
                      buiComboboxOption
                      [value]="bucket.id"
                      [label]="bucket.name"
                    >
                      <span
                        class="size-2 shrink-0 rounded-full"
                        [class]="bucket.color"
                      ></span>
                      <span class="flex-auto">{{ bucket.name }}</span>
                      <span buiComboboxOptionIndicator></span>
                    </div>
                  }
                </div>
              </div>
            </ng-template>
          </div>

          <!-- Assignee -->
          <div
            buiCombobox
            class="w-fit"
            [value]="[ticket.assigneeId]"
            (valueChange)="
              ticketsService.assign(
                ticket.id,
                $event.length ? $event[0] : ticket.assigneeId
              )
            "
            (expandedChange)="assigneeQuery.set('')"
          >
            <button
              matIconButton
              buiComboboxTrigger
              id="ticket-assignee"
              class="small"
              [matTooltip]="
                assignee ? 'Assignee: ' + assignee.name : 'Unassigned'
              "
            >
              @if (assignee) {
                <mat-icon
                  class="shrink-0"
                  svgIcon="circle-user-round"
                />
              } @else {
                <mat-icon
                  class="shrink-0"
                  svgIcon="circle-dashed"
                />
              }
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
                <input
                  buiComboboxSearch
                  autocomplete="off"
                  placeholder="Search agents"
                  [value]="assigneeQuery()"
                  (input)="assigneeQuery.set(assigneeSearch.value)"
                  #assigneeSearch
                />
                <div
                  buiComboboxListbox
                  aria-labelledby="ticket-assignee"
                  focusMode="activedescendant"
                  selectionMode="explicit"
                >
                  <div
                    buiComboboxOption
                    label="Unassigned"
                    [value]="null"
                  >
                    <mat-icon
                      class="size-5 shrink-0 text-neutral-a8"
                      svgIcon="circle-dashed"
                    />
                    <span class="flex-auto">Unassigned</span>
                    <span buiComboboxOptionIndicator></span>
                  </div>
                  @for (agent of assigneeResults(); track agent.id) {
                    <div
                      buiComboboxOption
                      [value]="agent.id"
                      [label]="agent.name"
                    >
                      <img
                        class="size-5 shrink-0 rounded-full object-cover"
                        width="20"
                        height="20"
                        [ngSrc]="agent.photo"
                        [alt]="agent.name"
                      />
                      <span class="flex-auto">{{ agent.name }}</span>
                      <span buiComboboxOptionIndicator></span>
                    </div>
                  } @empty {
                    <div buiComboboxEmpty>No agents found</div>
                  }
                </div>
              </div>
            </ng-template>
          </div>

          <!-- More menu -->
          <button
            matIconButton
            class="small"
            matTooltip="More"
            [matMenuTriggerFor]="moreMenu"
          >
            <mat-icon svgIcon="ellipsis-vertical" />
          </button>

          <!-- Details panel toggle -->
          <button
            matIconButton
            class="small"
            matTooltip="Details"
            (click)="details.update((open) => !open)"
          >
            <mat-icon svgIcon="panel-right" />
          </button>
        </div>
      </header>

      @if (isCompact() && details()) {
        <!-- Details panel -->
        <div class="flex min-h-0 flex-auto overflow-y-auto">
          <tickets-details-panel [ticket]="ticket" />
        </div>
      } @else {
        <!-- Messages -->
        <div
          class="flex min-h-0 flex-auto flex-col gap-y-1 overflow-y-auto p-2"
          #thread
        >
          @for (
            message of ticket.messages;
            track message.id;
            let last = $last
          ) {
            <div
              class="flex flex-col gap-y-3 rounded-lg p-3"
              [class.bg-amber-a3]="message.internal"
            >
              <div class="flex items-center gap-x-2.5">
                @if (message.author.type === 'agent') {
                  @let agent = agentsService.byId(message.author.id)!;
                  <img
                    class="size-10 shrink-0 rounded-full object-cover"
                    width="40"
                    height="40"
                    [ngSrc]="agent.photo"
                    [alt]="agent.name"
                  />
                  <div class="flex min-w-0 flex-col">
                    <div class="truncate font-medium">
                      {{ agent.name }}
                    </div>
                    <div class="truncate text-sm text-neutral-a11">
                      {{ agent.title }}
                    </div>
                  </div>
                } @else {
                  <div class="truncate font-medium">
                    {{ customer.name }}
                  </div>
                }
                <div
                  class="ms-auto shrink-0 text-sm text-neutral-a11 tabular-nums"
                >
                  {{ message.at | date: 'MMM d, h:mm a' }}
                </div>
              </div>
              @if (message.internal) {
                <div
                  class="mt-1 flex items-center gap-x-1 text-sm text-amber-a11"
                >
                  <mat-icon
                    class="size-3 text-current"
                    svgIcon="eye-off"
                  />
                  Internal note
                </div>
              }
              <div class="flex flex-col gap-y-3 leading-6">
                @for (paragraph of message.body; track $index) {
                  <p class="whitespace-pre-line">{{ paragraph }}</p>
                }
              </div>
            </div>
            @if (!last) {
              <mat-divider class="mx-3 my-0.5" />
            }
          }
        </div>

        <!-- Composer -->
        <div class="px-2 pb-2">
          <div
            class="flex flex-col rounded-lg border"
            [class]="
              mode() === 'note'
                ? 'border-amber-a4 bg-amber-a3 focus-within:border-amber-a7'
                : 'border-neutral-a4 bg-white focus-within:border-neutral-a7 dark:bg-neutral-a2'
            "
          >
            <div class="flex items-center gap-x-2 px-2 pt-2">
              <mat-button-toggle-group
                class="segmented small"
                name="mode"
                [value]="mode()"
                (valueChange)="mode.set($event)"
              >
                <mat-button-toggle value="reply">Reply</mat-button-toggle>
                <mat-button-toggle value="note">
                  Internal note
                </mat-button-toggle>
              </mat-button-toggle-group>

              <div class="flex items-center gap-x-0.5">
                <!-- Write with AI -->
                <button
                  matIconButton
                  class="small"
                  matTooltip="Write with AI"
                  [matMenuTriggerFor]="writeMenu"
                >
                  <mat-icon svgIcon="sparkles" />
                </button>

                <!-- Canned replies -->
                <div
                  buiPopover
                  class="w-80"
                  position="top-start"
                  autoFocus="[ngListbox]"
                  [hasBackdrop]="false"
                >
                  <button
                    matIconButton
                    class="small"
                    matTooltip="Canned replies"
                    buiPopoverTrigger
                  >
                    <mat-icon svgIcon="message-square-text" />
                  </button>
                  <ng-template buiPopoverPortal>
                    <div
                      buiPopoverContent
                      class="gap-y-0.5 p-1"
                    >
                      <div
                        ngListbox
                        buiPopoverClose
                        class="flex flex-col gap-y-0.5 outline-none"
                        selectionMode="explicit"
                        focusMode="activedescendant"
                        [value]="[]"
                        (valueChange)="insert($event[0])"
                      >
                        @for (
                          cannedReply of cannedReplies;
                          track cannedReply.id
                        ) {
                          <div
                            ngOption
                            class="flex cursor-pointer items-center gap-x-2 rounded-[calc(var(--theme-border-radius)*2/3)] px-1.75 py-1.5 text-base text-neutral-12 outline-none select-none hover:bg-neutral-a3 data-[active=true]:bg-neutral-a3"
                            [value]="cannedReply.body"
                            [label]="cannedReply.title"
                          >
                            <span class="min-w-0 flex-auto">
                              <span class="block">{{ cannedReply.title }}</span>
                              <span
                                class="block truncate text-sm text-neutral-a11"
                              >
                                {{ cannedReply.body }}
                              </span>
                            </span>
                          </div>
                        }
                      </div>
                    </div>
                  </ng-template>
                </div>
              </div>
            </div>
            <textarea
              class="mt-2 resize-none bg-transparent px-4 outline-none"
              cdkTextareaAutosize
              cdkAutosizeMinRows="6"
              cdkAutosizeMaxRows="12"
              [placeholder]="
                mode() === 'note'
                  ? 'Add an internal note'
                  : 'Reply to ' + customer.name
              "
              [ngModel]="reply()"
              (ngModelChange)="reply.set($event)"
            ></textarea>
            <div class="flex justify-end px-2 pb-2">
              <!-- Send -->
              <div class="button-group">
                <button
                  matButton
                  class="primary small"
                  [disabled]="!reply().trim()"
                  (click)="send()"
                >
                  <mat-icon svgIcon="send" />
                  Send
                </button>
                <button
                  matButton
                  class="primary small"
                  [disabled]="!reply().trim()"
                  [matMenuTriggerFor]="sendMenu"
                >
                  <mat-icon svgIcon="chevron-down" />
                </button>
              </div>
            </div>
          </div>
        </div>
      }

      <mat-menu
        xPosition="before"
        #moreMenu
      >
        <button
          mat-menu-item
          (click)="markUnread()"
        >
          <mat-icon svgIcon="mail" />
          Mark as unread
        </button>
        <button mat-menu-item>
          <mat-icon svgIcon="link" />
          Copy link
        </button>
        <button mat-menu-item>
          <mat-icon svgIcon="merge" />
          Merge
        </button>
        <button mat-menu-item>
          <mat-icon svgIcon="shield-ban" />
          Mark as spam
        </button>
      </mat-menu>

      <mat-menu
        xPosition="before"
        yPosition="above"
        #sendMenu
      >
        <button
          mat-menu-item
          (click)="send('pending')"
        >
          <mat-icon svgIcon="hourglass" />
          Send and set pending
        </button>
        <button
          mat-menu-item
          (click)="send('closed')"
        >
          <mat-icon svgIcon="circle-check" />
          Send and close
        </button>
      </mat-menu>

      <mat-menu
        yPosition="above"
        #writeMenu
      >
        <div
          mat-menu-item
          class="not-mat-menu-wrapper"
        >
          <span class="font-medium">Generate reply</span>
        </div>
        @for (tone of tones; track tone.id) {
          <button
            mat-menu-item
            (click)="generate(tone)"
          >
            <mat-icon [svgIcon]="tone.icon" />
            <span>{{ tone.label }}</span>
          </button>
        }
        <mat-divider />
        <div mat-menu-item>
          <span class="font-medium">Improve draft</span>
        </div>
        @for (tool of writingTools; track tool.id) {
          <button
            mat-menu-item
            [disabled]="!reply().trim()"
          >
            <mat-icon [svgIcon]="tool.icon" />
            <span>{{ tool.label }}</span>
          </button>
        }
      </mat-menu>
    }
  `,
})
export default class TicketPanel {
  // Dependencies
  private agentsService = inject(AgentsService);
  private customersService = inject(CustomersService);
  private ticketsService = inject(TicketsService);
  private media = inject(Media);
  private router = inject(Router);

  // Queries
  private readonly thread = viewChild('thread', {
    read: ElementRef<HTMLElement>,
  });

  // Inputs / Outputs
  readonly id = input.required<string>();

  // State
  private statuses = STATUSES;
  private priorities = PRIORITIES;
  private buckets = this.ticketsService.buckets;
  private cannedReplies = CANNED_REPLIES;
  private tones = TONES;
  private writingTools = WRITING_TOOLS;
  private agents = this.agentsService.agents;
  private isCompact = this.media.match(`(width < 64rem)`);
  private isNarrow = this.media.match(`(width < 96rem)`);
  // Below lg each ticket opens on its conversation
  readonly details = linkedSignal({
    source: () => this.isCompact() && this.id(),
    computation: () => !this.isNarrow(),
  });
  private mode = linkedSignal({
    source: this.id,
    computation: (): 'reply' | 'note' => 'reply',
  });
  private reply = linkedSignal({
    source: this.id,
    computation: () => '',
  });
  private assigneeQuery = signal('');

  // Computed state
  readonly ticket = computed(() => this.ticketsService.byId(this.id()));
  private messages = computed(() => this.ticket()?.messages);
  private priority = computed(() =>
    PRIORITIES.find((item) => item.id === this.ticket()?.priority)!
  );
  private bucketLabel = computed(() => {
    const buckets = this.ticket()?.buckets ?? [];

    if (buckets.length > 1) {
      return `${buckets.length} buckets`;
    }

    return (
      this.buckets().find((item) => item.id === buckets[0])?.name ?? 'No bucket'
    );
  });
  private assigneeResults = computed(() =>
    this.agents().filter((agent) =>
      agent.name.toLowerCase().includes(this.assigneeQuery().toLowerCase())
    )
  );

  constructor() {
    effect(() => {
      if (!this.ticket()) {
        this.router.navigate(['/tickets']);
      }
    });

    effect(() => {
      this.ticketsService.setUnread(this.id(), false);
    });

    afterRenderEffect(() => {
      const thread = this.thread()?.nativeElement;

      if (thread && this.messages()) {
        thread.scrollTop = thread.scrollHeight;
      }
    });
  }

  private insert(text: string) {
    this.reply.update((reply) =>
      reply.trim() ? `${reply.trimEnd()}\n\n${text}` : text
    );
  }

  private generate(tone: Tone) {
    const ticket = this.ticket()!;
    const customer = this.customersService.byId(ticket.customerId)!;

    this.reply.set(
      [
        `Hi ${customer.name.split(' ')[0]},`,
        tone.opening,
        ticket.followUp ?? tone.fallback,
        `${tone.closing}\n${ME.name.split(' ')[0]}`,
      ].join('\n\n')
    );
  }

  private send(status?: TicketStatus) {
    this.ticketsService.reply(
      this.id(),
      this.reply().trim(),
      this.mode() === 'note'
    );

    if (status) {
      this.ticketsService.setStatus(this.id(), status);
    }

    this.reply.set('');
  }

  private markUnread() {
    this.ticketsService.setUnread(this.id(), true);
    this.router.navigate(['/tickets']);
  }
}
