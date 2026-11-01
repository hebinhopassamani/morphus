import { Component, inject, linkedSignal, model } from '@angular/core';
import { form, FormField, FormRoot, required } from '@angular/forms/signals';
import { MatButton } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import {
  FileItem,
  FilesService,
} from '@/app/domains/admin/modules/files/data/files';
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
  selector: 'files-rename',
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
      [open]="!!item()"
      (closed)="item.set(null)"
    >
      <ng-template buiDialogPortal>
        <div buiDialogBackdrop></div>
        <form
          buiDialogContent
          class="max-w-none"
          [formRoot]="renameForm"
        >
          <!-- Header -->
          <div buiDialogHeader>
            <div buiDialogTitle>Rename</div>
            <div buiDialogDescription>
              Choose a new name. Sharing and activity stay the same.
            </div>
          </div>

          <!-- Body -->
          <div buiDialogBody>
            <mat-form-field class="w-full">
              <mat-label>Name</mat-label>
              <input
                matInput
                [formField]="renameForm.name"
              />
              <mat-error>
                @for (error of renameForm.name().errors(); track error) {
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
              Rename
            </button>
          </div>
        </form>
      </ng-template>
    </div>
  `,
})
export class FilesRename {
  // Dependencies
  private filesService = inject(FilesService);

  // Inputs / Outputs
  readonly item = model<FileItem | null>(null);

  // Forms
  private renameFormModel = linkedSignal(() => ({
    name: this.item()?.name ?? '',
  }));
  private renameForm = form(
    this.renameFormModel,
    (schema) => {
      required(schema.name, { message: 'Name is required!' });
    },
    {
      submission: {
        action: async (field) => {
          this.filesService.rename(
            this.item()!.id,
            this.renameFormModel().name
          );
          field().reset();
          this.item.set(null);
        },
      },
    }
  );
}
