import { Component, model, signal } from '@angular/core';
import { form, FormField, FormRoot } from '@angular/forms/signals';
import { MatButton } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
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
  selector: 'customers-add-customer',
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
      class="w-full max-w-lg"
      [(open)]="open"
    >
      <ng-template buiDialogPortal>
        <div buiDialogBackdrop></div>
        <form
          buiDialogContent
          class="max-w-none"
          [formRoot]="addCustomerForm"
        >
          <!-- Header -->
          <div buiDialogHeader>
            <div buiDialogTitle>Add customer</div>
            <div buiDialogDescription>
              Create a customer profile to place orders for.
            </div>
          </div>

          <!-- Body -->
          <div
            buiDialogBody
            class="flex flex-col gap-y-4"
          >
            <mat-form-field class="w-full">
              <mat-label>Name</mat-label>
              <input
                matInput
                [formField]="addCustomerForm.name"
              />
            </mat-form-field>

            <div class="grid gap-4 sm:grid-cols-2">
              <mat-form-field class="w-full">
                <mat-label>Email</mat-label>
                <input
                  matInput
                  type="email"
                  [formField]="addCustomerForm.email"
                />
              </mat-form-field>
              <mat-form-field class="w-full">
                <mat-label>Phone</mat-label>
                <input
                  matInput
                  type="tel"
                  [formField]="addCustomerForm.phone"
                />
              </mat-form-field>
            </div>

            <mat-form-field class="w-full">
              <mat-label>Street</mat-label>
              <input
                matInput
                [formField]="addCustomerForm.street"
              />
            </mat-form-field>

            <div class="grid gap-4 sm:grid-cols-2">
              <mat-form-field class="w-full">
                <mat-label>City</mat-label>
                <input
                  matInput
                  [formField]="addCustomerForm.city"
                />
              </mat-form-field>
              <mat-form-field class="w-full">
                <mat-label>Country</mat-label>
                <input
                  matInput
                  [formField]="addCustomerForm.country"
                />
              </mat-form-field>
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
              Add customer
            </button>
          </div>
        </form>
      </ng-template>
    </div>
  `,
})
export class CustomersAddCustomer {
  // Inputs / Outputs
  readonly open = model(false);

  // Forms
  private addCustomerFormModel = signal(this.defaults());
  private addCustomerForm = form(this.addCustomerFormModel, {
    submission: {
      action: async (field) => {
        field().reset(this.defaults());
        this.open.set(false);
      },
    },
  });

  private defaults() {
    return {
      name: '',
      email: '',
      phone: '',
      street: '',
      city: '',
      country: '',
    };
  }
}
