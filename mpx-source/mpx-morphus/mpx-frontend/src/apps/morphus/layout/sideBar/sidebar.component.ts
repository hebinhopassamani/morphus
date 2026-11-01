import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Theming } from '@/apps/core/theming';
import {
  BuiSidebar,
  BuiSidebarBody,
  BuiSidebarHeader,
  BuiSidebarSpacer,
} from '@builder-kit/sidebar';
import { MorphusContextService } from '@morphus/services/morphus-context.service';
import { MpxMenuComponent } from '@src/components/morphus/menu';

@Component({
  imports: [
    RouterLink,
    BuiSidebar,
    BuiSidebarHeader,
    BuiSidebarBody,
    BuiSidebarSpacer,
    MpxMenuComponent,
  ],
  selector: 'mpx-sidebar',
  host: {
    class: 'flex w-full flex-auto flex-col overflow-x-clip',
    '[class.scheme-dark]': 'theming.sidebarScheme() === "dark"',
  },
  styleUrl: './sidebar.component.css',
  templateUrl: './sidebar.component.html',
})
export class MpxSidebarComponent {
  protected readonly context = inject(MorphusContextService);
  protected readonly theming = inject(Theming);
}
