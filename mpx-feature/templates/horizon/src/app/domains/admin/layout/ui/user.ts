import { NgOptimizedImage } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatPseudoCheckbox } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink } from '@angular/router';
import { Scheme, Theming } from '@/app/core/theming';
import { ME } from '@/app/domains/admin/modules/agents/data/agents';

@Component({
  selector: 'user',
  imports: [
    MatButtonModule,
    MatIconModule,
    NgOptimizedImage,
    MatMenuModule,
    MatDividerModule,
    MatPseudoCheckbox,
    RouterLink,
  ],
  template: `
    <button
      matButton
      [matMenuTriggerFor]="userMenu"
      class="tiny tertiary [--button-padding-x:0.25rem] [--button-padding-y:0.25rem]"
    >
      <img
        class="size-6 shrink-0 overflow-hidden rounded-md object-cover"
        [ngSrc]="user.photo"
        width="24"
        height="24"
        alt="User Avatar"
      />
    </button>

    <!-- User Menu -->
    <mat-menu
      class="min-w-52"
      xPosition="after"
      yPosition="above"
      #userMenu
    >
      <button mat-menu-item>
        <img
          class="size-9 rounded-lg object-cover"
          [src]="user.photo"
          alt="User avatar"
        />
        <div class="ms-3 flex min-w-0 flex-auto flex-col select-none">
          <div class="truncate text-lg font-medium">{{ user.name }}</div>
          <div class="truncate text-sm text-neutral-a11">
            {{ user.email }}
          </div>
        </div>
      </button>

      <mat-divider />

      <a
        mat-menu-item
        routerLink="/settings/account"
      >
        <mat-icon svgIcon="circle-user" />
        <span>Account</span>
      </a>

      <a
        mat-menu-item
        routerLink="/settings/notifications"
      >
        <mat-icon svgIcon="bell" />
        <span>Notifications</span>
      </a>

      <mat-divider />

      <button
        mat-menu-item
        [matMenuTriggerFor]="schemeMenu"
      >
        <mat-icon svgIcon="sun-moon" />
        <span>Color scheme</span>
      </button>
      <mat-menu #schemeMenu>
        @for (item of schemes; track item.value) {
          <button
            mat-menu-item
            (click)="updateScheme(item.value)"
          >
            <mat-pseudo-checkbox
              appearance="minimal"
              [state]="
                theming.scheme() === item.value ? 'checked' : 'unchecked'
              "
            />
            <span class="ms-1">{{ item.label }}</span>
          </button>
        }
      </mat-menu>

      <a
        mat-menu-item
        routerLink="/settings/account"
      >
        <mat-icon svgIcon="paint-bucket" />
        <span>Appearance</span>
      </a>

      <mat-divider />

      <button
        mat-menu-item
        routerLink="/sign-in"
      >
        <mat-icon svgIcon="log-out" />
        <span>Sign out</span>
      </button>
    </mat-menu>
  `,
})
export class User {
  // Dependencies
  private theming = inject(Theming);

  // State
  private user = ME;
  private schemes: { label: string; value: Scheme }[] = [
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
    { label: 'System', value: 'system' },
  ];

  private updateScheme(scheme: Scheme) {
    this.theming.scheme.set(scheme);
  }
}
