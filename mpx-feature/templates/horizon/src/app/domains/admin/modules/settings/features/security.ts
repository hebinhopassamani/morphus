import { Component, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { add, formatDistanceToNowStrict } from 'date-fns';
import { SettingsEyebrow } from '@/app/domains/admin/modules/settings/ui/eyebrow';

type Session = {
  id: string;
  device: string;
  browser: string;
  icon: string;
  location: string;
  lastActive: string;
  current: boolean;
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

@Component({
  selector: 'security-settings',
  imports: [
    MatButton,
    MatCard,
    MatCardContent,
    MatDivider,
    MatIcon,
    MatSlideToggle,
    SettingsEyebrow,
  ],
  template: `
    <div class="flex flex-col gap-y-10">
      <!-- Header -->
      <div class="flex flex-col gap-y-3">
        <settings-eyebrow />
        <div class="flex flex-col gap-y-0.5">
          <div class="text-2xl font-semibold tracking-tighter">Security</div>
          <div class="text-neutral-a11">
            How you sign in and where you are signed in.
          </div>
        </div>
      </div>

      <!-- Sign-in -->
      <section class="flex flex-col gap-y-3">
        <div class="flex flex-col gap-y-0.5">
          <div class="text-lg font-medium">Sign-in</div>
          <div class="text-neutral-a11">How you get into your account.</div>
        </div>

        <mat-card>
          <mat-card-content class="flex flex-col gap-y-4">
            <!-- Password -->
            <div class="flex items-center gap-4">
              <div class="flex flex-auto flex-col">
                <h3 class="font-medium">Password</h3>
                <p class="text-sm text-neutral-a11">
                  Last changed 3 months ago
                </p>
              </div>

              <button
                matButton
                type="button"
                class="small shrink-0"
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
          </mat-card-content>
        </mat-card>
      </section>

      <!-- Two-factor authentication -->
      <section class="flex flex-col gap-y-3">
        <div class="flex flex-col gap-y-0.5">
          <div class="text-lg font-medium">Two-factor authentication</div>
          <div class="text-neutral-a11">
            A second step every time you sign in.
          </div>
        </div>

        <mat-card>
          <mat-card-content class="flex flex-col gap-y-4">
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
                    Require a second step
                  </div>
                  @if (twoFactor()) {
                    <div
                      class="inline-flex items-center rounded-full border border-green-a6 bg-green-a3 px-2 py-px text-xs font-medium whitespace-nowrap text-green-a11"
                    >
                      Enabled
                    </div>
                  }
                </div>
                <div
                  id="two-factor-description"
                  class="text-sm text-neutral-a11"
                >
                  Ask for a code after your password on every new device
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
          </mat-card-content>
        </mat-card>
      </section>

      <!-- Sessions -->
      <section class="flex flex-col gap-y-3">
        <div class="flex items-end gap-4">
          <div class="flex flex-auto flex-col gap-y-0.5">
            <div class="text-lg font-medium">Sessions</div>
            <div class="text-neutral-a11">
              Devices signed in to your account right now.
            </div>
          </div>

          <button
            matButton
            type="button"
            class="small shrink-0"
          >
            <mat-icon svgIcon="log-out" />
            Sign out others
          </button>
        </div>

        <mat-card>
          <mat-card-content class="flex flex-col gap-y-4">
            @for (session of sessions; track session.id; let last = $last) {
              <div class="flex items-center gap-4">
                <mat-icon
                  class="shrink-0 text-neutral-a11"
                  [svgIcon]="session.icon"
                />
                <div class="flex min-w-0 flex-auto flex-col">
                  <h3 class="truncate font-medium">
                    {{ session.device }} · {{ session.browser }}
                  </h3>
                  <p class="truncate text-sm text-neutral-a11">
                    {{ session.location }} ·
                    @if (session.current) {
                      Active now
                    } @else {
                      {{ relativeDate(session.lastActive) }}
                    }
                  </p>
                </div>

                @if (session.current) {
                  <div
                    class="inline-flex shrink-0 items-center rounded-full border border-primary-a6 bg-primary-a3 px-2 py-px text-xs font-medium whitespace-nowrap text-primary-a11"
                  >
                    Current
                  </div>
                } @else {
                  <button
                    matButton
                    type="button"
                    class="small shrink-0"
                  >
                    Sign out
                  </button>
                }
              </div>

              @if (!last) {
                <mat-divider />
              }
            }
          </mat-card-content>
        </mat-card>
      </section>

      <!-- Lockdown -->
      <section class="flex flex-col gap-y-3">
        <div class="flex flex-col gap-y-0.5">
          <div class="text-lg font-medium">Lockdown</div>
          <div class="text-neutral-a11">
            For when something about your account looks wrong.
          </div>
        </div>

        <mat-card>
          <mat-card-content class="flex flex-col gap-y-4">
            <!-- Secure reset -->
            <div class="flex items-center gap-4">
              <div class="flex flex-auto flex-col">
                <h3 class="font-medium">Secure reset</h3>
                <p class="text-sm text-neutral-a11">
                  Signs you out everywhere, including here, and asks for a new
                  password on your next sign-in
                </p>
              </div>

              <button
                matButton
                type="button"
                class="primary destructive small shrink-0"
              >
                <mat-icon svgIcon="rotate-ccw" />
                Reset
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </section>
    </div>
  `,
})
export default class SecuritySettings {
  // State
  private sessions = SESSIONS;
  private twoFactor = signal(true);

  private relativeDate(date: string) {
    return formatDistanceToNowStrict(date, { addSuffix: true });
  }
}
