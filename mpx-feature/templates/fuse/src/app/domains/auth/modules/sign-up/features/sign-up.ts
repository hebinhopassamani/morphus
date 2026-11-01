import { NgOptimizedImage } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import {
  email,
  form,
  FormField,
  FormRoot,
  required,
  validate,
} from '@angular/forms/signals';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardFooter } from '@angular/material/card';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatDivider } from '@angular/material/divider';
import {
  MatError,
  MatFormField,
  MatInput,
  MatLabel,
} from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@/app/domains/auth/data/auth';

@Component({
  selector: 'auth-sign-up',
  imports: [
    FormField,
    FormRoot,
    MatButton,
    MatCard,
    MatCardContent,
    MatCardFooter,
    MatCheckbox,
    MatDivider,
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
          <div class="mt-8 text-4xl font-semibold">Create an account</div>

          <form
            class="mt-8 flex w-full flex-col"
            [formRoot]="signUpForm"
          >
            <div class="flex flex-col gap-y-4">
              <mat-form-field class="w-full">
                <mat-label>Name</mat-label>
                <input
                  matInput
                  [formField]="signUpForm.name"
                />
                <mat-error>
                  @for (error of signUpForm.name().errors(); track error) {
                    {{ error.message }}
                  }
                </mat-error>
              </mat-form-field>

              <mat-form-field class="w-full">
                <mat-label>Email address</mat-label>
                <input
                  type="email"
                  matInput
                  [formField]="signUpForm.email"
                />
                <mat-error>
                  @for (error of signUpForm.email().errors(); track error) {
                    {{ error.message }}
                  }
                </mat-error>
              </mat-form-field>

              <mat-form-field class="w-full">
                <mat-label>Password</mat-label>
                <input
                  type="password"
                  matInput
                  [formField]="signUpForm.password"
                />
                <mat-error>
                  @for (error of signUpForm.password().errors(); track error) {
                    {{ error.message }}
                  }
                </mat-error>
              </mat-form-field>

              <mat-form-field class="w-full">
                <mat-label>Password confirm</mat-label>
                <input
                  type="password"
                  matInput
                  [formField]="signUpForm.confirmPassword"
                />
                <mat-error>
                  @for (
                    error of signUpForm.confirmPassword().errors();
                    track error
                  ) {
                    {{ error.message }}
                  }
                </mat-error>
              </mat-form-field>
            </div>

            <mat-checkbox class="mt-4"
              >I've read
              <a
                class="ms-1 inline-flex font-medium text-primary-a11 decoration-primary-a11 hover:underline"
                routerLink="."
                >terms and conditions</a
              >
            </mat-checkbox>

            <button
              class="primary large mt-8 w-full"
              matButton
              type="submit"
            >
              Create an account
            </button>
          </form>

          <div class="mt-8 flex w-full items-center gap-x-4">
            <mat-divider class="flex-auto" />
            <div class="font-medium text-neutral-a11">or</div>
            <mat-divider class="flex-auto" />
          </div>

          <div class="mt-8 flex w-full items-center gap-x-4">
            <button
              matButton
              class="large flex-auto"
            >
              <svg
                class="me-2 size-5"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </button>
            <button
              matButton
              class="large flex-auto"
            >
              <svg
                class="me-2 size-5 fill-current"
                viewBox="0 0 16 16"
                aria-hidden="true"
              >
                <path
                  d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
                />
              </svg>
              GitHub
            </button>
          </div>
        </mat-card-content>
        <mat-card-footer
          class="flex items-center justify-center gap-x-1 px-2 py-2 text-neutral-a11"
        >
          Already have an account?
          <a
            matButton
            class="link text-primary-a11 decoration-primary-a11"
            routerLink="/sign-in"
            >Sign in</a
          >
        </mat-card-footer>
      </mat-card>
    </div>
  `,
})
export default class AuthSignUp {
  // Dependencies
  private router = inject(Router);
  private auth = inject(AuthService);

  // State
  private signUpFormModel = signal({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Forms
  private signUpForm = form(
    this.signUpFormModel,
    (schema) => {
      required(schema.name, { message: 'Name is required!' });
      required(schema.email, { message: 'Email is required!' });
      email(schema.email, { message: 'Must be valid email address!' });
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
          // Sign the user up
          this.auth.signIn();

          // Redirect the user
          await this.router.navigate(['/']);
        },
      },
    }
  );
}
