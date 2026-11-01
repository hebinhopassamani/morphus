import { Component, signal } from '@angular/core';
import {
  email,
  form,
  FormField,
  readonly,
  required,
  submit,
  validate,
} from '@angular/forms/signals';
import { MatButton } from '@angular/material/button';
import {
  MatError,
  MatFormField,
  MatInput,
  MatLabel,
} from '@angular/material/input';

@Component({
  selector: 'settings-update-email',
  imports: [MatFormField, MatInput, FormField, MatLabel, MatError, MatButton],
  template: `
    <div class="text-2xl font-medium">Update email address</div>
    <form
      novalidate
      class="mt-6 flex flex-col"
      (submit)="handleSubmit($event)"
    >
      <!-- Current email -->
      <div>
        <mat-form-field class="w-full">
          <mat-label>Current email</mat-label>
          <input
            type="email"
            matInput
            [formField]="updateEmailForm.currentEmail"
          />
        </mat-form-field>
      </div>

      <!-- New email -->
      <div class="mt-6">
        <mat-form-field class="w-full">
          <mat-label>New email</mat-label>
          <input
            type="email"
            matInput
            [formField]="updateEmailForm.newEmail"
          />
          <mat-error>
            @for (error of updateEmailForm.newEmail().errors(); track error) {
              {{ error.message }}
            }
          </mat-error>
        </mat-form-field>
      </div>

      <button
        matButton
        type="submit"
        class="primary mt-6"
      >
        Update email
      </button>
    </form>
  `,
})
export class SettingsUpdateEmail {
  // State
  private updateEmailFormModel = signal({
    currentEmail: 'john@example.com',
    newEmail: 'johnbuilder@example.com',
  });
  private updateEmailForm = form(this.updateEmailFormModel, (schema) => {
    // Current email
    readonly(schema.currentEmail);

    // New email
    required(schema.newEmail, { message: 'New email is required' });
    email(schema.newEmail, {
      message: 'New email must be a valid email address',
    });
    validate(schema.newEmail, ({ value, valueOf }) => {
      const newEmail = value();
      const currentEmail = valueOf(schema.currentEmail);

      if (currentEmail && currentEmail === newEmail) {
        return {
          kind: 'sameEmail',
          message: 'Use a different email address',
        };
      }

      return null;
    });
  });

  private handleSubmit(event: Event) {
    event.preventDefault();
    submit(this.updateEmailForm, async (form) => {
      // Handle form submission
    });
  }
}
