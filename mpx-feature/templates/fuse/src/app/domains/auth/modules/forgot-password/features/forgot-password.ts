import { NgOptimizedImage } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import {
  email,
  form,
  FormField,
  FormRoot,
  required,
} from '@angular/forms/signals';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardFooter } from '@angular/material/card';
import {
  MatError,
  MatFormField,
  MatInput,
  MatLabel,
} from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'auth-forgot-password',
  imports: [
    FormField,
    FormRoot,
    MatButton,
    MatCard,
    MatCardContent,
    MatCardFooter,
    MatError,
    MatFormField,
    MatInput,
    MatLabel,
    NgOptimizedImage,
    RouterLink,
  ],
  template: `
    <div class="flex flex-auto flex-col items-center justify-center sm:p-6">
      <mat-card
        appearance="filled"
        class="w-full max-w-sm [--card-border-radius:var(--radius-2xl)] [--card-surface-padding:--spacing(8)] sm:[--card-surface-padding:--spacing(10)]"
      >
        <mat-card-content class="flex flex-col items-center">
          <!-- Logo -->
          <div class="inline-flex items-center gap-x-3">
            <div
              class="flex size-9 items-center justify-center rounded-xl border bg-neutral-a3 p-1.5"
            >
              <img
                ngSrc="/images/logo/logomark.svg"
                width="32"
                height="32"
                alt="Fuse logo"
              />
            </div>
            <div class="flex flex-col gap-y-0.5">
              <div class="text-2xl leading-none font-bold tracking-tighter">
                FUSE
              </div>
              <div class="text-xs leading-none font-medium text-neutral-a10">
                by BuilderKit
              </div>
            </div>
          </div>
          <div class="mt-8 text-4xl font-semibold">Forgot your password?</div>
          <div class="mt-1 text-center text-lg text-pretty text-neutral-a11">
            Enter the email address on your account and we'll send you a link to
            set a new one.
          </div>

          <form
            class="mt-8 w-full"
            [formRoot]="forgotPasswordForm"
          >
            <mat-form-field class="w-full">
              <mat-label>Email address</mat-label>
              <input
                type="email"
                matInput
                [formField]="forgotPasswordForm.email"
              />
              <mat-error>
                @for (
                  error of forgotPasswordForm.email().errors();
                  track error
                ) {
                  {{ error.message }}
                }
              </mat-error>
            </mat-form-field>

            <button
              class="primary large mt-4 w-full"
              matButton
              type="submit"
            >
              Send reset link
            </button>
          </form>
        </mat-card-content>
        <mat-card-footer
          class="flex items-center justify-center gap-x-1 px-2 py-2 text-neutral-a11"
        >
          Remembered your password?
          <a
            matButton
            class="link text-primary-a11 decoration-primary-a11"
            routerLink="/sign-in"
            >Back to sign in</a
          >
        </mat-card-footer>
      </mat-card>
    </div>
  `,
})
export default class AuthForgotPassword {
  // Dependencies
  private router = inject(Router);

  // State
  private forgotPasswordFormModel = signal({
    email: '',
  });

  // Forms
  private forgotPasswordForm = form(
    this.forgotPasswordFormModel,
    (schema) => {
      required(schema.email, { message: 'Email is required!' });
      email(schema.email, { message: 'Must be valid email address!' });
    },
    {
      submission: {
        action: async () => {
          // Send instructions to the user via email
          // ...

          // Go back to sign in page
          await this.router.navigate(['/sign-in']);
        },
      },
    }
  );
}
