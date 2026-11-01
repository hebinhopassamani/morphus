import { NgOptimizedImage } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatPseudoCheckbox } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink } from '@angular/router';
import { Scheme, Theming } from '@/app/core/theming';

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
      class="tertiary small w-full"
    >
      <span class="my-1.5 me-2 flex min-w-0 flex-auto items-center gap-x-3">
        <img
          class="size-9 shrink-0 overflow-hidden rounded-md object-cover"
          ngSrc="/images/photos/john-builder.jpg"
          width="36"
          height="36"
          alt="User Avatar"
        />
        <span class="min-w-0 text-start">
          <span class="block truncate font-semibold">John Builder</span>
          <span class="block truncate text-sm">
            johnbuilder&#64;example.com
          </span>
        </span>
      </span>

      <mat-icon
        class="ms-auto"
        svgIcon="ellipsis-vertical"
        iconPositionEnd
      />
    </button>

    <!-- User Menu -->
    <mat-menu
      class="w-48"
      xPosition="before"
      #userMenu
    >
      <button mat-menu-item>
        <mat-icon svgIcon="circle-user" />
        <span>Account</span>
      </button>

      <button mat-menu-item>
        <mat-icon svgIcon="bell" />
        <span>Notifications</span>
      </button>

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
  private schemes: { label: string; value: Scheme }[] = [
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
    { label: 'System', value: 'system' },
  ];

  private updateScheme(scheme: Scheme) {
    this.theming.scheme.set(scheme);
  }
}
