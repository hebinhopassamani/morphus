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
import { MatButtonModule } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'auth-sign-up',
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
    <div class="grid flex-auto grid-cols-1 md:grid-cols-2">
      <!-- Form -->
      <div
        class="flex flex-auto items-center justify-center p-6 md:justify-end md:px-24"
      >
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

          <div class="mt-8 text-4xl font-semibold">Create an account</div>
          <div class="mt-1 flex items-center gap-x-1 text-lg">
            <div class="text-neutral-a11">Already have an account?</div>
            <a
              class="font-medium text-primary underline-offset-2 hover:underline"
              routerLink="/sign-in"
              >Sign in
            </a>
          </div>

          <form
            [formRoot]="signUpForm"
            class="mt-8 flex flex-col"
          >
            <div class="flex flex-col gap-y-4">
              <mat-form-field class="w-full">
                <mat-label>Name</mat-label>
                <input
                  matInput
                  type="text"
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
                  matInput
                  type="email"
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
                  matInput
                  type="password"
                  [formField]="signUpForm.password"
                />
                <mat-error>
                  @for (error of signUpForm.password().errors(); track error) {
                    {{ error.message }}
                  }
                </mat-error>
              </mat-form-field>

              <mat-form-field class="w-full">
                <mat-label>Confirm Password</mat-label>
                <input
                  matInput
                  type="password"
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
                class="ms-0.5 inline-flex font-medium text-primary-a11 decoration-primary-a11 hover:underline"
                routerLink="."
                >terms and conditions</a
              >
            </mat-checkbox>

            <button
              matButton
              type="submit"
              class="primary large mt-8 w-full"
            >
              Create account
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

      <!-- Quote panel -->
      <div
        class="3xl:p-40 @container relative m-4 hidden flex-auto flex-col justify-center overflow-hidden rounded-2xl bg-linear-[145deg] from-[oklch(0.85_0.1_310)] from-0% via-[oklch(0.5_0.22_305)] via-35% to-[oklch(0.13_0.03_300)] to-80% p-20 inset-ring inset-ring-black-a3 md:flex xl:p-30 dark:inset-ring-white-a3"
      >
        <div class="relative hidden w-full shrink-0 2xl:flex">
          <img
            class="h-auto w-full rounded-md shadow-xl ring-1 ring-black-a2 @xl:rounded-lg @4xl:rounded-xl @5xl:rounded-2xl dark:hidden"
            ngSrc="/images/screenshots/tickets-light.png"
            width="3600"
            height="2250"
            alt="Horizon tickets"
          />
          <img
            class="hidden h-auto w-full rounded-md shadow-xl ring-1 ring-black-a2 @xl:rounded-lg @4xl:rounded-xl @5xl:rounded-2xl dark:block"
            ngSrc="/images/screenshots/tickets-dark.png"
            width="3600"
            height="2250"
            alt="Horizon tickets"
          />
        </div>
        <figure
          class="relative flex max-w-3xl shrink-0 flex-col gap-y-6 2xl:mt-10 @lg:px-20"
        >
          <blockquote
            class="text-3xl leading-8 text-pretty text-white @lg:leading-10"
          >
            "Every request lands in one shared inbox now. Nothing slips through,
            and customers hear back from us the same day."
          </blockquote>
          <figcaption class="flex items-center gap-x-3">
            <img
              class="size-10 rounded-full object-cover"
              ngSrc="/images/photos/czhkkxemt8hqp1wl296t5.jpg"
              width="40"
              height="40"
              alt="Mia Winters"
            />
            <div class="flex flex-col">
              <div class="text-lg font-medium text-white">Mia Winters</div>
              <div class="text-base text-white-a8">
                Support Lead, Example Labs
              </div>
            </div>
          </figcaption>
        </figure>
      </div>
    </div>
  `,
})
export default class AuthSignUp {
  // Dependencies
  private router = inject(Router);

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
          // ...

          // Redirect the user
          await this.router.navigate(['/']);
        },
      },
    }
  );
}
