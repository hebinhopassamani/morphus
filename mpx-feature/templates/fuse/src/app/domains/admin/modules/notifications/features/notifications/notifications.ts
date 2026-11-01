import { NgOptimizedImage, SlicePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatTabLink, MatTabNav, MatTabNavPanel } from '@angular/material/tabs';
import { MatTooltip } from '@angular/material/tooltip';
import { Router, RouterLink } from '@angular/router';
import {
  differenceInSeconds,
  formatDistanceToNowStrict,
  isThisWeek,
  isToday,
  isYesterday,
} from 'date-fns';
import {
  Notification,
  NotificationAction,
  NotificationsService,
  NotificationType,
} from '@/app/domains/admin/modules/notifications/data/notifications';
import {
  BuiCombobox,
  BuiComboboxContent,
  BuiComboboxListbox,
  BuiComboboxOption,
  BuiComboboxOptionIndicator,
  BuiComboboxPortal,
  BuiComboboxTrigger,
} from '@/app/ui/combobox';

type View = 'all' | 'unread' | 'mentions';

type ViewOption = {
  id: View;
  label: string;
  icon: string;
};

type TypeOption = {
  id: NotificationType | null;
  label: string;
};

type Group = 'today' | 'yesterday' | 'week' | 'older';

type GroupOption = {
  id: Group;
  label: string;
};

const VIEW_OPTIONS: ViewOption[] = [
  {
    id: 'all',
    label: 'All',
    icon: 'bell',
  },
  {
    id: 'unread',
    label: 'Unread',
    icon: 'circle-dot',
  },
  {
    id: 'mentions',
    label: 'Mentions',
    icon: 'at-sign',
  },
];

const TYPE_OPTIONS: TypeOption[] = [
  {
    id: null,
    label: 'All',
  },
  {
    id: 'orders',
    label: 'Orders',
  },
  {
    id: 'tasks',
    label: 'Tasks',
  },
  {
    id: 'projects',
    label: 'Projects',
  },
  {
    id: 'team',
    label: 'Team',
  },
  {
    id: 'billing',
    label: 'Billing',
  },
  {
    id: 'security',
    label: 'Security',
  },
];

const GROUP_OPTIONS: GroupOption[] = [
  {
    id: 'today',
    label: 'Today',
  },
  {
    id: 'yesterday',
    label: 'Yesterday',
  },
  {
    id: 'week',
    label: 'Earlier this week',
  },
  {
    id: 'older',
    label: 'Older',
  },
];

@Component({
  selector: 'notifications',
  imports: [
    BuiCombobox,
    BuiComboboxContent,
    BuiComboboxListbox,
    BuiComboboxOption,
    BuiComboboxOptionIndicator,
    BuiComboboxPortal,
    BuiComboboxTrigger,
    MatButton,
    MatDivider,
    MatIcon,
    MatIconButton,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    MatTabLink,
    MatTabNav,
    MatTabNavPanel,
    MatTooltip,
    NgOptimizedImage,
    RouterLink,
    SlicePipe,
  ],
  template: `
    <div
      class="mx-auto flex w-full max-w-4xl flex-auto flex-col gap-4 p-6 sm:gap-6 lg:p-8"
    >
      <!-- Header -->
      <div class="flex items-center justify-between gap-x-3">
        <div class="flex flex-col gap-y-0.5">
          <div class="text-3xl font-semibold tracking-tighter">
            Notifications
          </div>
          <div class="text-neutral-a11 sm:text-lg">
            Orders, tasks and workspace activity that needs your attention.
          </div>
        </div>

        <!-- Spacer -->
        <div class="flex-auto"></div>

        <!-- Actions -->
        <div class="flex shrink-0 items-center gap-x-3">
          <button
            matButton
            class="hidden sm:flex"
            (click)="notificationsService.markAllRead()"
          >
            <mat-icon svgIcon="check-check" />
            Mark all as read
          </button>
          <button
            matIconButton
            class="sm:hidden"
            matTooltip="Mark all as read"
            (click)="notificationsService.markAllRead()"
          >
            <mat-icon svgIcon="check-check" />
          </button>
          <a
            matIconButton
            routerLink="/settings/notifications"
            matTooltip="Notification settings"
          >
            <mat-icon svgIcon="settings-2" />
          </a>
        </div>
      </div>

      <div class="flex flex-col">
        <!-- Views -->
        <nav
          mat-tab-nav-bar
          [tabPanel]="tabPanel"
          [mat-stretch-tabs]="false"
          ngSkipHydration
        >
          @for (option of viewOptions; track option.id) {
            <button
              mat-tab-link
              [active]="view() === option.id"
              (click)="view.set(option.id)"
            >
              <mat-icon
                class="size-4 text-current"
                [svgIcon]="option.icon"
              />
              <span class="ms-2">{{ option.label }}</span>
              <span
                class="ms-2 rounded-sm bg-neutral-a3 px-1.5 py-px text-xs font-medium text-neutral-a11 tabular-nums"
              >
                {{ viewCounts()[option.id] }}
              </span>
            </button>
          }
        </nav>

        <mat-tab-nav-panel
          class="flex flex-col gap-y-3 pt-4"
          #tabPanel
        >
          <!-- Filters -->
          <div class="flex items-center">
            <div class="flex items-center rounded-lg bg-neutral-a3">
              <div
                buiCombobox
                class="w-fit"
                [value]="[typeFilter()]"
                (valueChange)="typeFilter.set($event[0] ?? typeFilter())"
              >
                <button
                  matButton
                  class="tertiary tiny hover:bg-neutral-a4"
                  buiComboboxTrigger
                  id="notifications-type-filter"
                >
                  <span class="font-medium">
                    Type:
                    <span class="font-normal">{{ typeFilter().label }}</span>
                  </span>
                  <mat-icon
                    svgIcon="chevron-down"
                    iconPositionEnd
                  />
                </button>
                <ng-template
                  buiComboboxPortal
                  matchWidth="false"
                >
                  <div
                    buiComboboxContent
                    class="min-w-40"
                  >
                    <div
                      buiComboboxListbox
                      aria-labelledby="notifications-type-filter"
                      focusMode="activedescendant"
                      selectionMode="explicit"
                    >
                      @for (option of typeOptions; track option.label) {
                        <div
                          buiComboboxOption
                          [value]="option"
                          [label]="option.label"
                        >
                          <span class="flex-auto truncate">{{
                            option.label
                          }}</span>
                          <span buiComboboxOptionIndicator></span>
                        </div>
                      }
                    </div>
                  </div>
                </ng-template>
              </div>
            </div>
          </div>

          <!-- Feed -->
          <div class="flex flex-col gap-y-6">
            @for (group of groups(); track group.id) {
              <div class="flex flex-col">
                <!-- Date -->
                <div class="font-medium text-neutral-a11">
                  {{ group.label }}
                </div>

                <div class="mt-2 flex flex-col">
                  @for (
                    notification of group.notifications;
                    track notification.id;
                    let last = $last
                  ) {
                    <div
                      class="-mx-3 flex flex-col rounded-lg px-3 py-3 hover:bg-neutral-a2"
                    >
                      @let alignment =
                        notification.detail ? 'items-start' : 'items-center';
                      <div
                        class="flex gap-x-3"
                        [class]="alignment"
                      >
                        <div
                          class="flex min-w-0 flex-auto cursor-pointer gap-x-3"
                          [class]="alignment"
                          role="button"
                          tabindex="0"
                          (click)="open(notification)"
                          (keydown.enter)="open(notification)"
                        >
                          <!-- Actor / Icon -->
                          @let actor = notification.actor;
                          @if (actor) {
                            @if (actor.photo) {
                              <img
                                class="size-8 shrink-0 rounded-full object-cover"
                                width="32"
                                height="32"
                                [ngSrc]="actor.photo"
                                [alt]="actor.name"
                              />
                            } @else {
                              <div
                                class="flex size-8 shrink-0 items-center justify-center rounded-full bg-neutral-a3 font-medium text-neutral-a11"
                              >
                                {{ actor.name | slice: 0 : 1 }}
                              </div>
                            }
                          } @else {
                            <div
                              class="flex size-8 shrink-0 items-center justify-center rounded-full bg-neutral-a3 text-neutral-a11"
                            >
                              <mat-icon
                                class="size-4"
                                [svgIcon]="notification.icon"
                              />
                            </div>
                          }

                          <div class="flex min-w-0 flex-auto flex-col">
                            <!-- Sentence -->
                            <div class="text-pretty text-neutral-a11">
                              @if (actor) {
                                <span class="font-medium text-neutral-12">
                                  {{ actor.name }}
                                </span>
                              }
                              {{ notification.action }}
                              @if (notification.target?.label; as label) {
                                <span class="font-medium text-neutral-12">
                                  {{ label }}
                                </span>
                              }
                            </div>

                            <!-- Detail -->
                            @if (notification.detail) {
                              <div class="mt-1 text-sm text-pretty">
                                {{ notification.detail }}
                              </div>
                            }
                          </div>

                          <!-- Time & Unread indicator -->
                          <div
                            class="flex h-5 shrink-0 items-center gap-x-2 text-sm text-neutral-a11"
                          >
                            {{ relativeDate(notification.date) }}
                            <div
                              class="size-1.5 rounded-full bg-primary-9"
                              [class.invisible]="notification.read"
                            ></div>
                          </div>
                        </div>

                        <!-- Menu -->
                        <button
                          matIconButton
                          class="tiny -my-0.5"
                          [matMenuTriggerFor]="notificationActions"
                        >
                          <mat-icon svgIcon="ellipsis-vertical" />
                        </button>
                        <mat-menu
                          xPosition="before"
                          #notificationActions="matMenu"
                        >
                          <button
                            mat-menu-item
                            (click)="
                              notificationsService.setRead(
                                notification.id,
                                !notification.read
                              )
                            "
                          >
                            <mat-icon
                              [svgIcon]="
                                notification.read ? 'circle-dot' : 'check'
                              "
                            />
                            {{
                              notification.read
                                ? 'Mark as unread'
                                : 'Mark as read'
                            }}
                          </button>
                          <button
                            mat-menu-item
                            (click)="
                              notificationsService.remove(notification.id)
                            "
                          >
                            <mat-icon svgIcon="trash" />
                            Remove
                          </button>
                        </mat-menu>
                      </div>

                      <!-- Responses -->
                      @if (notification.actions) {
                        <div class="mt-3 flex items-center gap-x-2 ps-11">
                          @for (
                            action of notification.actions;
                            track action.value
                          ) {
                            <button
                              matButton
                              class="small"
                              [class]="action.variant"
                              (click)="respond(notification, action)"
                            >
                              {{ action.label }}
                            </button>
                          }
                        </div>
                      }
                    </div>

                    @if (!last) {
                      <mat-divider />
                    }
                  }
                </div>
              </div>
            } @empty {
              <div
                class="flex flex-col items-center justify-center gap-y-2 py-10"
              >
                @if (!notifications().length) {
                  <mat-icon
                    class="size-10"
                    svgIcon="bell-off"
                  />
                  <div class="font-medium">No notifications</div>
                  <div class="text-center text-neutral-a11">
                    Activity on orders, tasks and your workspace shows up here.
                  </div>
                } @else if (view() === 'unread' && !viewCounts().unread) {
                  <mat-icon
                    class="size-10"
                    svgIcon="check-check"
                  />
                  <div class="font-medium">You’re all caught up</div>
                  <div class="text-center text-neutral-a11">
                    New notifications land here as they arrive.
                  </div>
                } @else {
                  <mat-icon
                    class="size-10"
                    svgIcon="bell"
                  />
                  <div class="text-center text-neutral-a11">
                    No notifications match this view.
                  </div>
                }
              </div>
            }
          </div>
        </mat-tab-nav-panel>
      </div>
    </div>
  `,
})
export default class Notifications {
  // Dependencies
  private notificationsService = inject(NotificationsService);
  private router = inject(Router);

  // State
  private notifications = this.notificationsService.notifications;
  private viewOptions = VIEW_OPTIONS;
  private typeOptions = TYPE_OPTIONS;
  private view = signal<View>('all');
  private typeFilter = signal(TYPE_OPTIONS[0]);

  // Computed state
  private viewCounts = computed(
    () =>
      Object.fromEntries(
        VIEW_OPTIONS.map((option) => [
          option.id,
          this.notifications().filter((notification) =>
            this.inView(notification, option.id)
          ).length,
        ])
      ) as Record<View, number>
  );
  private groups = computed(() => {
    const notifications = this.notifications().filter(
      (notification) =>
        this.inView(notification, this.view()) &&
        (!this.typeFilter().id || notification.type === this.typeFilter().id)
    );

    return GROUP_OPTIONS.map((group) => ({
      ...group,
      notifications: notifications.filter(
        (notification) => this.group(notification.date) === group.id
      ),
    })).filter((group) => group.notifications.length);
  });

  private inView(notification: Notification, view: View) {
    switch (view) {
      case 'unread':
        return !notification.read;
      case 'mentions':
        return notification.mention;
      default:
        return true;
    }
  }

  private group(date: string): Group {
    if (isToday(date)) {
      return 'today';
    }

    if (isYesterday(date)) {
      return 'yesterday';
    }

    return isThisWeek(date, { weekStartsOn: 1 }) ? 'week' : 'older';
  }

  private open(notification: Notification) {
    this.notificationsService.setRead(notification.id, true);

    if (notification.target) {
      this.router.navigate(notification.target.link);
    }
  }

  private respond(notification: Notification, action: NotificationAction) {
    if (action.value === 'view' || action.value === 'open') {
      this.open(notification);
      return;
    }

    this.notificationsService.resolve(notification.id);
  }

  private relativeDate(date: string) {
    if (differenceInSeconds(Date.now(), date) < 60) {
      return 'Just now';
    }

    return formatDistanceToNowStrict(date, { addSuffix: true });
  }
}
