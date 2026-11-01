import { Component } from '@angular/core';
import {
  MatSidenav,
  MatSidenavContainer,
  MatSidenavContent,
} from '@angular/material/sidenav';
import { RouterOutlet } from '@angular/router';
import { BuiScrollViewport } from '@/app/core/viewport-scroller';
import { Sidebar } from '@/app/domains/admin/layout/ui/sidebar';

@Component({
  selector: 'admin-layout',
  imports: [
    MatSidenav,
    MatSidenavContainer,
    MatSidenavContent,
    RouterOutlet,
    Sidebar,
    BuiScrollViewport,
  ],
  template: `
    <mat-sidenav-container
      class="bg-(--page-bg) [--page-bg:var(--color-neutral-1)] dark:[--page-bg:var(--color-neutral-2)]"
    >
      <!-- No end padding, so the page's own start padding is the gap -->
      <mat-sidenav
        class="w-14 border-none bg-transparent scheme-dark lg:w-16 lg:py-2 lg:ps-2"
        mode="side"
        opened
        disableClose
        fixedInViewport
      >
        <sidebar />
      </mat-sidenav>
      <mat-sidenav-content
        class="bg-transparent lg:h-dvh"
        buiScrollViewport
      >
        <!-- Content -->
        <router-outlet />
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
})
export class AdminLayout {}
