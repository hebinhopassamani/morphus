import { Component, input, linkedSignal, model } from '@angular/core';
import { form, FormField, FormRoot } from '@angular/forms/signals';
import { MatButton } from '@angular/material/button';
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerToggle,
} from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
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
  selector: 'invoice-record-payment',
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
    MatDatepicker,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatFormFieldModule,
    MatInput,
    MatOption,
    MatSelect,
  ],
  template: `
    <div
      buiDialog
      class="w-full max-w-md"
      [(open)]="open"
    >
      <ng-template buiDialogPortal>
        <div buiDialogBackdrop></div>
        <form
          buiDialogContent
          class="max-w-none"
          [formRoot]="recordPaymentForm"
        >
          <!-- Header -->
          <div buiDialogHeader>
            <div buiDialogTitle>Record payment</div>
            <div buiDialogDescription>
              Log a payment received outside of checkout.
            </div>
          </div>

          <!-- Body -->
          <div
            buiDialogBody
            class="flex flex-col gap-y-4"
          >
            <div class="grid grid-cols-2 gap-4">
              <mat-form-field class="w-full">
                <mat-label>Amount</mat-label>
                <input
                  matInput
                  type="number"
                  [formField]="recordPaymentForm.amount"
                />
              </mat-form-field>

              <mat-form-field class="w-full">
                <mat-label>Date</mat-label>
                <input
                  matInput
                  [matDatepicker]="datePicker"
                  [formField]="recordPaymentForm.date"
                />
                <mat-datepicker-toggle
                  [for]="datePicker"
                  matIconSuffix
                />
                <mat-datepicker #datePicker />
              </mat-form-field>
            </div>

            <mat-form-field class="w-full">
              <mat-label>Method</mat-label>
              <mat-select [formField]="recordPaymentForm.method">
                @for (method of methods; track method) {
                  <mat-option [value]="method">
                    {{ method }}
                  </mat-option>
                }
              </mat-select>
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
              Record payment
            </button>
          </div>
        </form>
      </ng-template>
    </div>
  `,
})
export class InvoiceRecordPayment {
  // Inputs / Outputs
  readonly open = model(false);
  readonly balance = input.required<number>();

  // State
  private methods = ['Bank transfer', 'Card', 'Cash', 'Check'];

  // Forms
  private recordPaymentFormModel = linkedSignal(() => this.defaults());
  private recordPaymentForm = form(this.recordPaymentFormModel, {
    submission: {
      action: async (field) => {
        field().reset(this.defaults());
        this.open.set(false);
      },
    },
  });

  private defaults() {
    return {
      amount: this.balance(),
      date: new Date(),
      method: this.methods[0],
    };
  }
}
