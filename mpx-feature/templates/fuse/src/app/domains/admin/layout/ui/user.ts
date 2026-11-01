import { NgOptimizedImage } from '@angular/common';
import { booleanAttribute, Component, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatPseudoCheckbox } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink } from '@angular/router';
import { Scheme, Theming } from '@/app/core/theming';
import { AuthService } from '@/app/domains/auth/data/auth';

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
    @if (compact()) {
      <button
        matButton
        [matMenuTriggerFor]="userMenu"
        class="tiny tertiary [--button-padding-x:0.25rem] [--button-padding-y:0.25rem]"
      >
        <img
          class="size-6 shrink-0 overflow-hidden rounded-md object-cover"
          ngSrc="/images/photos/john-builder.jpg"
          width="24"
          height="24"
          alt="User Avatar"
        />
      </button>
    } @else {
      <button
        matButton
        [matMenuTriggerFor]="userMenu"
        class="tertiary small w-full [--button-padding-x:0.375rem] [--button-padding-y:0.375rem]"
      >
        <span class="me-2 flex min-w-0 flex-auto items-center gap-x-3">
          <img
            class="size-9 shrink-0 overflow-hidden rounded-md object-cover grayscale"
            ngSrc="/images/photos/john-builder.jpg"
            width="36"
            height="36"
            alt="User Avatar"
          />
          <span class="min-w-0 text-start">
            <span class="block truncate font-semibold">John Builder</span>
            <span class="block truncate text-sm"> john&#64;example.com </span>
          </span>
        </span>

        <mat-icon
          class="ms-auto me-1"
          svgIcon="ellipsis-vertical"
          iconPositionEnd
        />
      </button>
    }

    <!-- User Menu -->
    <mat-menu
      class="min-w-52"
      xPosition="before"
      #userMenu
    >
      <button mat-menu-item>
        <img
          class="size-9 rounded-lg object-cover"
          src="/images/photos/john-builder.jpg"
          alt="User avatar"
        />
        <div class="ms-3 flex min-w-0 flex-auto flex-col select-none">
          <div class="truncate text-lg font-medium">John Builder</div>
          <div class="truncate text-sm text-neutral-a11">
            john&#64;example.com
          </div>
        </div>
      </button>

      <mat-divider />

      <button mat-menu-item>
        <mat-icon svgIcon="sparkles" />
        Upgrade to Pro
      </button>

      <mat-divider />

      <a
        mat-menu-item
        routerLink="/settings/profile"
      >
        <mat-icon svgIcon="circle-user" />
        <span>Account</span>
      </a>

      <a
        mat-menu-item
        routerLink="/notifications"
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
        routerLink="/settings/preferences"
      >
        <mat-icon svgIcon="sliders-horizontal" />
        <span>Preferences</span>
      </a>

      <mat-divider />

      <button
        mat-menu-item
        routerLink="/sign-in"
        (click)="auth.signOut()"
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
  private auth = inject(AuthService);

  // Inputs / Outputs
  readonly compact = input(false, { transform: booleanAttribute });

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
