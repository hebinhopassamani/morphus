import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, model, signal } from '@angular/core';
import { form, FormField, FormRoot } from '@angular/forms/signals';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import {
  Customer,
  OrdersService,
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
  selector: 'orders-create-order',
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
          [formRoot]="createOrderForm"
        >
          <!-- Header -->
          <div buiDialogHeader>
            <div buiDialogTitle>Create order</div>
            <div buiDialogDescription>
              Place an order on behalf of a customer.
            </div>
          </div>

          <!-- Body -->
          <div
            buiDialogBody
            class="flex flex-col gap-y-4"
          >
            <mat-form-field class="w-full">
              <mat-label>Customer</mat-label>
              <mat-select [formField]="createOrderForm.customer">
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
              @for (item of createOrderForm.items; track $index) {
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
              <mat-label>Shipping method</mat-label>
              <mat-select [formField]="createOrderForm.shippingMethod">
                @for (method of shippingMethods(); track method.label) {
                  <mat-option [value]="method">
                    {{ method.label }}
                  </mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field class="w-full">
              <mat-label>Note</mat-label>
              <textarea
                matInput
                rows="3"
                [formField]="createOrderForm.note"
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
              Create order
            </button>
          </div>
        </form>
      </ng-template>
    </div>
  `,
})
export class OrdersCreateOrder {
  // Dependencies
  private ordersService = inject(OrdersService);

  // Inputs / Outputs
  readonly open = model(false);

  // State
  private orders = this.ordersService.orders;

  // Computed state
  private customers = computed(() =>
    [
      ...new Map(
        this.orders().map((order) => [order.customer.email, order.customer])
      ).values(),
    ].sort((a, b) => a.name.localeCompare(b.name))
  );
  private products = computed(() =>
    [
      ...new Map(
        this.orders()
          .flatMap((order) => order.items)
          .map((item) => [item.sku, item])
      ).values(),
    ].sort((a, b) => a.name.localeCompare(b.name))
  );
  private shippingMethods = computed(() => [
    ...new Map(
      this.orders().map((order) => [
        order.shippingMethod.label,
        order.shippingMethod,
      ])
    ).values(),
  ]);
  private subtotal = computed(() =>
    this.createOrderFormModel().items.reduce(
      (sum, item) => sum + (item.product?.price ?? 0) * item.quantity,
      0
    )
  );

  // Forms
  private createOrderFormModel = signal(this.defaults());
  private createOrderForm = form(this.createOrderFormModel, {
    submission: {
      action: async (field) => {
        field().reset(this.defaults());
        this.open.set(false);
      },
    },
  });

  private addItem() {
    this.createOrderFormModel.update((model) => ({
      ...model,
      items: [...model.items, { product: null, quantity: 1 }],
    }));
  }

  private removeItem(index: number) {
    this.createOrderFormModel.update((model) => ({
      ...model,
      items: model.items.filter((_, i) => i !== index),
    }));
  }

  private defaults() {
    return {
      customer: null as Customer | null,
      items: [{ product: null as Product | null, quantity: 1 }],
      shippingMethod: this.shippingMethods()[0],
      note: '',
    };
  }
}
