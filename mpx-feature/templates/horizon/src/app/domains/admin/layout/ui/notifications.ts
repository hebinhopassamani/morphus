import { SlicePipe } from '@angular/common';
import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { MatTooltip } from '@angular/material/tooltip';
import { Router, RouterLink } from '@angular/router';
import {
  Notification,
  NotificationAction,
  NotificationsService,
} from '@/app/domains/admin/layout/data/notifications';
import {
  BuiPopover,
  BuiPopoverClose,
  BuiPopoverContent,
  BuiPopoverPortal,
  BuiPopoverTrigger,
} from '@/app/ui/popover';

@Component({
  selector: 'notifications',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    RouterLink,
    BuiPopover,
    BuiPopoverTrigger,
    BuiPopoverPortal,
    BuiPopoverContent,
    MatTabGroup,
    MatTab,
    MatTooltip,
    BuiPopoverClose,
    SlicePipe,
  ],
  template: `
    <div
      buiPopover
      class="w-full sm:max-w-xs"
      position="end-bottom"
      [closeOnScroll]="true"
    >
      <!-- Trigger -->
      <button
        matIconButton
        buiPopoverTrigger
        matTooltip="Notifications"
        matTooltipPosition="after"
      >
        <mat-icon svgIcon="bell-dot" />
      </button>

      <!-- Panel -->
      <ng-template buiPopoverPortal>
        <div
          buiPopoverContent
          class="p-0 [--popover-border-radius:calc(var(--theme-border-radius)*1.5)]"
        >
          <!-- Header -->
          <div class="mx-6 mt-5 flex items-center gap-x-1">
            <div class="text-xl font-medium">Notifications</div>

            <div class="flex-auto"></div>

            <button
              matIconButton
              class="small"
              matTooltip="Mark all as read"
              (click)="notificationsService.markAllRead()"
            >
              <mat-icon svgIcon="check-check" />
            </button>
            <a
              matIconButton
              buiPopoverClose
              class="small"
              routerLink="/settings/notifications"
              matTooltip="Settings"
            >
              <mat-icon svgIcon="settings-2" />
            </a>
            <button
              matIconButton
              buiPopoverClose
              class="small"
              matTooltip="Close"
            >
              <mat-icon svgIcon="x" />
            </button>
          </div>

          <!-- Filters -->
          <mat-tab-group
            class="mx-6 mt-2"
            [animationDuration]="0"
            [fitInkBarToContent]="true"
            [mat-stretch-tabs]="false"
            mat-align-tabs="start"
            [(selectedIndex)]="filter"
          >
            <mat-tab label="All"></mat-tab>
            <mat-tab label="Unread"></mat-tab>
            <mat-tab label="Mentions"></mat-tab>
          </mat-tab-group>

          <!-- Notifications -->
          <div
            class="flex flex-col gap-y-2 overflow-y-auto overscroll-contain px-6 pt-1 pb-4 sm:max-h-88"
          >
            @for (
              notification of filteredNotifications();
              track notification.id;
              let last = $last
            ) {
              <div
                class="flex gap-x-3 py-2"
                [class]="
                  notification.description
                    ? 'items-start'
                    : 'items-center *:mt-0'
                "
              >
                <!-- User photo / Icon -->
                @let user = notification.actor;
                @let icon = notification.icon;
                @if (user) {
                  @if (user.photo) {
                    <img
                      [src]="user.photo"
                      [alt]="user.name"
                      class="mt-1 size-7 shrink-0 rounded-lg object-cover"
                      width="28"
                      height="28"
                    />
                  } @else {
                    <div
                      class="mt-1 flex size-7 shrink-0 items-center justify-center rounded-lg bg-neutral-a4 font-medium text-neutral-a11"
                    >
                      {{ user.name | slice: 0 : 1 }}
                    </div>
                  }
                } @else if (icon) {
                  <div
                    class="mt-1 flex size-7 shrink-0 items-center justify-center rounded-lg bg-neutral-a4 font-medium text-neutral-a11"
                  >
                    <mat-icon
                      [svgIcon]="icon"
                      class="size-3.5"
                    />
                  </div>
                }

                <div class="flex flex-col">
                  <!-- Title -->
                  <div class="font-medium">{{ notification.title }}</div>

                  <!-- Description -->
                  @if (notification.description) {
                    <div class="text-xs">{{ notification.description }}</div>
                  }

                  <!-- Actions -->
                  @if (notification.actions) {
                    <div class="mt-2.5 flex items-center gap-x-2">
                      @for (
                        action of notification.actions;
                        track action.value
                      ) {
                        <button
                          matButton
                          class="tiny"
                          [class]="action.variant"
                          (click)="respond(notification, action)"
                        >
                          {{ action.label }}
                        </button>
                      }
                    </div>
                  }
                </div>
              </div>

              @if (!last) {
                <mat-divider />
              }
            }
          </div>
        </div>
      </ng-template>
    </div>
  `,
})
export class Notifications {
  // Dependencies
  private readonly notificationsService = inject(NotificationsService);
  private readonly router = inject(Router);

  // Queries
  private readonly popover = viewChild.required(BuiPopover);

  // State
  private readonly filter = signal<0 | 1 | 2>(0);
  private readonly notifications = this.notificationsService.notifications;

  // Computed state
  private filteredNotifications = computed(() => {
    const filter = this.filter();

    return this.notifications().filter((notification) => {
      if (filter === 1) return !notification.read;
      if (filter === 2) return notification.mention;
      return true;
    });
  });

  private open(notification: Notification) {
    this.notificationsService.setRead(notification.id, true);
    this.popover().close();

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
}
