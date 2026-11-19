import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatPseudoCheckbox } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink } from '@angular/router';
import { MpxSecurity } from '@core/morphus';
import { MpxTheming } from '@core/morphus';
import {
  BuiSidebar,
  BuiSidebarBody,
  BuiSidebarFooter,
  BuiSidebarHeader,
  BuiSidebarSpacer,
} from '@builder-kit/sidebar';
import { MpxApplication } from '@morphus/entities/application';
import { Workspace } from '@morphus/entities/workspace';
import { MpxContextService } from '@morphus/services/morphus-context.service';
import { MpxMenuComponent } from '@src/components/morphus/menu';

@Component({
  imports: [
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    MatPseudoCheckbox,
    BuiSidebar,
    BuiSidebarHeader,
    BuiSidebarBody,
    BuiSidebarSpacer,
    BuiSidebarFooter,
    MpxMenuComponent,
  ],
  selector: 'mpx-admin-sidebar',
  host: {
    class: 'flex w-full flex-auto flex-col overflow-x-clip',
    '[class.scheme-dark]': 'theming.sidebarScheme() === "dark"',
    '[class.scheme-light]': 'theming.sidebarScheme() === "light"',
  },
  templateUrl: './admin-sidebar.component.html',
  styleUrl: './admin-sidebar.component.css',
})
export class MpxAdminSidebarComponent {
  protected readonly auth = inject(MpxSecurity);
  protected readonly context = inject(MpxContextService);
  protected readonly theming = inject(MpxTheming);

  protected selectWorkspace(workspace: Workspace): void {
    this.context.selectWorkspace(workspace);
  }

  protected selectApplication(application: MpxApplication): void {
    this.context.selectApplication(application);
  }
}
