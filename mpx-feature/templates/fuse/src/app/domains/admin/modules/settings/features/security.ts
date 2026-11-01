import { Component, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { add, differenceInSeconds, formatDistanceToNowStrict } from 'date-fns';
import { SettingsChangePassword } from '@/app/domains/admin/modules/settings/ui/change-password';

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

const now = new Date();

const SESSIONS: Session[] = [
  {
    id: 'macbook',
    device: 'MacBook Pro',
    browser: 'Chrome',
    icon: 'laptop',
    location: 'Austin, United States',
    lastActive: now.toISOString(),
    current: true,
  },
  {
    id: 'iphone',
    device: 'iPhone 16',
    browser: 'Safari',
    icon: 'smartphone',
    location: 'Austin, United States',
    lastActive: add(now, { hours: -3 }).toISOString(),
    current: false,
  },
  {
    id: 'windows',
    device: 'Windows PC',
    browser: 'Edge',
    icon: 'monitor',
    location: 'Denver, United States',
    lastActive: add(now, { days: -6 }).toISOString(),
    current: false,
  },
];

const SIGN_INS: SignIn[] = [
  {
    id: 'macbook-chrome',
    device: 'MacBook Pro',
    browser: 'Chrome',
    icon: 'laptop',
    location: 'Austin, United States',
    date: add(now, { hours: -2 }).toISOString(),
  },
  {
    id: 'iphone-safari',
    device: 'iPhone 16',
    browser: 'Safari',
    icon: 'smartphone',
    location: 'Austin, United States',
    date: add(now, { days: -1 }).toISOString(),
  },
  {
    id: 'windows-edge',
    device: 'Windows PC',
    browser: 'Edge',
    icon: 'monitor',
    location: 'Denver, United States',
    date: add(now, { days: -6 }).toISOString(),
  },
  {
    id: 'ipad-safari',
    device: 'iPad Air',
    browser: 'Safari',
    icon: 'tablet',
    location: 'San Antonio, United States',
    date: add(now, { days: -9 }).toISOString(),
  },
  {
    id: 'macbook-firefox',
    device: 'MacBook Pro',
    browser: 'Firefox',
    icon: 'laptop',
    location: 'Chicago, United States',
    date: add(now, { days: -14 }).toISOString(),
  },
];

const CONNECTED_ACCOUNTS: ConnectedAccount[] = [
  { id: 'google', name: 'Google', email: 'john@example.com' },
  { id: 'github', name: 'GitHub', email: 'john@example.com' },
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

          <!-- Recovery email -->
          <div class="flex items-center gap-4">
            <div class="flex flex-auto flex-col">
              <h3 class="font-medium">Recovery email</h3>
              <p class="text-sm text-neutral-a11">
                Account recovery links go to john.recovery&#64;example.com
              </p>
            </div>

            <button
              matButton
              type="button"
              class="small shrink-0"
            >
              <mat-icon svgIcon="mail-pen" />
              Update
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

          @if (twoFactor()) {
            <mat-divider />

            <!-- Authenticator app -->
            <div class="flex items-center gap-4">
              <div class="flex flex-auto flex-col">
                <h3 class="font-medium">Authenticator app</h3>
                <p class="text-sm text-neutral-a11">
                  One-time codes from 1Password, Authy or Google Authenticator
                </p>
              </div>

              <button
                matButton
                type="button"
                class="small shrink-0"
              >
                <mat-icon svgIcon="qr-code" />
                Set up
              </button>
            </div>

            <mat-divider />

            <!-- Backup codes -->
            <div class="flex items-center gap-4">
              <div class="flex flex-auto flex-col">
                <h3 class="font-medium">Backup codes</h3>
                <p class="text-sm text-neutral-a11">
                  Single-use codes for when your phone is out of reach
                </p>
              </div>

              <button
                matButton
                type="button"
                class="small shrink-0"
              >
                <mat-icon svgIcon="list-restart" />
                Regenerate
              </button>
            </div>
          }
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
          <button
            matButton
            type="button"
            class="small mt-3 self-start"
          >
            <mat-icon svgIcon="log-out" />
            Sign out others
          </button>
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
                    {{ session.location }} ·
                    @if (session.current) {
                      Active now
                    } @else {
                      {{ relativeDate(session.lastActive) }}
                    }
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
          <button
            matButton
            type="button"
            class="small mt-3 self-start"
          >
            <mat-icon svgIcon="list-clock" />
            View all activity
          </button>
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
                  {{ signIn.location }} · {{ relativeDate(signIn.date) }}
                </div>
              </div>
            </div>

            @if (!last) {
              <mat-divider />
            }
          }
        </div>
      </section>

      <!-- Divider -->
      <mat-divider />

      <!-- Account -->
      <section class="grid gap-x-10 gap-y-8 sm:grid-cols-3">
        <div class="flex flex-col gap-y-0.5">
          <div class="text-lg font-semibold">Account</div>
          <div class="text-neutral-a11">Export or delete your account</div>
        </div>

        <div class="flex flex-col gap-y-4 sm:col-span-2">
          <!-- Export account data -->
          <div class="flex items-center gap-4">
            <div class="flex flex-auto flex-col">
              <h3 class="font-medium">Export account data</h3>
              <p class="text-sm text-neutral-a11">
                Your profile, comments and activity as a JSON archive
              </p>
            </div>

            <button
              matButton
              type="button"
              class="small shrink-0"
            >
              <mat-icon svgIcon="download" />
              Export
            </button>
          </div>

          <mat-divider />

          <!-- Delete account -->
          <div class="flex items-center gap-4">
            <div class="flex flex-auto flex-col">
              <h3 class="font-medium">Delete account</h3>
              <p class="text-sm text-neutral-a11">
                Removes your account and signs you out everywhere. This cannot
                be undone
              </p>
            </div>

            <button
              matButton
              type="button"
              class="primary destructive small shrink-0"
            >
              <mat-icon svgIcon="trash" />
              Delete
            </button>
          </div>
        </div>
      </section>
    </div>

    <!-- Change password -->
    <settings-change-password [(open)]="changePasswordOpen" />
  `,
})
export default class SettingsSecurity {
  // State
  private sessions = SESSIONS;
  private signIns = SIGN_INS;
  private accounts = CONNECTED_ACCOUNTS;
  private twoFactor = signal(true);
  private changePasswordOpen = signal(false);

  private relativeDate(date: string) {
    if (differenceInSeconds(Date.now(), date) < 60) {
      return 'Just now';
    }

    return formatDistanceToNowStrict(date, { addSuffix: true });
  }
}
