import { Component, input } from '@angular/core';
import {
  FulfillmentStatus,
  PaymentStatus,
} from '@/app/domains/admin/modules/orders/data/orders';

@Component({
  selector: 'order-payment-tag',
  host: {
    class: 'flex',
  },
  template: `
    @switch (status()) {
      @case ('paid') {
        <div
          class="inline-flex items-center rounded-lg bg-jade-a3 px-2 py-0.5 text-sm font-medium whitespace-nowrap text-jade-a11"
        >
          Paid
        </div>
      }
      @case ('partially-paid') {
        <div
          class="inline-flex items-center rounded-lg bg-blue-a3 px-2 py-0.5 text-sm font-medium whitespace-nowrap text-blue-a11"
        >
          Partially paid
        </div>
      }
      @case ('unpaid') {
        <div
          class="inline-flex items-center rounded-lg bg-amber-a3 px-2 py-0.5 text-sm font-medium whitespace-nowrap text-amber-a11"
        >
          Unpaid
        </div>
      }
      @default {
        <div
          class="inline-flex items-center rounded-lg bg-neutral-a3 px-2 py-0.5 text-sm font-medium whitespace-nowrap text-neutral-a11"
        >
          Refunded
        </div>
      }
    }
  `,
})
export class OrderPaymentTag {
  // Inputs / Outputs
  readonly status = input.required<PaymentStatus>();
}

@Component({
  selector: 'order-fulfillment-tag',
  host: {
    class: 'flex',
  },
  template: `
    @switch (status()) {
      @case ('fulfilled') {
        <div
          class="inline-flex items-center rounded-lg bg-jade-a3 px-2 py-0.5 text-sm font-medium whitespace-nowrap text-jade-a11"
        >
          Fulfilled
        </div>
      }
      @case ('partially-fulfilled') {
        <div
          class="inline-flex items-center rounded-lg bg-blue-a3 px-2 py-0.5 text-sm font-medium whitespace-nowrap text-blue-a11"
        >
          Partially fulfilled
        </div>
      }
      @case ('unfulfilled') {
        <div
          class="inline-flex items-center rounded-lg bg-amber-a3 px-2 py-0.5 text-sm font-medium whitespace-nowrap text-amber-a11"
        >
          Unfulfilled
        </div>
      }
      @default {
        <div
          class="inline-flex items-center rounded-lg bg-neutral-a3 px-2 py-0.5 text-sm font-medium whitespace-nowrap text-neutral-a11"
        >
          Returned
        </div>
      }
    }
  `,
})
export class OrderFulfillmentTag {
  // Inputs / Outputs
  readonly status = input.required<FulfillmentStatus>();
}
