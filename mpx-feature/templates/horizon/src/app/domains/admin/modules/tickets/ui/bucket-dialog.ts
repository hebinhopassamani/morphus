import { Component, inject, signal } from '@angular/core';
import { form, FormField, required, submit } from '@angular/forms/signals';
import { MatButton } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogClose,
  MatDialogRef,
} from '@angular/material/dialog';
import {
  MatError,
  MatFormField,
  MatHint,
  MatInput,
  MatLabel,
  MatPrefix,
} from '@angular/material/input';
import {
  Bucket,
  TicketsService,
} from '@/app/domains/admin/modules/tickets/data/tickets';
import { TicketHuePicker } from '@/app/domains/admin/modules/tickets/ui/hue-picker';

@Component({
  selector: 'ticket-bucket-dialog',
  imports: [
    MatFormField,
    MatInput,
    FormField,
    MatLabel,
    MatPrefix,
    MatHint,
    MatError,
    MatButton,
    MatDialogClose,
    TicketHuePicker,
  ],
  template: `
    <div class="text-2xl font-medium">
      {{ data.bucket ? 'Edit bucket' : 'New bucket' }}
    </div>
    <form
      novalidate
      class="mt-6 flex flex-col"
      (submit)="handleSubmit($event)"
    >
      <!-- Name -->
      <div>
        <mat-form-field class="w-full">
          <ticket-hue-picker
            matIconPrefix
            [(hue)]="bucketForm.hue().value"
          />
          <mat-label>Name</mat-label>
          <input
            matInput
            [formField]="bucketForm.name"
          />
          <mat-hint>Click the color to change it</mat-hint>
          <mat-error>
            @for (error of bucketForm.name().errors(); track error) {
              {{ error.message }}
            }
          </mat-error>
        </mat-form-field>
      </div>

      <div class="mt-6 flex items-center justify-end gap-x-2">
        <button
          matButton
          type="button"
          matDialogClose
        >
          Cancel
        </button>
        <button
          matButton
          type="submit"
          class="primary"
        >
          {{ data.bucket ? 'Save' : 'Create' }}
        </button>
      </div>
    </form>
  `,
})
export class TicketBucketDialog {
  // Dependencies
  private data = inject<{ bucket?: Bucket }>(MAT_DIALOG_DATA);
  private ticketsService = inject(TicketsService);
  private matDialogRef = inject(MatDialogRef);

  // State
  private bucketFormModel = signal({
    name: this.data.bucket?.name ?? '',
    hue: this.data.bucket?.hue ?? 'blue',
  });
  private bucketForm = form(this.bucketFormModel, (schema) => {
    // Name
    required(schema.name, { message: 'Name is required' });
  });

  private handleSubmit(event: Event) {
    event.preventDefault();
    submit(this.bucketForm, async (form) => {
      const bucket = this.data.bucket;

      if (bucket) {
        this.ticketsService.updateBucket(bucket.id, form().value());
      } else {
        this.ticketsService.createBucket(form().value());
      }

      this.matDialogRef.close();
    });
  }
}
