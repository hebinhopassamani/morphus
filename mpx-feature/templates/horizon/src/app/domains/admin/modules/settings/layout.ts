import { Component, inject, viewChild } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import {
  MatSidenav,
  MatSidenavContainer,
  MatSidenavContent,
} from '@angular/material/sidenav';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Media } from '@/app/core/media';
import {
  BuiSidebar,
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
} from '@/app/ui/sidebar';

@Component({
  selector: 'settings-layout',
  imports: [
    BuiSidebar,
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
    MatIcon,
    MatSidenav,
    MatSidenavContainer,
    MatSidenavContent,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
  ],
  host: {
    class: 'flex h-dvh',
  },
  template: `
    <mat-sidenav-container class="bg-transparent">
      <!-- Sections -->
      <mat-sidenav
        class="w-60 bg-(--page-bg)"
        [mode]="isNarrow() ? 'over' : 'side'"
        [opened]="!isNarrow()"
        [disableClose]="!isNarrow()"
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
            <div class="text-3xl font-semibold tracking-tighter">Settings</div>
          </div>

          <!-- Body -->
          <div buiSidebarBody>
            <div buiSidebarSection>
              <div buiSidebarSectionContent>
                <ul buiSidebarMenu>
                  @for (link of links; track link.route) {
                    <li buiSidebarMenuItem>
                      <div buiSidebarMenuRow>
                        <a
                          buiSidebarButton
                          routerLinkActive="active"
                          [routerLink]="link.route"
                          (click)="close()"
                        >
                          <mat-icon
                            buiSidebarIcon
                            [svgIcon]="link.icon"
                          />
                          <span buiSidebarLabel>{{ link.label }}</span>
                        </a>
                      </div>
                    </li>
                  }
                </ul>
              </div>
            </div>
          </div>
        </aside>
      </mat-sidenav>

      <mat-sidenav-content class="bg-transparent">
        <!-- Page -->
        <div class="mx-auto w-full max-w-3xl p-5 pb-10">
          <router-outlet />
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
})
export default class SettingsLayout {
  // Dependencies
  private media = inject(Media);

  // Queries
  readonly sidenav = viewChild.required(MatSidenav);

  // State
  private links = [
    {
      route: '/settings/account',
      label: 'Account',
      icon: 'user-round',
    },
    {
      route: '/settings/team',
      label: 'Team and agents',
      icon: 'users-round',
    },
    {
      route: '/settings/billing',
      label: 'Billing',
      icon: 'receipt-text',
    },
    {
      route: '/settings/notifications',
      label: 'Notifications',
      icon: 'bell',
    },
    {
      route: '/settings/security',
      label: 'Security',
      icon: 'fingerprint-pattern',
    },
    {
      route: '/settings/channels',
      label: 'Channels',
      icon: 'inbox',
    },
    {
      route: '/settings/rules',
      label: 'Rules',
      icon: 'workflow',
    },
  ];
  readonly isNarrow = this.media.match(`(width < 80rem)`);

  toggle() {
    this.sidenav().toggle();
  }

  private close() {
    if (this.isNarrow()) {
      this.sidenav().close();
    }
  }
}
