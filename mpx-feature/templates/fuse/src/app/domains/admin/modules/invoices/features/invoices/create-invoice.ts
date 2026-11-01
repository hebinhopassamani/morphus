import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, model, signal } from '@angular/core';
import { form, FormField, FormRoot } from '@angular/forms/signals';
import { MatButton, MatIconButton } from '@angular/material/button';
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerToggle,
} from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { add } from 'date-fns';
import {
  InvoicesService,
  TERMS,
} from '@/app/domains/admin/modules/invoices/data/invoices';
import {
  Customer,
  Product,
} from '@/app/domains/admin/modules/orders/data/orders';
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
  selector: 'invoices-create-invoice',
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
    CurrencyPipe,
    FormField,
    FormRoot,
    MatButton,
    MatDatepicker,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatFormFieldModule,
    MatIcon,
    MatIconButton,
    MatInput,
    MatOption,
    MatSelect,
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
          [formRoot]="createInvoiceForm"
        >
          <!-- Header -->
          <div buiDialogHeader>
            <div buiDialogTitle>Create invoice</div>
            <div buiDialogDescription>
              Bill a customer for items outside of an order.
            </div>
          </div>

          <!-- Body -->
          <div
            buiDialogBody
            class="flex flex-col gap-y-4"
          >
            <mat-form-field class="w-full">
              <mat-label>Customer</mat-label>
              <mat-select [formField]="createInvoiceForm.customer">
                @for (customer of customers(); track customer.email) {
                  <mat-option [value]="customer">
                    {{ customer.name }}
                  </mat-option>
                }
              </mat-select>
            </mat-form-field>

            <!-- Items -->
            <div class="flex flex-col gap-y-2">
              <div class="font-medium">Items</div>
              @for (item of createInvoiceForm.items; track $index) {
                <div class="flex items-center gap-x-2">
                  <mat-form-field class="min-w-0 flex-auto">
                    <mat-select
                      aria-label="Product"
                      placeholder="Select a product"
                      [formField]="item.product"
                    >
                      @for (product of products(); track product.sku) {
                        <mat-option [value]="product">
                          {{ product.name }} · {{ product.variant }}
                        </mat-option>
                      }
                    </mat-select>
                  </mat-form-field>
                  <mat-form-field class="w-20">
                    <input
                      matInput
                      type="number"
                      aria-label="Quantity"
                      [formField]="item.quantity"
                    />
                  </mat-form-field>
                  <button
                    matIconButton
                    type="button"
                    (click)="removeItem($index)"
                  >
                    <mat-icon svgIcon="trash" />
                  </button>
                </div>
              }
              <div class="flex items-center justify-between gap-x-4">
                <button
                  matButton
                  type="button"
                  (click)="addItem()"
                >
                  <mat-icon svgIcon="plus" />
                  Add item
                </button>
                <div class="tabular-nums">
                  <span class="text-neutral-a11">Subtotal</span>
                  <span class="ms-2 font-medium">
                    {{ subtotal() | currency: 'USD' : 'symbol' : '1.2-2' }}
                  </span>
                </div>
              </div>
            </div>

            <mat-form-field class="w-full">
              <mat-label>Due date</mat-label>
              <input
                matInput
                [matDatepicker]="dueDatePicker"
                [formField]="createInvoiceForm.dueDate"
              />
              <mat-datepicker-toggle
                [for]="dueDatePicker"
                matIconSuffix
              />
              <mat-datepicker #dueDatePicker />
            </mat-form-field>

            <mat-form-field class="w-full">
              <mat-label>Note</mat-label>
              <textarea
                matInput
                rows="3"
                [formField]="createInvoiceForm.note"
              ></textarea>
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
              Create invoice
            </button>
          </div>
        </form>
      </ng-template>
    </div>
  `,
})
export class InvoicesCreateInvoice {
  // Dependencies
  private invoicesService = inject(InvoicesService);

  // Inputs / Outputs
  readonly open = model(false);

  // State
  private invoices = this.invoicesService.invoices;

  // Computed state
  private customers = computed(() =>
    [
      ...new Map(
        this.invoices().map((invoice) => [
          invoice.customer.email,
          invoice.customer,
        ])
      ).values(),
    ].sort((a, b) => a.name.localeCompare(b.name))
  );
  private products = computed(() =>
    [
      ...new Map(
        this.invoices()
          .flatMap((invoice) => invoice.items)
          .map((item) => [item.sku, item])
      ).values(),
    ].sort((a, b) => a.name.localeCompare(b.name))
  );
  private subtotal = computed(() =>
    this.createInvoiceFormModel().items.reduce(
      (sum, item) => sum + (item.product?.price ?? 0) * item.quantity,
      0
    )
  );

  // Forms
  private createInvoiceFormModel = signal(this.defaults());
  private createInvoiceForm = form(this.createInvoiceFormModel, {
    submission: {
      action: async (field) => {
        field().reset(this.defaults());
        this.open.set(false);
      },
    },
  });

  private addItem() {
    this.createInvoiceFormModel.update((model) => ({
      ...model,
      items: [...model.items, { product: null, quantity: 1 }],
    }));
  }

  private removeItem(index: number) {
    this.createInvoiceFormModel.update((model) => ({
      ...model,
      items: model.items.filter((_, i) => i !== index),
    }));
  }

  private defaults() {
    return {
      customer: null as Customer | null,
      items: [{ product: null as Product | null, quantity: 1 }],
      dueDate: add(new Date(), { days: TERMS }),
      note: '',
    };
  }
}
