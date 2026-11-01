import { NgOptimizedImage } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import {
  form,
  FormField,
  FormRoot,
  required,
  validate,
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
  selector: 'auth-reset-password',
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
          <div class="mt-8 text-4xl font-semibold">Set a new password</div>
          <div class="mt-1 text-center text-lg text-pretty text-neutral-a11">
            Choose a password you haven't used before. You'll be signed in once
            it's saved.
          </div>

          <form
            class="mt-8 flex w-full flex-col"
            [formRoot]="resetPasswordForm"
          >
            <div class="flex flex-col gap-y-4">
              <mat-form-field class="w-full">
                <mat-label>New password</mat-label>
                <input
                  type="password"
                  matInput
                  [formField]="resetPasswordForm.password"
                />
                <mat-error>
                  @for (
                    error of resetPasswordForm.password().errors();
                    track error
                  ) {
                    {{ error.message }}
                  }
                </mat-error>
              </mat-form-field>

              <mat-form-field class="w-full">
                <mat-label>Confirm new password</mat-label>
                <input
                  type="password"
                  matInput
                  [formField]="resetPasswordForm.confirmPassword"
                />
                <mat-error>
                  @for (
                    error of resetPasswordForm.confirmPassword().errors();
                    track error
                  ) {
                    {{ error.message }}
                  }
                </mat-error>
              </mat-form-field>
            </div>

            <!-- Requirements -->
            <ul
              class="mt-4 flex list-disc flex-col gap-y-1 ps-5 text-sm text-neutral-a11"
            >
              <li>At least 8 characters</li>
              <li>One uppercase letter</li>
              <li>One number</li>
              <li>One symbol</li>
            </ul>

            <button
              class="primary large mt-8 w-full"
              matButton
              type="submit"
            >
              Reset password
            </button>
          </form>
        </mat-card-content>
        <mat-card-footer
          class="flex items-center justify-center gap-x-1 px-2 py-2 text-neutral-a11"
        >
          Changed your mind?
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
export default class AuthResetPassword {
  // Dependencies
  private router = inject(Router);

  // State
  private resetPasswordFormModel = signal({
    password: '',
    confirmPassword: '',
  });

  // Forms
  private resetPasswordForm = form(
    this.resetPasswordFormModel,
    (schema) => {
      required(schema.password, { message: 'Password is required!' });
      validate(schema.confirmPassword, ({ value, valueOf }) => {
        const password = valueOf(schema.password);
        const passwordConfirmation = value();

        if (!passwordConfirmation) {
          return {
            kind: 'required',
            message: 'Confirm password is required!',
          };
        }

        if (password !== passwordConfirmation) {
          return {
            kind: 'passwordMismatch',
            message: 'Passwords do not match!',
          };
        }

        return null;
      });
    },
    {
      submission: {
        action: async () => {
          // Reset the password
          // ...

          // Redirect the user
          await this.router.navigate(['/']);
        },
      },
    }
  );
}
