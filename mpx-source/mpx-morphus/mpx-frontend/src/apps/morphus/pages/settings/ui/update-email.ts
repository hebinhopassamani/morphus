import { Component, inject, model, signal } from '@angular/core';
import {
  email,
  form,
  FormField,
  FormRoot,
  readonly,
  required,
  validate,
} from '@angular/forms/signals';
import { MatButton } from '@angular/material/button';
import {
  MatError,
  MatFormField,
  MatInput,
  MatLabel,
} from '@angular/material/input';
import { Auth } from '@/apps/core/auth';
import {
  BuiDialog,
  BuiDialogBackdrop,
  BuiDialogBody,
  BuiDialogClose,
  BuiDialogContent,
  BuiDialogDescription,
  BuiDialogFooter,
  BuiDialogHeader,
  BuiDialogPortal,
  BuiDialogTitle,
} from '@builder-kit/dialog';

@Component({
  selector: 'settings-update-email',
  imports: [
    BuiDialog,
    BuiDialogBackdrop,
    BuiDialogBody,
    BuiDialogClose,
    BuiDialogContent,
    BuiDialogDescription,
    BuiDialogFooter,
    BuiDialogHeader,
    BuiDialogPortal,
    BuiDialogTitle,
    FormField,
    FormRoot,
    MatButton,
    MatError,
    MatFormField,
    MatInput,
    MatLabel,
  ],
  template: `
    <div
      buiDialog
      class="w-full max-w-sm"
      [(open)]="open"
      [autoFocus]="undefined"
    >
      <ng-template buiDialogPortal>
        <div buiDialogBackdrop></div>
        <form
          buiDialogContent
          class="max-w-none"
          [formRoot]="updateEmailForm"
        >
          <!-- Header -->
          <div buiDialogHeader>
            <div buiDialogTitle>Update email address</div>
            <div buiDialogDescription>
              The address you sign in with and receive notifications at.
            </div>
          </div>

          <!-- Body -->
          <div
            buiDialogBody
            class="flex flex-col gap-y-5"
          >
            <!-- Current email -->
            <mat-form-field class="w-full">
              <mat-label>Current email</mat-label>
              <input
                matInput
                type="email"
                [formField]="updateEmailForm.currentEmail"
              />
            </mat-form-field>

            <!-- New email -->
            <mat-form-field class="w-full">
              <mat-label>New email</mat-label>
              <input
                matInput
                type="email"
                [formField]="updateEmailForm.newEmail"
              />
              <mat-error>
                @for (
                  error of updateEmailForm.newEmail().errors();
                  track error
                ) {
                  {{ error.message }}
                }
              </mat-error>
            </mat-form-field>
          </div>

          <!-- Footer -->
          <div buiDialogFooter>
            <button
              matButton
              type="button"
              buiDialogClose
            >
              Cancel
            </button>
            <button
              matButton
              type="submit"
              class="primary"
            >
              Update email
            </button>
          </div>
        </form>
      </ng-template>
    </div>
  `,
})
export class SettingsUpdateEmail {
  private readonly auth = inject(Auth);
  readonly open = model(false);

  private updateEmailFormModel = signal(this.defaults());
  protected updateEmailForm = form(
    this.updateEmailFormModel,
    (schema) => {
      readonly(schema.currentEmail);
      required(schema.newEmail, { message: 'New email is required.' });
      email(schema.newEmail, {
        message: 'Please enter a valid email address.',
      });
      validate(schema.newEmail, ({ value, valueOf }) =>
        value() === valueOf(schema.currentEmail)
          ? { kind: 'sameEmail', message: 'Use a different email address.' }
          : null
      );
    },
    {
      submission: {
        action: async (field) => {
          field().reset(this.defaults());
          this.open.set(false);
        },
      },
    }
  );

  private defaults() {
    return {
      currentEmail: this.auth.user()?.email || 'john@example.com',
      newEmail: '',
    };
  }
}
