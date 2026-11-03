import { Component, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatOption, MatSelect } from '@angular/material/select';
import { MatTabLink, MatTabNav, MatTabNavPanel } from '@angular/material/tabs';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';

@Component({
  selector: 'settings-layout',
  imports: [
    MatFormField,
    MatIcon,
    MatOption,
    MatSelect,
    MatTabLink,
    MatTabNav,
    MatTabNavPanel,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
  ],
  template: `
    <div
      class="mx-auto flex w-full max-w-4xl flex-auto flex-col gap-4 p-6 sm:gap-6 lg:p-8"
    >
      <!-- Header -->
      <div class="flex flex-col gap-y-0.5">
        <div class="text-3xl font-semibold tracking-tighter">Settings</div>
        <div class="text-neutral-a11 sm:text-lg">
          Your account, your workspace and how the app looks and behaves.
        </div>
      </div>

      <!-- Tabs -->
      <nav
        mat-tab-nav-bar
        class="mb-6 hidden sm:flex"
        [tabPanel]="tabPanel"
        [mat-stretch-tabs]="false"
        ngSkipHydration
      >
        @for (link of links; track link.route) {
          <a
            mat-tab-link
            routerLinkActive
            [active]="rla.isActive"
            [routerLink]="link.route"
            #rla="routerLinkActive"
          >
            <mat-icon
              class="size-4 text-current"
              [svgIcon]="link.icon"
            />
            <span class="ms-2">{{ link.label }}</span>
          </a>
        }
      </nav>

      <!-- Mobile navigation -->
      <mat-form-field class="w-full sm:hidden">
        <mat-select
          [value]="router.url"
          (selectionChange)="router.navigateByUrl($event.value)"
        >
          @for (link of links; track link.route) {
            <mat-option [value]="link.route">{{ link.label }}</mat-option>
          }
        </mat-select>
      </mat-form-field>

      <!-- Tab panel -->
      <mat-tab-nav-panel
        class="flex flex-auto flex-col"
        #tabPanel
      >
        <router-outlet />
      </mat-tab-nav-panel>
    </div>
  `,
})
export default class SettingsLayout {
  protected readonly router = inject(Router);

  protected readonly links = [
    {
      route: '/admin/settings/profile',
      label: 'Profile',
      icon: 'user-round',
    },
    {
      route: '/admin/settings/preferences',
      label: 'Preferences',
      icon: 'sliders-horizontal',
    },
    {
      route: '/admin/settings/security',
      label: 'Security',
      icon: 'fingerprint-pattern',
    },
    {
      route: '/admin/settings/notifications',
      label: 'Notifications',
      icon: 'bell',
    },
    {
      route: '/admin/settings/billing',
      label: 'Billing',
      icon: 'receipt-text',
    },
    {
      route: '/admin/settings/workspace',
      label: 'Workspace',
      icon: 'building',
    },
  ];
}

