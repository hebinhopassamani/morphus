import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import {
  MatFormField,
  MatInput,
  MatPrefix,
  MatSuffix,
} from '@angular/material/input';
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
import {
  ACCOUNTS,
  contactOf,
  Conversation,
  FOLDERS,
  InboxService,
  LABELS,
  Mailbox,
} from '@/app/domains/admin/modules/inbox/data/inbox';
import { InboxCompose } from '@/app/domains/admin/modules/inbox/features/inbox/compose';
import ConversationPanel from '@/app/domains/admin/modules/inbox/features/inbox/conversation';
import { InboxLabels } from '@/app/domains/admin/modules/inbox/ui/labels';
import {
  BuiCombobox,
  BuiComboboxContent,
  BuiComboboxListbox,
  BuiComboboxOption,
  BuiComboboxOptionIndicator,
  BuiComboboxPortal,
  BuiComboboxTrigger,
} from '@/app/ui/combobox';
import {
  BuiSidebar,
  BuiSidebarBadge,
  BuiSidebarBody,
  BuiSidebarButton,
  BuiSidebarFooter,
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

type Filter = 'unread' | 'attachment';

const FILTER_OPTIONS: { id: Filter; label: string }[] = [
  {
    id: 'unread',
    label: 'Unread only',
  },
  {
    id: 'attachment',
    label: 'Has attachment',
  },
];

@Component({
  selector: 'inbox',
  imports: [
    BuiCombobox,
    BuiComboboxContent,
    BuiComboboxListbox,
    BuiComboboxOption,
    BuiComboboxOptionIndicator,
    BuiComboboxPortal,
    BuiComboboxTrigger,
    BuiSidebar,
    BuiSidebarBadge,
    BuiSidebarBody,
    BuiSidebarButton,
    BuiSidebarFooter,
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
    InboxCompose,
    InboxLabels,
    MatButton,
    MatDivider,
    MatFormField,
    MatIcon,
    MatIconButton,
    MatInput,
    MatPrefix,
    MatSidenav,
    MatSidenavContainer,
    MatSidenavContent,
    MatSuffix,
    MatTooltip,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
  ],
  // Viewport minus the admin header, plus the card padding from lg
  host: {
    class: 'flex h-[calc(100dvh-3.5rem-1px)] lg:h-[calc(100dvh-4.5rem-1px)]',
  },
  template: `
    <mat-sidenav-container>
      <!-- Folders -->
      <mat-sidenav
        class="w-60 bg-white dark:bg-neutral-2"
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
            class="flex flex-col gap-y-4 p-4"
          >
            <!-- Account -->
            <div
              buiCombobox
              [value]="[account()]"
              (valueChange)="account.set($event[0] ?? account())"
            >
              <button
                matButton
                buiComboboxTrigger
                class="tertiary -mx-2 spread [--button-padding-x:--spacing(2)]"
                id="inbox-account"
              >
                <mat-icon
                  svgIcon="chevrons-up-down"
                  iconPositionEnd
                />
                <span class="min-w-0 text-start">
                  <span class="block truncate font-medium">
                    {{ account().name }}
                  </span>
                  <span class="block truncate text-sm text-neutral-a11">
                    {{ account().email }}
                  </span>
                </span>
              </button>
              <ng-template buiComboboxPortal>
                <div
                  buiComboboxContent
                  class="min-w-40"
                >
                  <div
                    buiComboboxListbox
                    aria-labelledby="inbox-account"
                    focusMode="activedescendant"
                    selectionMode="explicit"
                  >
                    @for (option of accounts; track option.id) {
                      <div
                        buiComboboxOption
                        [value]="option"
                        [label]="option.name"
                      >
                        <span class="flex-auto">
                          <span class="block">{{ option.name }}</span>
                          <span class="block text-sm text-neutral-a11">
                            {{ option.email }}
                          </span>
                        </span>
                        <span buiComboboxOptionIndicator></span>
                      </div>
                    }
                  </div>
                </div>
              </ng-template>
            </div>
            <button
              matButton
              class="primary w-full"
              (click)="composeOpen.set(true)"
            >
              <mat-icon svgIcon="square-pen" />
              Compose
            </button>
          </div>

          <!-- Body -->
          <div buiSidebarBody>
            <!-- Folders -->
            <div buiSidebarSection>
              <div buiSidebarSectionContent>
                <ul buiSidebarMenu>
                  @for (folder of folders; track folder.id) {
                    <li buiSidebarMenuItem>
                      <div buiSidebarMenuRow>
                        <button
                          buiSidebarButton
                          [class.active]="mailbox() === folder.id"
                          (click)="select(folder.id)"
                        >
                          <mat-icon
                            buiSidebarIcon
                            [svgIcon]="folder.icon"
                          />
                          <span buiSidebarLabel>{{ folder.name }}</span>
                          @if (folder.id === 'inbox' && unread()) {
                            <div buiSidebarBadge>{{ unread() }}</div>
                          } @else if (
                            counted.includes(folder.id) && count(folder.id)
                          ) {
                            <div buiSidebarBadge>{{ count(folder.id) }}</div>
                          }
                        </button>
                      </div>
                    </li>
                  }
                </ul>
              </div>
            </div>

            <!-- Labels -->
            <div buiSidebarSection>
              <div buiSidebarSectionHeader>
                <span buiSidebarLabel>Labels</span>
              </div>
              <div buiSidebarSectionContent>
                <ul buiSidebarMenu>
                  @for (label of labels; track label.id) {
                    <li buiSidebarMenuItem>
                      <div buiSidebarMenuRow>
                        <button
                          buiSidebarButton
                          [class.active]="mailbox() === label.id"
                          (click)="select(label.id)"
                        >
                          <span buiSidebarIcon>
                            <span
                              class="size-2 rounded-full"
                              [class]="label.color"
                            ></span>
                          </span>
                          <span buiSidebarLabel>{{ label.name }}</span>
                          @if (count(label.id)) {
                            <div
                              buiSidebarBadge
                              class="text-neutral-a11"
                            >
                              {{ count(label.id) }}
                            </div>
                          }
                        </button>
                      </div>
                    </li>
                  }
                  <li buiSidebarMenuItem>
                    <div buiSidebarMenuRow>
                      <button buiSidebarButton>
                        <mat-icon
                          buiSidebarIcon
                          svgIcon="plus"
                        />
                        <span buiSidebarLabel>New label</span>
                      </button>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div
            buiSidebarFooter
            class="flex flex-col gap-y-2 p-4"
          >
            <div class="flex h-1.5 overflow-clip rounded-full bg-neutral-a3">
              <div class="w-[28%] bg-primary"></div>
            </div>
            <div class="flex items-center gap-x-2 text-sm tabular-nums">
              <div class="flex-auto text-neutral-a11">
                <span class="font-medium text-neutral-12">4.2 GB</span>
                of 15 GB used
              </div>
              <button
                matButton
                class="link small"
              >
                Manage
              </button>
            </div>
          </div>
        </aside>
      </mat-sidenav>

      <mat-sidenav-content>
        <div class="flex min-h-0 flex-auto">
          <!-- List -->
          <div
            class="flex min-w-0 flex-auto flex-col md:w-80 md:flex-none md:border-e md:border-neutral-a4 xl:w-96"
            [class.max-md:hidden]="panel()"
          >
            <!-- Header -->
            <header class="flex items-center gap-x-2 py-3 ps-4 pe-3">
              @if (isNarrow()) {
                <button
                  matIconButton
                  class="small"
                  (click)="sidenav.toggle()"
                >
                  <mat-icon svgIcon="panel-left" />
                </button>
              }
              <div class="flex-auto truncate text-lg font-semibold">
                {{ mailboxItem().name }}
              </div>

              <!-- Filter -->
              <div
                buiCombobox
                class="w-fit"
                [(value)]="filters"
              >
                <button
                  matIconButton
                  class="small"
                  matTooltip="Filter"
                  buiComboboxTrigger
                  id="inbox-filter"
                  aria-label="Filters"
                  [class.bg-neutral-a3]="filters().length"
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
                      aria-labelledby="inbox-filter"
                      multi
                      focusMode="activedescendant"
                      selectionMode="explicit"
                    >
                      @for (option of filterOptions; track option.id) {
                        <div
                          buiComboboxOption
                          [value]="option.id"
                          [label]="option.label"
                        >
                          <span class="flex-auto">{{ option.label }}</span>
                          <span buiComboboxOptionIndicator></span>
                        </div>
                      }
                    </div>
                    @if (filters().length) {
                      <mat-divider />
                      <button
                        matButton
                        class="tertiary m-1 justify-start rounded-[calc(var(--theme-border-radius)*2/3)] px-2"
                        (click)="filters.set([])"
                      >
                        <mat-icon svgIcon="x" />
                        Clear filter
                      </button>
                    }
                  </div>
                </ng-template>
              </div>
            </header>

            <!-- Search -->
            <div class="border-b border-neutral-a4 px-4 pb-4">
              <mat-form-field class="w-full">
                <mat-icon
                  svgIcon="search"
                  matIconPrefix
                />
                <input
                  matInput
                  placeholder="Search mail"
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
            </div>

            <!-- Conversations -->
            <div class="min-h-0 flex-auto overflow-y-auto">
              @for (conversation of conversations(); track conversation.id) {
                @let contact = contactOf(conversation);
                @let last =
                  conversation.messages[conversation.messages.length - 1];
                <div
                  class="flex cursor-pointer gap-x-3 border-b border-neutral-a4 px-4 py-3 hover:bg-neutral-a2"
                  routerLinkActive="bg-neutral-a3"
                  [class.bg-primary-a2]="conversation.unread && !rla.isActive"
                  [routerLink]="['/inbox', conversation.id]"
                  #rla="routerLinkActive"
                >
                  <div class="flex h-lh w-2 shrink-0 items-center">
                    @if (conversation.unread) {
                      <div class="size-2 rounded-full bg-primary"></div>
                    }
                  </div>
                  <div class="flex min-w-0 flex-auto flex-col gap-y-0.5">
                    <div class="flex items-center gap-x-2">
                      <div
                        class="truncate"
                        [class.font-semibold]="conversation.unread"
                      >
                        {{ contact.name }}
                      </div>
                      @if (conversation.messages.length > 1) {
                        <div
                          class="rounded-sm bg-neutral-a3 px-1.5 py-px text-xs font-medium text-neutral-a11 tabular-nums"
                        >
                          {{ conversation.messages.length }}
                        </div>
                      }
                      <div
                        class="ms-auto shrink-0 text-sm text-neutral-a11 tabular-nums"
                      >
                        {{ time(last.date) }}
                      </div>
                    </div>
                    <div class="flex items-center gap-x-2">
                      <div
                        class="min-w-0 flex-auto truncate"
                        [class.font-semibold]="conversation.unread"
                      >
                        {{ conversation.subject }}
                      </div>
                      @if (hasAttachments(conversation)) {
                        <mat-icon
                          class="size-4 shrink-0 text-neutral-a11"
                          svgIcon="paperclip"
                        />
                      }
                      <button
                        matIconButton
                        class="tiny"
                        [matTooltip]="conversation.starred ? 'Unstar' : 'Star'"
                        (click)="
                          $event.stopPropagation();
                          inboxService.toggleStar(conversation.id)
                        "
                      >
                        <mat-icon
                          [class]="
                            conversation.starred
                              ? 'text-amber-a10'
                              : 'text-neutral-a8'
                          "
                          svgIcon="star"
                        />
                      </button>
                    </div>
                    <div class="truncate text-sm text-neutral-a11">
                      {{ last.body.join(' ') }}
                    </div>
                    @if (conversation.labels.length) {
                      <inbox-labels
                        class="mt-1.5"
                        [labels]="conversation.labels"
                      />
                    }
                  </div>
                </div>
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
                      search() || filters().length
                        ? 'No conversations match your search.'
                        : mailboxItem().empty
                    }}
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Conversation -->
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
                  svgIcon="mail"
                />
                <div class="text-center text-neutral-a11">
                  Select a conversation to read it.
                </div>
              </div>
            }
          </div>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>

    <!-- Compose -->
    <inbox-compose [(open)]="composeOpen" />
  `,
})
export default class Inbox {
  // Dependencies
  private inboxService = inject(InboxService);
  private media = inject(Media);
  private router = inject(Router);

  // Queries
  readonly sidenav = viewChild.required<MatSidenav>('sidenav');

  // State
  private accounts = ACCOUNTS;
  private folders = FOLDERS;
  private labels = LABELS;
  private counted: Mailbox[] = ['drafts', 'scheduled', 'spam'];
  private filterOptions = FILTER_OPTIONS;
  private contactOf = contactOf;
  private unread = this.inboxService.unread;
  private isNarrow = this.media.match(`(width < 90rem)`);
  private account = signal(ACCOUNTS[0]);
  private mailbox = signal<Mailbox>('inbox');
  private search = signal('');
  private filters = signal<Filter[]>([]);
  private panel = signal<ConversationPanel | null>(null);
  private composeOpen = signal(false);

  // Computed state
  private mailboxItem = computed(() =>
    [...FOLDERS, ...LABELS].find((item) => item.id === this.mailbox())!
  );
  private conversations = computed(() => {
    const mailbox = this.mailbox();
    const search = this.search().trim().toLowerCase();
    const filters = this.filters();

    return this.inboxService
      .conversations()
      .filter(
        (conversation) =>
          this.inMailbox(conversation, mailbox) &&
          (!filters.includes('unread') || conversation.unread) &&
          (!filters.includes('attachment') ||
            this.hasAttachments(conversation)) &&
          (!search ||
            [
              conversation.subject,
              ...conversation.messages.flatMap((message) => [
                message.from.name,
                ...message.body,
              ]),
            ].some((text) => text.toLowerCase().includes(search)))
      )
      .sort((a, b) => this.lastDate(b).localeCompare(this.lastDate(a)));
  });

  private select(mailbox: Mailbox) {
    this.mailbox.set(mailbox);
    this.router.navigate(['/inbox']);

    if (this.isNarrow()) {
      this.sidenav().close();
    }
  }

  private inMailbox(conversation: Conversation, mailbox: Mailbox) {
    switch (mailbox) {
      case 'starred':
        return conversation.starred && conversation.folder !== 'trash';
      case 'orders':
      case 'suppliers':
      case 'billing':
      case 'team':
        return (
          conversation.labels.includes(mailbox) &&
          conversation.folder !== 'trash'
        );
      default:
        return conversation.folder === mailbox;
    }
  }

  private count(mailbox: Mailbox) {
    return this.inboxService
      .conversations()
      .filter((conversation) => this.inMailbox(conversation, mailbox)).length;
  }

  private hasAttachments(conversation: Conversation) {
    return conversation.messages.some((message) => message.attachments.length);
  }

  private lastDate(conversation: Conversation) {
    return conversation.messages[conversation.messages.length - 1].date;
  }

  private time(date: string) {
    return format(date, isToday(date) ? 'h:mm a' : 'MMM d');
  }
}
