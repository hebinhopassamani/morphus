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
import { MatCheckbox } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'auth-sign-in',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    NgOptimizedImage,
    FormField,
    RouterLink,
    MatCheckbox,
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

        <div class="mt-8 text-4xl font-semibold">Sign in to your account</div>
        <div class="mt-1 flex items-center gap-x-1 text-lg">
          <div class="text-neutral-a11">Don't have an account?</div>
          <a
            class="font-medium text-primary underline-offset-2 hover:underline"
            routerLink="/sign-up"
            >Sign up</a
          >
        </div>

        <form
          [formRoot]="signInForm"
          class="mt-8 flex flex-col"
        >
          <div class="flex flex-col gap-y-4">
            <mat-form-field class="w-full">
              <mat-label>Email address</mat-label>
              <input
                matInput
                type="email"
                [formField]="signInForm.email"
              />
              <mat-error>
                @for (error of signInForm.email().errors(); track error) {
                  {{ error.message }}
                }
              </mat-error>
            </mat-form-field>

            <mat-form-field class="w-full">
              <mat-label>Password</mat-label>
              <input
                matInput
                type="password"
                [formField]="signInForm.password"
              />
              <mat-error>
                @for (error of signInForm.password().errors(); track error) {
                  {{ error.message }}
                }
              </mat-error>
            </mat-form-field>
          </div>

          <div class="mt-4 flex items-center justify-between gap-x-2">
            <mat-checkbox>Remember me</mat-checkbox>

            <a
              class="text-sm font-medium text-primary underline-offset-2 hover:underline"
              routerLink="/forgot-password"
              >Forgot password?</a
            >
          </div>

          <button
            matButton
            type="submit"
            class="primary large mt-8 w-full"
          >
            Sign in
          </button>
        </form>

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
export default class AuthSignIn {
  // Dependencies
  private router = inject(Router);

  // State
  private signInFormModel = signal({
    email: 'johnbuilder@example.com',
    password: '123456',
  });

  // Forms
  private signInForm = form(
    this.signInFormModel,
    (schema) => {
      required(schema.email, { message: 'Email is required!' });
      email(schema.email, { message: 'Must be valid email address!' });
      required(schema.password, { message: 'Password is required!' });
    },
    {
      submission: {
        action: async () => {
          // Sign the user in
          // ...

          // Redirect the user
          await this.router.navigate(['/']);
        },
      },
    }
  );
}
