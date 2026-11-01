import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { navigation } from '@/app/domains/admin/layout/data/navigation';
import { User } from '@/app/domains/admin/layout/ui/user';
import {
  BuiSidebar,
  BuiSidebarBody,
  BuiSidebarButton,
  BuiSidebarFooter,
  BuiSidebarHeader,
  BuiSidebarIcon,
  BuiSidebarLabel,
  BuiSidebarMenu,
  BuiSidebarMenuItem,
  BuiSidebarMenuRow,
  BuiSidebarSection,
  BuiSidebarSectionContent,
  BuiSidebarSectionHeader,
  BuiSidebarSpacer,
} from '@/app/ui/sidebar';

@Component({
  selector: 'app-sidebar',
  imports: [
    NgOptimizedImage,
    MatButtonModule,
    User,
    RouterLink,
    RouterLinkActive,
    MatIcon,
    BuiSidebar,
    BuiSidebarHeader,
    BuiSidebarBody,
    BuiSidebarMenuItem,
    BuiSidebarMenu,
    BuiSidebarSectionContent,
    BuiSidebarLabel,
    BuiSidebarSectionHeader,
    BuiSidebarSection,
    BuiSidebarIcon,
    BuiSidebarSpacer,
    BuiSidebarFooter,
    BuiSidebarButton,
    BuiSidebarMenuRow,
  ],
  host: {
    class: 'flex w-full flex-auto flex-col',
  },
  template: `
    <aside
      buiSidebar
      class="flex-auto"
    >
      <!-- Header -->
      <div
        buiSidebarHeader
        class="px-5 pb-4"
      >
        <!-- Logo -->
        <a
          class="inline-flex aspect-157/54 max-h-8"
          routerLink="/"
        >
          <img
            class="dark:hidden"
            ngSrc="/images/logo/logo-light.svg"
            width="157"
            height="54"
            alt="Spark logo"
          />

          <img
            class="hidden dark:block"
            ngSrc="/images/logo/logo-dark.svg"
            width="157"
            height="54"
            alt="Spark logo"
          />
        </a>
      </div>

      <!-- Body -->
      <div buiSidebarBody>
        <!-- Navigation -->
        <div buiSidebarSection>
          <div buiSidebarSectionHeader>
            <span buiSidebarLabel>Navigation</span>
          </div>
          <div buiSidebarSectionContent>
            <ul buiSidebarMenu>
              @for (item of navigation; track item.id) {
                <li buiSidebarMenuItem>
                  <div buiSidebarMenuRow>
                    <a
                      buiSidebarButton
                      [routerLink]="item.route"
                      routerLinkActive="active"
                    >
                      @if (item.icon) {
                        <mat-icon
                          buiSidebarIcon
                          [svgIcon]="item.icon"
                        />
                      }
                      <span buiSidebarLabel>{{ item.label }}</span>
                    </a>
                  </div>
                </li>
              }
            </ul>
          </div>
        </div>

        <!-- Spacer -->
        <div buiSidebarSpacer></div>

        <!-- Notifications -->
        <div
          buiSidebarSection
          class="mt-4"
        >
          <div buiSidebarSectionContent>
            <div class="flex flex-col gap-y-2">
              <!-- Learn more -->
              <div
                class="overflow-hidden rounded-xl border bg-white p-3.5 pt-4 dark:border-white-a4 dark:bg-neutral-a2"
              >
                <mat-icon
                  class="size-5 text-primary"
                  svgIcon="blocks"
                />
                <div class="mt-1.5 text-lg font-medium tracking-tight">
                  Built with BuilderKit
                </div>
                <div class="mt-0.5 text-neutral-a11">
                  Angular components, blocks, templates and agent skills.
                </div>
                <a
                  matButton
                  class="primary mt-3"
                  href="https://builderkit.dev?utm_source=spark&utm_medium=sidebar"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Explore BuilderKit
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div
        buiSidebarFooter
        class="p-2"
      >
        <user />
      </div>
    </aside>
  `,
})
export class AppSidebar {
  private readonly navigation = navigation;
}
