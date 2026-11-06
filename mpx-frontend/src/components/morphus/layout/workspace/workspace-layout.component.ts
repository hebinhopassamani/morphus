import { CdkScrollable } from '@angular/cdk/scrolling';
import { Component, effect, inject, untracked, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatSidenav, MatSidenavContainer, MatSidenavContent } from '@angular/material/sidenav';
import { NavigationEnd, Router } from '@angular/router';
import { Media } from '@core/mpx-media';
import { Theming } from '@core/mpx-theming';
import { MpxScrollViewport } from '@core/mpx-viewport-scroller';
import { MorphusContextService } from '@morphus/services/morphus-context.service';
import { MpxContentComponent } from './content/content.component';
import { MpxSidebarComponent } from './sidebar/sidebar.component';
import { MpxTopBarComponent } from './topbar/topbar.component';

@Component({
  imports: [
    MatSidenav,
    MatSidenavContainer,
    MatSidenavContent,
    MpxSidebarComponent,
    MpxContentComponent,
    MpxTopBarComponent,
    CdkScrollable,
    MpxScrollViewport,
  ],
  selector: 'mpx-layout',
  host: { class: 'flex min-h-full w-full flex-auto flex-col' },
  templateUrl: './workspace-layout.component.html',
})
export class MorphusWorkspaceLayout {
  private readonly media = inject(Media);
  private readonly router = inject(Router);
  private readonly context = inject(MorphusContextService);
  protected readonly theming = inject(Theming);
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

export { MorphusWorkspaceLayout as MorphusLayout };
