import { CdkScrollable } from '@angular/cdk/scrolling';
import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  effect,
  ElementRef,
  inject,
  PLATFORM_ID,
  untracked,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import {
  MatSidenav,
  MatSidenavContainer,
  MatSidenavContent,
} from '@angular/material/sidenav';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Media } from '@/app/core/media';
import { Theming } from '@/app/core/theming';
import { BuiScrollViewport } from '@/app/core/viewport-scroller';
import { SidebarService } from '@/app/domains/admin/layout/data/sidebar';
import { ActionPanel } from '@/app/domains/admin/layout/ui/action-panel';
import { Notifications } from '@/app/domains/admin/layout/ui/notifications';
import { QuickSettings } from '@/app/domains/admin/layout/ui/quick-settings';
import { SchemeSwitcher } from '@/app/domains/admin/layout/ui/scheme-switcher';
import { Sidebar } from '@/app/domains/admin/layout/ui/sidebar';
import { User } from '@/app/domains/admin/layout/ui/user';

@Component({
  selector: 'admin-layout',
  imports: [
    MatIcon,
    MatIconButton,
    MatSidenav,
    MatSidenavContainer,
    MatSidenavContent,
    RouterOutlet,
    Sidebar,
    User,
    ActionPanel,
    Notifications,
    SchemeSwitcher,
    QuickSettings,
    CdkScrollable,
    BuiScrollViewport,
  ],
  template: `
    <mat-sidenav-container
      class="overflow-clip print:overflow-visible"
      [class.scheme-dark]="sidebarService.scheme() === 'dark'"
    >
      <mat-sidenav
        class="w-60 border-none print:hidden"
        autoFocus="a.active"
        [mode]="isMobile() ? 'over' : 'side'"
        [opened]="!isMobile()"
        [disableClose]="!isMobile()"
        fixedInViewport
        (openedStart)="centerActiveLink()"
        #sidenav
      >
        <sidebar />
      </mat-sidenav>
      <mat-sidenav-content
        class="min-w-0 overflow-clip bg-transparent lg:h-dvh lg:p-2 print:ms-0 print:h-auto print:overflow-visible"
        [class.scheme-light]="!theming.isDark()"
      >
        <div
          class="flex flex-auto flex-col bg-white shadow-xs lg:overflow-y-auto lg:rounded-lg lg:ring-1 lg:ring-neutral-a3 dark:bg-neutral-2 print:overflow-visible print:shadow-none"
          cdkScrollable
          buiScrollViewport
        >
          <!-- Header -->
          <div
            class="sticky top-0 z-99 flex items-center gap-x-2 border-b bg-white py-3 ps-4 pe-5 dark:bg-neutral-2 print:hidden"
          >
            <!-- Sidebar toggle button -->
            <button
              matIconButton
              (click)="sidenav.toggle()"
            >
              <mat-icon svgIcon="panel-left" />
            </button>

            <!-- Spacer -->
            <div class="flex-auto"></div>

            <quick-settings />

            <scheme-switcher />

            <!-- Action panel -->
            <action-panel compact />

            <!-- Notifications -->
            <notifications />

            <!-- User -->
            <user
              compact
              class="lg:hidden"
            />
          </div>

          <!-- Content -->
          <router-outlet />
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
})
export class AdminLayout {
  // Dependencies
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private media = inject(Media);
  private router = inject(Router);
  private sidebarService = inject(SidebarService);
  private theming = inject(Theming);

  // Queries
  readonly sidenav = viewChild.required<MatSidenav>('sidenav');
  private readonly sidenavElement = viewChild.required('sidenav', {
    read: ElementRef<HTMLElement>,
  });

  // State
  private routerEvent = toSignal(this.router.events);
  private isMobile = this.media.match(`(width < 64rem)`);

  constructor() {
    // Close sidenav on navigation (mobile only)
    effect(() => {
      const event = this.routerEvent();
      const isMobile = untracked(() => this.isMobile());

      if (!(event instanceof NavigationEnd) || !isMobile) {
        return;
      }

      untracked(() => this.sidenav().toggle(false));
    });
  }

  private centerActiveLink() {
    // Server DOM has no scrollIntoView
    if (!this.isBrowser) {
      return;
    }

    this.sidenavElement()
      .nativeElement.querySelector('a.active')
      ?.scrollIntoView({ block: 'center' });
  }
}
