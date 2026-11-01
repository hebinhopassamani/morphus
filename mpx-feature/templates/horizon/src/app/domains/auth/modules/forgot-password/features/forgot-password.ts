import { NgOptimizedImage } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import {
  email,
  form,
  FormField,
  FormRoot,
  required,
} from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'auth-forgot-password',
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

        <div class="mt-8 text-4xl font-semibold">Forgot password</div>
        <div class="mt-1 text-lg text-pretty text-neutral-a11">
          Enter your email address and we will send you a link to reset your
          password.
        </div>

        <form
          [formRoot]="forgotPasswordForm"
          class="mt-8 flex flex-col"
        >
          <div class="flex flex-col gap-y-4">
            <mat-form-field class="w-full">
              <mat-label>Email address</mat-label>
              <input
                matInput
                type="email"
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
          </div>

          <button
            matButton
            type="submit"
            class="primary large mt-8 w-full"
          >
            Send instructions
          </button>
        </form>

        <div class="mt-4 flex items-center gap-x-1">
          <div class="text-neutral-a11">Remembered your password?</div>
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
