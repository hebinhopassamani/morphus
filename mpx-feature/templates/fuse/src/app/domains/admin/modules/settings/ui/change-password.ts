import { Component, model, signal } from '@angular/core';
import {
  form,
  FormField,
  FormRoot,
  minLength,
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
} from '@/app/ui/dialog';

@Component({
  selector: 'settings-change-password',
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
          [formRoot]="changePasswordForm"
        >
          <!-- Header -->
          <div buiDialogHeader>
            <div buiDialogTitle>Change password</div>
            <div buiDialogDescription>
              Use at least 12 characters you don't use anywhere else.
            </div>
          </div>

          <!-- Body -->
          <div
            buiDialogBody
            class="flex flex-col gap-y-5"
          >
            <!-- Current password -->
            <mat-form-field class="w-full">
              <mat-label>Current password</mat-label>
              <input
                matInput
                type="password"
                [formField]="changePasswordForm.currentPassword"
              />
              <mat-error>
                @for (
                  error of changePasswordForm.currentPassword().errors();
                  track error
                ) {
                  {{ error.message }}
                }
              </mat-error>
            </mat-form-field>

            <!-- New password -->
            <mat-form-field class="w-full">
              <mat-label>New password</mat-label>
              <input
                matInput
                type="password"
                [formField]="changePasswordForm.newPassword"
              />
              <mat-error>
                @for (
                  error of changePasswordForm.newPassword().errors();
                  track error
                ) {
                  {{ error.message }}
                }
              </mat-error>
            </mat-form-field>

            <!-- Confirm new password -->
            <mat-form-field class="w-full">
              <mat-label>Confirm new password</mat-label>
              <input
                matInput
                type="password"
                [formField]="changePasswordForm.confirmPassword"
              />
              <mat-error>
                @for (
                  error of changePasswordForm.confirmPassword().errors();
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
              Update password
            </button>
          </div>
        </form>
      </ng-template>
    </div>
  `,
})
export class SettingsChangePassword {
  // Inputs / Outputs
  readonly open = model(false);

  // Forms
  private changePasswordFormModel = signal(this.defaults());
  private changePasswordForm = form(
    this.changePasswordFormModel,
    (schema) => {
      required(schema.currentPassword, {
        message: 'Current password is required.',
      });
      required(schema.newPassword, { message: 'New password is required.' });
      minLength(schema.newPassword, 12, {
        message: 'Use at least 12 characters.',
      });
      validate(schema.confirmPassword, ({ value, valueOf }) =>
        value() === valueOf(schema.newPassword)
          ? null
          : { kind: 'mismatch', message: 'Passwords do not match.' }
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
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    };
  }
}
