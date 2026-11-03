import { Component, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { SettingsChangePassword } from '@morphus/pages/settings/ui/change-password';

type Session = {
  id: string;
  device: string;
  browser: string;
  icon: string;
  location: string;
  lastActive: string;
  current: boolean;
};

type SignIn = {
  id: string;
  device: string;
  browser: string;
  icon: string;
  location: string;
  date: string;
};

type ConnectedAccount = {
  id: string;
  name: string;
  email: string | null;
};

const SESSIONS: Session[] = [
  {
    id: 'windows',
    device: 'Windows PC',
    browser: 'Chrome',
    icon: 'monitor',
    location: 'Brasil',
    lastActive: 'Active now',
    current: true,
  },
  {
    id: 'iphone',
    device: 'iPhone',
    browser: 'Safari',
    icon: 'smartphone',
    location: 'Brasil',
    lastActive: '3 hours ago',
    current: false,
  },
];

const SIGN_INS: SignIn[] = [
  {
    id: 'windows-chrome',
    device: 'Windows PC',
    browser: 'Chrome',
    icon: 'monitor',
    location: 'Brasil',
    date: '2 hours ago',
  },
  {
    id: 'iphone-safari',
    device: 'iPhone',
    browser: 'Safari',
    icon: 'smartphone',
    location: 'Brasil',
    date: '1 day ago',
  },
];

const CONNECTED_ACCOUNTS: ConnectedAccount[] = [
  { id: 'google', name: 'Google', email: 'hebinhopassamani@gmail.com' },
  { id: 'github', name: 'GitHub', email: null },
  { id: 'microsoft', name: 'Microsoft', email: null },
];

@Component({
  selector: 'settings-security',
  imports: [
    MatButton,
    MatDivider,
    MatIcon,
    MatSlideToggle,
    SettingsChangePassword,
  ],
  host: {
    class: 'flex flex-auto flex-col',
  },
  template: `
    <div class="flex flex-auto flex-col gap-y-10">
      <!-- Sign-in -->
      <section class="grid gap-x-10 gap-y-8 sm:grid-cols-3">
        <div class="flex flex-col gap-y-0.5">
          <div class="text-lg font-semibold">Sign-in</div>
          <div class="text-neutral-a11">How you get into your account</div>
        </div>

        <div class="flex flex-col gap-y-4 sm:col-span-2">
          <!-- Password -->
          <div class="flex items-center gap-4">
            <div class="flex flex-auto flex-col">
              <h3 class="font-medium">Password</h3>
              <p class="text-sm text-neutral-a11">Last changed 3 months ago</p>
            </div>

            <button
              matButton
              type="button"
              class="small shrink-0"
              (click)="changePasswordOpen.set(true)"
            >
              <mat-icon svgIcon="key-round" />
              Change
            </button>
          </div>

          <mat-divider />

          <!-- Passkeys -->
          <div class="flex items-center gap-4">
            <div class="flex flex-auto flex-col">
              <h3 class="font-medium">Passkeys</h3>
              <p class="text-sm text-neutral-a11">
                Sign in with your fingerprint, face or device screen lock
              </p>
            </div>

            <button
              matButton
              type="button"
              class="small shrink-0"
            >
              <mat-icon svgIcon="fingerprint-pattern" />
              Add
            </button>
          </div>

          <mat-divider />

          <!-- Two-factor authentication -->
          <mat-slide-toggle
            class="[--slide-toggle-gap-x:1rem]"
            fullWidth
            labelPosition="before"
            aria-labelledby="two-factor-title"
            aria-describedby="two-factor-description"
            [checked]="twoFactor()"
            (change)="twoFactor.set($event.checked)"
          >
            <div class="flex flex-col">
              <div class="flex items-center gap-x-2">
                <div
                  id="two-factor-title"
                  class="font-medium"
                >
                  Two-factor authentication
                </div>
                @if (twoFactor()) {
                  <div
                    class="rounded-lg bg-jade-a3 px-2 py-0.5 text-sm font-medium whitespace-nowrap text-jade-a11"
                  >
                    Enabled
                  </div>
                }
              </div>
              <div
                id="two-factor-description"
                class="text-sm text-neutral-a11"
              >
                Ask for a second step every time you sign in
              </div>
            </div>
          </mat-slide-toggle>
        </div>
      </section>

      <!-- Divider -->
      <mat-divider />

      <!-- Connected accounts -->
      <section class="grid gap-x-10 gap-y-8 sm:grid-cols-3">
        <div class="flex flex-col gap-y-0.5">
          <div class="text-lg font-semibold">Connected accounts</div>
          <div class="text-neutral-a11">Services you can sign in with</div>
        </div>

        <div class="flex flex-col gap-y-4 sm:col-span-2">
          @for (account of accounts; track account.id; let last = $last) {
            <div class="flex items-center gap-4">
              <div class="flex flex-auto flex-col">
                <h3 class="font-medium">{{ account.name }}</h3>
                <p class="text-sm text-neutral-a11">
                  @if (account.email) {
                    Connected as {{ account.email }}
                  } @else {
                    Not connected
                  }
                </p>
              </div>

              @if (account.email) {
                <button
                  matButton
                  type="button"
                  class="small shrink-0"
                >
                  <mat-icon svgIcon="unlink" />
                  Disconnect
                </button>
              } @else {
                <button
                  matButton
                  type="button"
                  class="small shrink-0"
                >
                  <mat-icon svgIcon="link" />
                  Connect
                </button>
              }
            </div>

            @if (!last) {
              <mat-divider />
            }
          }
        </div>
      </section>

      <!-- Divider -->
      <mat-divider />

      <!-- Sessions -->
      <section class="grid gap-x-10 gap-y-8 sm:grid-cols-3">
        <div class="flex flex-col gap-y-0.5">
          <div class="text-lg font-semibold">Sessions</div>
          <div class="text-neutral-a11">
            Devices signed in to your account right now
          </div>
        </div>

        <div class="flex flex-col gap-y-4 sm:col-span-2">
          @for (session of sessions; track session.id; let last = $last) {
            <div class="flex items-center gap-x-4">
              <div class="flex min-w-0 flex-auto items-center gap-x-4">
                <mat-icon
                  class="shrink-0 text-neutral-a11"
                  [svgIcon]="session.icon"
                />
                <div class="flex min-w-0 flex-col">
                  <div class="truncate font-medium">
                    {{ session.device }} · {{ session.browser }}
                  </div>
                  <div class="truncate text-sm text-neutral-a11">
                    {{ session.location }} · {{ session.lastActive }}
                  </div>
                </div>
              </div>

              @if (session.current) {
                <div
                  class="rounded-lg bg-primary-a3 px-2 py-0.5 text-sm font-medium text-primary-a11"
                >
                  Current
                </div>
              } @else {
                <button
                  matButton
                  type="button"
                  class="small"
                >
                  Sign out
                </button>
              }
            </div>

            @if (!last) {
              <mat-divider />
            }
          }
        </div>
      </section>

      <!-- Divider -->
      <mat-divider />

      <!-- Recent activity -->
      <section class="grid gap-x-10 gap-y-8 sm:grid-cols-3">
        <div class="flex flex-col gap-y-0.5">
          <div class="text-lg font-semibold">Recent activity</div>
          <div class="text-neutral-a11">
            The latest sign-ins to your account
          </div>
        </div>

        <div class="flex flex-col gap-y-4 sm:col-span-2">
          @for (signIn of signIns; track signIn.id; let last = $last) {
            <div class="flex min-w-0 items-center gap-x-4">
              <mat-icon
                class="shrink-0 text-neutral-a11"
                [svgIcon]="signIn.icon"
              />
              <div class="flex min-w-0 flex-col">
                <div class="truncate font-medium">
                  {{ signIn.device }} · {{ signIn.browser }}
                </div>
                <div class="truncate text-sm text-neutral-a11">
                  {{ signIn.location }} · {{ signIn.date }}
                </div>
              </div>
            </div>

            @if (!last) {
              <mat-divider />
            }
          }
        </div>
      </section>
    </div>

    <!-- Change password -->
    <settings-change-password [(open)]="changePasswordOpen" />
  `,
})
export default class SettingsSecurity {
  protected readonly sessions = SESSIONS;
  protected readonly signIns = SIGN_INS;
  protected readonly accounts = CONNECTED_ACCOUNTS;
  protected readonly twoFactor = signal(true);
  protected readonly changePasswordOpen = signal(false);
}

