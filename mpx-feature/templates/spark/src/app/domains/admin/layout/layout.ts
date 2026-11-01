import { Component, computed, inject } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterOutlet } from '@angular/router';
import { Media } from '@/app/core/media';
import { AppSidebar } from '@/app/domains/admin/layout/ui/sidebar';

@Component({
  selector: 'admin-layout',
  imports: [RouterOutlet, MatSidenavModule, MatIcon, MatIconButton, AppSidebar],
  template: `
    <mat-sidenav-container>
      <mat-sidenav
        [disableClose]="!isMobile()"
        [mode]="isMobile() ? 'over' : 'side'"
        [opened]="!isMobile()"
        fixedInViewport
        #sidenav
      >
        <app-sidebar />
      </mat-sidenav>
      <mat-sidenav-content class="overflow-hidden">
        <div class="flex items-center gap-x-4 border-b px-6 py-4">
          <button
            matIconButton
            (click)="sidenav.toggle()"
          >
            <mat-icon svgIcon="panel-left" />
          </button>
        </div>

        <div class="flex-auto">
          <router-outlet />
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
})
export default class AdminLayout {
  // Dependencies
  private media = inject(Media);

  // State
  private isMobile = computed(() => this.media.match(`(max-width: 767px)`)());
}
