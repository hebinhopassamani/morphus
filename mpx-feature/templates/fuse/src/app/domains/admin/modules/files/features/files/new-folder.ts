import { Component, inject, input, model, signal } from '@angular/core';
import { form, FormField, FormRoot, required } from '@angular/forms/signals';
import { MatButton } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FilesService } from '@/app/domains/admin/modules/files/data/files';
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
  selector: 'files-new-folder',
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
    MatFormFieldModule,
    MatInput,
  ],
  template: `
    <div
      buiDialog
      class="w-full max-w-sm"
      [(open)]="open"
    >
      <ng-template buiDialogPortal>
        <div buiDialogBackdrop></div>
        <form
          buiDialogContent
          class="max-w-none"
          [formRoot]="newFolderForm"
        >
          <!-- Header -->
          <div buiDialogHeader>
            <div buiDialogTitle>New folder</div>
            <div buiDialogDescription>
              Keep related files together in one place.
            </div>
          </div>

          <!-- Body -->
          <div buiDialogBody>
            <mat-form-field class="w-full">
              <mat-label>Name</mat-label>
              <input
                matInput
                [formField]="newFolderForm.name"
              />
              <mat-error>
                @for (error of newFolderForm.name().errors(); track error) {
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
              Create folder
            </button>
          </div>
        </form>
      </ng-template>
    </div>
  `,
})
export class FilesNewFolder {
  // Dependencies
  private filesService = inject(FilesService);

  // Inputs / Outputs
  readonly open = model(false);
  readonly parentId = input<string | null>(null);

  // Forms
  private newFolderFormModel = signal(this.defaults());
  private newFolderForm = form(
    this.newFolderFormModel,
    (schema) => {
      required(schema.name, { message: 'Name is required!' });
    },
    {
      submission: {
        action: async (field) => {
          this.filesService.create(
            this.parentId(),
            this.newFolderFormModel().name
          );
          field().reset(this.defaults());
          this.open.set(false);
        },
      },
    }
  );

  private defaults() {
    return {
      name: '',
    };
  }
}
