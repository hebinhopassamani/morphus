import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NAVIGATION } from '@/app/domains/admin/layout/data/navigation';
import { ActionPanel } from '@/app/domains/admin/layout/ui/action-panel';
import { Notifications } from '@/app/domains/admin/layout/ui/notifications';
import { User } from '@/app/domains/admin/layout/ui/user';
import {
  BuiSidebar,
  BuiSidebarBody,
  BuiSidebarButton,
  BuiSidebarFooter,
  BuiSidebarHeader,
  BuiSidebarIcon,
  BuiSidebarMenu,
  BuiSidebarMenuItem,
  BuiSidebarMenuRow,
  BuiSidebarSection,
  BuiSidebarSectionContent,
} from '@/app/ui/sidebar';

@Component({
  selector: 'sidebar',
  imports: [
    NgOptimizedImage,
    MatIcon,
    MatTooltip,
    RouterLink,
    RouterLinkActive,
    ActionPanel,
    Notifications,
    User,
    BuiSidebar,
    BuiSidebarHeader,
    BuiSidebarBody,
    BuiSidebarSection,
    BuiSidebarSectionContent,
    BuiSidebarMenu,
    BuiSidebarMenuItem,
    BuiSidebarMenuRow,
    BuiSidebarButton,
    BuiSidebarIcon,
    BuiSidebarFooter,
  ],
  host: {
    class: 'flex w-full flex-auto flex-col',
  },
  template: `
    <aside
      buiSidebar
      class="flex-auto bg-neutral-1 lg:rounded-2xl"
    >
      <!-- Header -->
      <div
        buiSidebarHeader
        class="flex justify-center p-3"
      >
        <!-- Logo -->
        <a
          class="flex size-8 items-center justify-center rounded-full"
          routerLink="/"
        >
          <img
            class="size-full"
            ngSrc="/images/logo/logomark-dark.svg"
            width="40"
            height="40"
            alt="Horizon logo"
          />
        </a>
      </div>

      <!-- Body -->
      <div
        buiSidebarBody
        class="gap-y-3 px-3 pt-0"
      >
        <!-- Search -->
        <div
          buiSidebarSection
          class="p-0"
        >
          <div buiSidebarSectionContent>
            <ul
              buiSidebarMenu
              class="gap-y-2"
            >
              <li
                buiSidebarMenuItem
                matTooltip="Search"
                matTooltipPosition="after"
              >
                <div buiSidebarMenuRow>
                  <action-panel />
                </div>
              </li>
            </ul>
          </div>
        </div>

        <!-- Navigation -->
        <div
          buiSidebarSection
          class="p-0"
        >
          <div buiSidebarSectionContent>
            <ul
              buiSidebarMenu
              class="gap-y-2"
            >
              @for (item of navigation; track item.id) {
                <li
                  buiSidebarMenuItem
                  [matTooltip]="item.label"
                  matTooltipPosition="after"
                >
                  <div buiSidebarMenuRow>
                    <a
                      buiSidebarButton
                      [routerLink]="item.route"
                      routerLinkActive="active"
                      [attr.aria-label]="item.label"
                    >
                      <mat-icon
                        buiSidebarIcon
                        [svgIcon]="item.icon"
                      />
                    </a>
                  </div>
                </li>
              }
            </ul>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div
        buiSidebarFooter
        class="flex flex-col items-center gap-y-2 p-3"
      >
        <!-- Notifications -->
        <notifications />

        <!-- User -->
        <user />
      </div>
    </aside>
  `,
})
export class Sidebar {
  // State
  private navigation = NAVIGATION;
}
