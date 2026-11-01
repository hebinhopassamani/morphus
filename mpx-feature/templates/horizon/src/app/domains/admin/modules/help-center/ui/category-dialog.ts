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
  HelpCategory,
  HelpCenterService,
} from '@/app/domains/admin/modules/help-center/data/help-center';
import { HelpIconPicker } from '@/app/domains/admin/modules/help-center/ui/icon-picker';

@Component({
  selector: 'help-category-dialog',
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
    HelpIconPicker,
  ],
  template: `
    <div class="text-2xl font-medium">
      {{ data.category ? 'Edit category' : 'New category' }}
    </div>
    <form
      novalidate
      class="mt-6 flex flex-col"
      (submit)="handleSubmit($event)"
    >
      <!-- Name -->
      <div>
        <mat-form-field class="w-full">
          <help-icon-picker
            matIconPrefix
            [(icon)]="categoryForm.icon().value"
          />
          <mat-label>Name</mat-label>
          <input
            matInput
            [formField]="categoryForm.name"
          />
          <mat-hint>Click the icon to change it</mat-hint>
          <mat-error>
            @for (error of categoryForm.name().errors(); track error) {
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
          {{ data.category ? 'Save' : 'Create' }}
        </button>
      </div>
    </form>
  `,
})
export class HelpCategoryDialog {
  // Dependencies
  private data = inject<{ category?: HelpCategory }>(MAT_DIALOG_DATA);
  private helpCenterService = inject(HelpCenterService);
  private matDialogRef = inject(MatDialogRef);

  // State
  private categoryFormModel = signal({
    name: this.data.category?.name ?? '',
    icon: this.data.category?.icon ?? 'rocket',
  });
  private categoryForm = form(this.categoryFormModel, (schema) => {
    // Name
    required(schema.name, { message: 'Name is required' });
  });

  private handleSubmit(event: Event) {
    event.preventDefault();
    submit(this.categoryForm, async (form) => {
      const category = this.data.category;

      if (category) {
        this.helpCenterService.updateCategory(category.id, form().value());
      } else {
        this.helpCenterService.createCategory(form().value());
      }

      this.matDialogRef.close();
    });
  }
}
