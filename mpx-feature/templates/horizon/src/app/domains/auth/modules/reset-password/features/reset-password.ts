import { NgOptimizedImage } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import {
  form,
  FormField,
  FormRoot,
  readonly,
  required,
  validate,
} from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'auth-reset-password',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    NgOptimizedImage,
    FormField,
    RouterLink,
    FormRoot,
  ],
  template: `
    <div class="flex flex-auto flex-col items-center justify-center p-6">
      <div class="flex w-full max-w-90 flex-col">
        <!-- Logo -->
        <div>
          <img
            class="dark:hidden"
            ngSrc="/images/logo/logomark-light.svg"
            width="40"
            height="40"
            alt="Horizon logo"
          />
          <img
            class="hidden dark:block"
            ngSrc="/images/logo/logomark-dark.svg"
            width="40"
            height="40"
            alt="Horizon logo"
          />
        </div>

        <div class="mt-8 text-4xl font-semibold">Reset password</div>
        <div class="mt-1 text-lg text-pretty text-neutral-a11">
          Enter your new password below. Make sure to choose a strong password
          that you haven't used before.
        </div>

        <form
          [formRoot]="resetPasswordForm"
          class="mt-8 flex flex-col"
        >
          <div class="flex flex-col gap-y-4">
            <mat-form-field class="w-full">
              <mat-label>Email address</mat-label>
              <input
                matInput
                type="email"
                [formField]="resetPasswordForm.email"
              />
            </mat-form-field>

            <mat-form-field class="w-full">
              <mat-label>Password</mat-label>
              <input
                matInput
                type="password"
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
              <mat-label>Confirm Password</mat-label>
              <input
                matInput
                type="password"
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

          <button
            matButton
            type="submit"
            class="primary large mt-8 w-full"
          >
            Reset password
          </button>
        </form>

        <div class="mt-4 flex items-center gap-x-1">
          <div class="text-neutral-a11">Changed your mind?</div>
          <a
            class="font-medium text-primary underline-offset-2 hover:underline"
            routerLink="/sign-in"
            >Back to sign in</a
          >
        </div>

        <!-- Footer -->
        <div
          class="mt-8 flex items-center justify-between text-xs text-neutral-a11"
        >
          <div>&copy; 2026 Horizon</div>
          <div class="flex gap-x-4">
            <a
              routerLink="."
              class="hover:underline"
              >Privacy</a
            >
            <a
              routerLink="."
              class="hover:underline"
              >Terms</a
            >
          </div>
        </div>
      </div>
    </div>
  `,
})
export default class AuthResetPassword {
  // Dependencies
  private router = inject(Router);

  // State
  private resetPasswordFormModel = signal({
    email: 'johnbuilder@example.com',
    password: '',
    confirmPassword: '',
  });

  // Forms
  private resetPasswordForm = form(
    this.resetPasswordFormModel,
    (schema) => {
      readonly(schema.email);
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
