import { Component, input } from '@angular/core';
import { InvoiceStatus } from '@/app/domains/admin/modules/invoices/data/invoices';

@Component({
  selector: 'invoice-status-tag',
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
      @case ('open') {
        <div
          class="inline-flex items-center rounded-lg bg-amber-a3 px-2 py-0.5 text-sm font-medium whitespace-nowrap text-amber-a11"
        >
          Open
        </div>
      }
      @case ('overdue') {
        <div
          class="inline-flex items-center rounded-lg bg-red-a3 px-2 py-0.5 text-sm font-medium whitespace-nowrap text-red-a11"
        >
          Overdue
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
export class InvoiceStatusTag {
  // Inputs / Outputs
  readonly status = input.required<InvoiceStatus>();
}
