import { CdkScrollable } from '@angular/cdk/scrolling';
import { Component, effect, inject, untracked, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatSidenav, MatSidenavContainer, MatSidenavContent } from '@angular/material/sidenav';
import { NavigationEnd, Router } from '@angular/router';
import { MpxMedia } from '@core/morphus';
import { MpxTheming } from '@core/morphus';
import { MpxScrollViewport } from '@core/morphus';
import { MpxContextService } from '@morphus/services/morphus-context.service';
import { MpxAdminContentComponent } from './content/admin-content.component';
import { MpxAdminSidebarComponent } from './sidebar/admin-sidebar.component';
import { MpxAdminTopBarComponent } from './topbar/admin-topbar.component';

@Component({
  imports: [
    MatSidenav,
    MatSidenavContainer,
    MatSidenavContent,
    MpxAdminSidebarComponent,
    MpxAdminContentComponent,
    MpxAdminTopBarComponent,
    CdkScrollable,
    MpxScrollViewport,
  ],
  selector: 'mpx-admin-layout',
  host: { class: 'flex min-h-full w-full flex-auto flex-col' },
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css',
})
export class MpxAdminLayout {
  private readonly media = inject(MpxMedia);
  private readonly router = inject(Router);
  private readonly context = inject(MpxContextService);
  protected readonly theming = inject(MpxTheming);
  private readonly sidenav = viewChild.required<MatSidenav>('sidenav');
  private readonly routerEvent = toSignal(this.router.events);
  protected readonly isMobile = this.media.match('(width < 1000px)');

  constructor() {
    effect(() => {
      const event = this.routerEvent();
      const isMobile = untracked(() => this.isMobile());

      if (!(event instanceof NavigationEnd) || !isMobile) {
        return;
      }

      untracked(() => this.sidenav().toggle(false));
    });

    effect(() => {
      const forceCollapsed = this.context.sidebarForceCollapsed();
      const isMobile = untracked(() => this.isMobile());
      untracked(() => {
        if (forceCollapsed) {
          void this.sidenav().toggle(false);
        } else if (!isMobile) {
          void this.sidenav().toggle(true);
        }
      });
    });
  }
}
