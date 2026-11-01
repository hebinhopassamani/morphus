import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatPseudoCheckbox } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink } from '@angular/router';
import { Auth } from '@/apps/core/auth';
import { Theming } from '@/apps/core/theming';
import {
  BuiSidebar,
  BuiSidebarBody,
  BuiSidebarFooter,
  BuiSidebarHeader,
  BuiSidebarSpacer,
} from '@builder-kit/sidebar';
import { MorphusApplication } from '@morphus/entities/application';
import { Workspace } from '@morphus/entities/workspace';
import { MorphusContextService } from '@morphus/services/morphus-context.service';
import { CorporationSummary } from '@security/entities/Session';
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
  selector: 'mpx-sidebar',
  host: {
    class: 'flex w-full flex-auto flex-col overflow-x-clip',
    '[class.scheme-dark]': 'theming.sidebarScheme() === "dark"',
  },
  styleUrl: './sidebar.component.css',
  templateUrl: './sidebar.component.html',
})
export class MpxSidebarComponent {
  protected readonly auth = inject(Auth);
  protected readonly context = inject(MorphusContextService);
  protected readonly theming = inject(Theming);

  protected selectCorporation(corp: CorporationSummary): void {
    this.context.switchCorporation(corp);
  }

  protected selectWorkspace(workspace: Workspace): void {
    this.context.selectWorkspace(workspace);
  }

  protected selectApplication(application: MorphusApplication): void {
    this.context.selectApplication(application);
  }
}
