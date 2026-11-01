import { Component, inject, model, signal } from '@angular/core';
import {
  email,
  form,
  FormField,
  FormRoot,
  required,
} from '@angular/forms/signals';
import { MatButton } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { InboxService } from '@/app/domains/admin/modules/inbox/data/inbox';
import { InboxFormatToolbar } from '@/app/domains/admin/modules/inbox/ui/format-toolbar';
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
  selector: 'inbox-compose',
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
    InboxFormatToolbar,
    MatButton,
    MatFormFieldModule,
    MatInput,
  ],
  template: `
    <div
      buiDialog
      class="w-full max-w-lg"
      [(open)]="open"
    >
      <ng-template buiDialogPortal>
        <div buiDialogBackdrop></div>
        <form
          buiDialogContent
          class="max-w-none"
          [formRoot]="composeForm"
        >
          <!-- Header -->
          <div buiDialogHeader>
            <div buiDialogTitle>New message</div>
            <div buiDialogDescription>
              Write to a customer, a supplier or someone on the team.
            </div>
          </div>

          <!-- Body -->
          <div
            buiDialogBody
            class="flex flex-col gap-y-4"
          >
            <mat-form-field class="w-full">
              <mat-label>To</mat-label>
              <input
                matInput
                type="email"
                [formField]="composeForm.to"
              />
              <mat-error>
                @for (error of composeForm.to().errors(); track error) {
                  {{ error.message }}
                }
              </mat-error>
            </mat-form-field>

            <mat-form-field class="w-full">
              <mat-label>Subject</mat-label>
              <input
                matInput
                [formField]="composeForm.subject"
              />
              <mat-error>
                @for (error of composeForm.subject().errors(); track error) {
                  {{ error.message }}
                }
              </mat-error>
            </mat-form-field>

            <div class="flex flex-col rounded-lg border border-neutral-a4">
              <textarea
                class="min-h-40 resize-none bg-transparent px-3 pt-3 outline-none"
                aria-label="Message"
                placeholder="Write your message"
                [formField]="composeForm.body"
              ></textarea>
              <inbox-format-toolbar class="px-2 pb-2" />
            </div>
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
              Send
            </button>
          </div>
        </form>
      </ng-template>
    </div>
  `,
})
export class InboxCompose {
  // Dependencies
  private inboxService = inject(InboxService);

  // Inputs / Outputs
  readonly open = model(false);

  // Forms
  private composeFormModel = signal(this.defaults());
  private composeForm = form(
    this.composeFormModel,
    (schema) => {
      required(schema.to, { message: 'Recipient is required!' });
      email(schema.to, { message: 'Please enter a valid email address.' });
      required(schema.subject, { message: 'Subject is required!' });
    },
    {
      submission: {
        action: async (field) => {
          const { to, subject, body } = this.composeFormModel();
          this.inboxService.send(to, subject, body);
          field().reset(this.defaults());
          this.open.set(false);
        },
      },
    }
  );

  private defaults() {
    return {
      to: '',
      subject: '',
      body: '',
    };
  }
}
