import { Component, inject, viewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import {
  MatSidenav,
  MatSidenavContainer,
  MatSidenavContent,
} from '@angular/material/sidenav';
import { MatTooltip } from '@angular/material/tooltip';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { Media } from '@/app/core/media';
import {
  HelpCategory,
  HelpCenterService,
} from '@/app/domains/admin/modules/help-center/data/help-center';
import { HelpCategoryDialog } from '@/app/domains/admin/modules/help-center/ui/category-dialog';
import {
  BuiSidebar,
  BuiSidebarAction,
  BuiSidebarBadge,
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
  BuiSidebarSectionHeader,
} from '@/app/ui/sidebar';
import { bui } from '@/app/ui/utils';

@Component({
  selector: 'help-center-layout',
  imports: [
    BuiSidebar,
    BuiSidebarAction,
    BuiSidebarBadge,
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
    BuiSidebarSectionHeader,
    MatDivider,
    MatIcon,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    MatSidenav,
    MatSidenavContainer,
    MatSidenavContent,
    MatTooltip,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
  ],
  host: {
    class: 'flex h-dvh',
  },
  template: `
    <mat-sidenav-container class="bg-transparent">
      <!-- Categories -->
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
            <div class="text-3xl font-semibold tracking-tighter">
              Help center
            </div>
          </div>

          <!-- Body -->
          <div buiSidebarBody>
            <!-- All articles -->
            <div buiSidebarSection>
              <div buiSidebarSectionContent>
                <ul buiSidebarMenu>
                  <li buiSidebarMenuItem>
                    <div buiSidebarMenuRow>
                      <a
                        buiSidebarButton
                        routerLink="/help-center"
                        routerLinkActive="active"
                        [routerLinkActiveOptions]="{ exact: true }"
                        (click)="close()"
                      >
                        <mat-icon
                          buiSidebarIcon
                          svgIcon="book-open"
                        />
                        <span buiSidebarLabel>All articles</span>
                        @if (articles().length) {
                          <div buiSidebarBadge>{{ articles().length }}</div>
                        }
                      </a>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <!-- Categories -->
            <div buiSidebarSection>
              <div buiSidebarSectionHeader>
                <span buiSidebarLabel>Categories</span>
                <button
                  buiSidebarAction
                  matTooltip="New category"
                  (click)="openCategoryDialog()"
                >
                  <mat-icon
                    buiSidebarIcon
                    svgIcon="plus"
                  />
                </button>
              </div>
              <div buiSidebarSectionContent>
                <ul buiSidebarMenu>
                  @for (category of categories(); track category.id) {
                    @let count =
                      helpCenterService.byCategory(category.id).length;
                    <li buiSidebarMenuItem>
                      <div buiSidebarMenuRow>
                        <a
                          buiSidebarButton
                          routerLinkActive="active"
                          [routerLink]="['/help-center/category', category.id]"
                          (click)="close()"
                          #link="routerLinkActive"
                        >
                          <mat-icon
                            buiSidebarIcon
                            [svgIcon]="category.icon"
                          />
                          <span buiSidebarLabel>{{ category.name }}</span>
                          @if (count) {
                            <div
                              buiSidebarBadge
                              class="absolute end-1.5 top-1/2 -translate-y-1/2 text-neutral-a11 group-hover/bui-sidebar-menu-row:invisible group-has-focus-visible/bui-sidebar-menu-row:invisible"
                              [class.invisible]="trigger.menuOpen"
                            >
                              {{ count }}
                            </div>
                          }
                        </a>
                        <button
                          buiSidebarAction
                          class="opacity-0 group-hover/bui-sidebar-menu-row:opacity-100 focus-visible:opacity-100 aria-expanded:opacity-100"
                          [matMenuTriggerFor]="categoryMenu"
                          #trigger="matMenuTrigger"
                        >
                          <mat-icon
                            buiSidebarIcon
                            svgIcon="ellipsis"
                          />
                        </button>
                        <mat-menu #categoryMenu>
                          <button
                            mat-menu-item
                            (click)="openCategoryDialog(category)"
                          >
                            <mat-icon svgIcon="pencil" />
                            Edit
                          </button>
                          <mat-divider />
                          <button
                            mat-menu-item
                            class="text-red-a11 hover:bg-red-a3"
                            (click)="removeCategory(category.id, link.isActive)"
                          >
                            <mat-icon
                              class="text-red-a11"
                              svgIcon="trash"
                            />
                            Delete
                          </button>
                        </mat-menu>
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
        <router-outlet />
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
})
export default class HelpCenterLayout {
  // Dependencies
  private helpCenterService = inject(HelpCenterService);
  private matDialog = inject(MatDialog);
  private media = inject(Media);
  private router = inject(Router);

  // Queries
  readonly sidenav = viewChild.required(MatSidenav);

  // State
  private articles = this.helpCenterService.articles;
  private categories = this.helpCenterService.categories;
  readonly isNarrow = this.media.match(`(width < 80rem)`);

  toggle() {
    this.sidenav().toggle();
  }

  private close() {
    if (this.isNarrow()) {
      this.sidenav().close();
    }
  }

  private openCategoryDialog(category?: HelpCategory) {
    this.matDialog.open(HelpCategoryDialog, {
      autoFocus: false,
      panelClass: bui('w-full max-w-sm').split(' '),
      data: { category },
    });
  }

  private removeCategory(id: string, isActive: boolean) {
    this.helpCenterService.removeCategory(id);

    if (isActive) {
      this.router.navigate(['/help-center']);
    }
  }
}
