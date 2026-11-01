import { DatePipe, NgOptimizedImage, SlicePipe } from '@angular/common';
import {
  Component,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatPseudoCheckbox } from '@angular/material/core';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatTooltip } from '@angular/material/tooltip';
import { Router, RouterLink } from '@angular/router';
import {
  Attachment,
  contactOf,
  Folder,
  InboxService,
  LABELS,
  ME,
  Message,
} from '@/app/domains/admin/modules/inbox/data/inbox';
import { InboxFormatToolbar } from '@/app/domains/admin/modules/inbox/ui/format-toolbar';
import { InboxLabels } from '@/app/domains/admin/modules/inbox/ui/labels';

@Component({
  selector: 'conversation',
  imports: [
    DatePipe,
    FormsModule,
    InboxFormatToolbar,
    InboxLabels,
    MatButton,
    MatIcon,
    MatIconButton,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    MatPseudoCheckbox,
    MatTooltip,
    NgOptimizedImage,
    RouterLink,
    SlicePipe,
  ],
  host: {
    class: 'flex min-h-0 min-w-0 flex-auto flex-col',
  },
  template: `
    @if (conversation(); as conversation) {
      <!-- Header -->
      <header
        class="flex items-center gap-x-1 border-b border-neutral-a4 px-4 py-3"
      >
        <a
          matIconButton
          class="small md:hidden"
          routerLink="/inbox"
        >
          <mat-icon svgIcon="arrow-left" />
        </a>
        <button
          matIconButton
          class="small"
          matTooltip="Reply"
          (click)="replyInput.focus()"
        >
          <mat-icon svgIcon="reply" />
        </button>
        <button
          matIconButton
          class="small"
          matTooltip="Archive"
          (click)="move('archive')"
        >
          <mat-icon svgIcon="archive" />
        </button>
        <button
          matIconButton
          class="small"
          matTooltip="Delete"
          (click)="move('trash')"
        >
          <mat-icon svgIcon="trash" />
        </button>
        <button
          matIconButton
          class="small"
          matTooltip="Mark as unread"
          (click)="markUnread()"
        >
          <mat-icon svgIcon="mail" />
        </button>

        <!-- Spacer -->
        <div class="flex-auto"></div>

        <button
          matIconButton
          class="small"
          [matTooltip]="conversation.starred ? 'Unstar' : 'Star'"
          (click)="inboxService.toggleStar(conversation.id)"
        >
          <mat-icon
            [class]="
              conversation.starred ? 'text-amber-a10' : 'text-neutral-a8'
            "
            svgIcon="star"
          />
        </button>
        <button
          matIconButton
          class="small"
          [matMenuTriggerFor]="moreMenu"
        >
          <mat-icon svgIcon="ellipsis-vertical" />
        </button>
      </header>

      <!-- Body -->
      <div class="flex min-h-0 flex-auto flex-col overflow-y-auto px-6 py-5">
        <div class="text-xl font-semibold tracking-tight">
          {{ conversation.subject }}
        </div>
        @if (conversation.order || conversation.labels.length) {
          <div class="mt-2 flex flex-wrap items-center gap-1.5">
            @if (conversation.order; as order) {
              <a
                class="inline-flex items-center gap-x-1.5 rounded-md border border-neutral-a4 px-1.5 py-0.5 text-sm font-medium whitespace-nowrap text-neutral-a11 hover:bg-neutral-a3"
                [routerLink]="['/orders', order.id]"
              >
                <mat-icon
                  class="size-3.5"
                  svgIcon="shopping-cart"
                />
                Order #{{ order.id }}
              </a>
            }
            @if (conversation.labels.length) {
              <inbox-labels [labels]="conversation.labels" />
            }
          </div>
        }

        <!-- Messages -->
        <div class="mt-5 flex flex-col">
          @for (
            message of conversation.messages;
            track message.id;
            let last = $last
          ) {
            @if (last || expanded().includes(message.id)) {
              <div
                class="-mx-6 flex flex-col gap-y-4 border-t border-neutral-a4 px-6 py-5"
              >
                <div class="flex items-start gap-x-3">
                  @if (message.from.photo) {
                    <img
                      class="size-9 shrink-0 rounded-full object-cover"
                      width="36"
                      height="36"
                      [ngSrc]="message.from.photo"
                      [alt]="message.from.name"
                    />
                  } @else {
                    <div
                      class="flex size-9 shrink-0 items-center justify-center rounded-full font-semibold"
                      [class]="message.from.colorClass"
                    >
                      @if (message.from.icon) {
                        <mat-icon
                          class="size-4"
                          [svgIcon]="message.from.icon"
                        />
                      } @else {
                        {{ message.from.name | slice: 0 : 1 }}
                      }
                    </div>
                  }
                  <div class="flex min-w-0 flex-auto flex-col">
                    <div class="flex items-baseline gap-x-2">
                      @if (message.from.customerId; as customerId) {
                        <a
                          class="truncate font-semibold hover:underline"
                          [routerLink]="['/customers', customerId]"
                        >
                          {{ message.from.name }}
                        </a>
                      } @else {
                        <div class="truncate font-semibold">
                          {{ message.from.name }}
                        </div>
                      }
                      <div class="min-w-0 truncate text-sm text-neutral-a11">
                        {{ message.from.email }}
                      </div>
                      <div
                        class="ms-auto shrink-0 text-sm text-neutral-a11 tabular-nums"
                      >
                        {{ message.date | date: 'MMM d, h:mm a' }}
                      </div>
                    </div>
                    <div class="truncate text-sm text-neutral-a11">
                      to {{ recipients(message) }}
                    </div>
                  </div>
                </div>
                <div class="flex flex-col gap-y-3">
                  @for (paragraph of message.body; track $index) {
                    <p class="whitespace-pre-line">{{ paragraph }}</p>
                  }
                </div>
                @if (message.attachments.length) {
                  <div class="flex flex-wrap gap-2">
                    @for (attachment of message.attachments; track $index) {
                      <div
                        class="flex w-56 cursor-pointer items-center gap-x-3 rounded-lg border border-neutral-a4 px-3 py-2 hover:bg-neutral-a2"
                      >
                        <mat-icon
                          class="size-4 shrink-0 text-neutral-a11"
                          [svgIcon]="attachmentIcon(attachment)"
                        />
                        <div class="flex min-w-0 flex-col">
                          <div class="truncate text-sm font-medium">
                            {{ attachment.name }}
                          </div>
                          <div class="text-xs text-neutral-a11 tabular-nums">
                            {{ attachment.size }}
                          </div>
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>
            } @else {
              <button
                class="-mx-6 flex cursor-pointer items-center gap-x-3 border-t border-neutral-a4 px-6 py-3 text-start hover:bg-neutral-a2"
                (click)="expand(message)"
              >
                @if (message.from.photo) {
                  <img
                    class="size-7 shrink-0 rounded-full object-cover"
                    width="28"
                    height="28"
                    [ngSrc]="message.from.photo"
                    [alt]="message.from.name"
                  />
                } @else {
                  <div
                    class="flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
                    [class]="message.from.colorClass"
                  >
                    @if (message.from.icon) {
                      <mat-icon
                        class="size-3.5"
                        [svgIcon]="message.from.icon"
                      />
                    } @else {
                      {{ message.from.name | slice: 0 : 1 }}
                    }
                  </div>
                }
                <div class="w-32 shrink-0 truncate font-medium">
                  {{ message.from.name }}
                </div>
                <div class="min-w-0 flex-auto truncate text-neutral-a11">
                  {{ message.body.join(' ') }}
                </div>
                <div class="shrink-0 text-sm text-neutral-a11 tabular-nums">
                  {{ message.date | date: 'MMM d' }}
                </div>
              </button>
            }
          }
        </div>

        <!-- Reply -->
        <div
          class="flex flex-col rounded-lg border border-neutral-a4 focus-within:border-neutral-a7"
        >
          <textarea
            class="min-h-28 resize-none bg-transparent px-4 pt-3 outline-none"
            [placeholder]="'Reply to ' + contactOf(conversation).name"
            [ngModel]="reply()"
            (ngModelChange)="reply.set($event)"
            #replyInput
          ></textarea>
          <div class="flex items-center gap-x-2 px-2 pb-2">
            <inbox-format-toolbar />
            <button
              matButton
              class="primary small ms-auto"
              [disabled]="!reply().trim()"
              (click)="send()"
            >
              <mat-icon svgIcon="send" />
              Send
            </button>
          </div>
        </div>
      </div>

      <mat-menu
        xPosition="before"
        #moreMenu
      >
        <button
          mat-menu-item
          [matMenuTriggerFor]="moveMenu"
        >
          <mat-icon svgIcon="folder-input" />
          Move to
        </button>
        <button
          mat-menu-item
          [matMenuTriggerFor]="labelMenu"
        >
          <mat-icon svgIcon="tag" />
          Label as
        </button>
      </mat-menu>

      <mat-menu #moveMenu>
        <button
          mat-menu-item
          (click)="move('inbox')"
        >
          <mat-icon svgIcon="inbox" />
          Inbox
        </button>
        <button
          mat-menu-item
          (click)="move('archive')"
        >
          <mat-icon svgIcon="archive" />
          Archive
        </button>
        <button
          mat-menu-item
          (click)="move('trash')"
        >
          <mat-icon svgIcon="trash" />
          Trash
        </button>
      </mat-menu>

      <mat-menu #labelMenu>
        @for (label of labels; track label.id) {
          <button
            mat-menu-item
            (click)="inboxService.toggleLabel(conversation.id, label.id)"
          >
            <mat-pseudo-checkbox
              appearance="minimal"
              [state]="
                conversation.labels.includes(label.id) ? 'checked' : 'unchecked'
              "
            />
            <span class="ms-1">{{ label.name }}</span>
          </button>
        }
      </mat-menu>
    }
  `,
})
export default class ConversationPanel {
  // Dependencies
  private inboxService = inject(InboxService);
  private router = inject(Router);

  // Inputs / Outputs
  readonly id = input.required<string>();

  // State
  private labels = LABELS;
  private contactOf = contactOf;
  private expanded = linkedSignal({
    source: this.id,
    computation: (): string[] => [],
  });
  private reply = linkedSignal({
    source: this.id,
    computation: () => '',
  });

  // Computed state
  private conversation = computed(() => this.inboxService.byId(this.id()));

  constructor() {
    effect(() => {
      if (!this.conversation()) {
        this.router.navigate(['/inbox']);
      }
    });

    effect(() => {
      this.inboxService.setUnread(this.id(), false);
    });
  }

  private expand(message: Message) {
    this.expanded.update((ids) => [...ids, message.id]);
  }

  private send() {
    this.inboxService.reply(this.id(), this.reply().trim());
    this.reply.set('');
  }

  private markUnread() {
    this.inboxService.setUnread(this.id(), true);
    this.router.navigate(['/inbox']);
  }

  private move(folder: Folder) {
    this.inboxService.move(this.id(), folder);
    this.router.navigate(['/inbox']);
  }

  private recipients(message: Message) {
    return message.to
      .map((contact) => (contact === ME ? 'me' : contact.name))
      .join(', ');
  }

  private attachmentIcon(attachment: Attachment) {
    switch (attachment.type) {
      case 'image':
        return 'file-image';
      case 'spreadsheet':
        return 'file-spreadsheet';
      default:
        return 'file-text';
    }
  }
}
