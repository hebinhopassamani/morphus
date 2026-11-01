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
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatDivider } from '@angular/material/divider';
import {
  MatError,
  MatFormField,
  MatInput,
  MatLabel,
} from '@angular/material/input';
import { Router } from '@angular/router';

@Component({
  selector: 'auth-sign-in',
  imports: [
    FormField,
    FormRoot,
    MatButton,
    MatCard,
    MatCardContent,
    MatCheckbox,
    MatDivider,
    MatError,
    MatFormField,
    MatInput,
    MatLabel,
    NgOptimizedImage,
  ],
  template: `
    <div class="flex flex-auto flex-col items-center justify-center p-6">
      <mat-card class="w-full max-w-sm px-8 py-12 sm:px-10">
        <mat-card-content>
          <!-- Logo -->
          <div>
            <img
              class="dark:hidden"
              ngSrc="/images/logo/logomark-light.svg"
              width="40"
              height="40"
              alt="Spark logo"
            />
            <img
              class="hidden dark:block"
              ngSrc="/images/logo/logomark-dark.svg"
              width="40"
              height="40"
              alt="Spark logo"
            />
          </div>

          <div class="mt-8 text-4xl font-semibold">Sign in to your account</div>
          <div class="mt-1 flex items-center gap-x-1 text-lg text-neutral-a11">
            Welcome back! Please enter your details.
          </div>

          <form
            class="mt-8 flex flex-col"
            [formRoot]="signInForm"
          >
            <div class="flex flex-col gap-y-4">
              <mat-form-field class="w-full">
                <mat-label>Email address</mat-label>
                <input
                  type="email"
                  matInput
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
                  type="password"
                  matInput
                  [formField]="signInForm.password"
                />
                <mat-error>
                  @for (error of signInForm.password().errors(); track error) {
                    {{ error.message }}
                  }
                </mat-error>
              </mat-form-field>
            </div>

            <div class="mt-4 flex items-center justify-between">
              <mat-checkbox>Remember me</mat-checkbox>
              <a
                class="link text-primary-a11 decoration-primary-a11"
                matButton
                >Forgot password?</a
              >
            </div>

            <button
              class="primary mt-8 w-full"
              matButton
              type="submit"
            >
              Sign in
            </button>
          </form>

          <div class="mt-8 flex items-center gap-x-4">
            <mat-divider class="flex-auto" />
            <div class="font-medium text-neutral-a11">Or continue with</div>
            <mat-divider class="flex-auto" />
          </div>

          <div class="mt-4 flex items-center gap-x-4">
            <button
              class="flex-auto"
              matButton
            >
              Google
            </button>
            <button
              class="flex-auto"
              matButton
            >
              GitHub
            </button>
          </div>
        </mat-card-content>
      </mat-card>
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
