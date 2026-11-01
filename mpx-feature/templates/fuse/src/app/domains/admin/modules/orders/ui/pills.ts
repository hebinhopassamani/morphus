import { Component, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import {
  Channel,
  LineItemStatus,
} from '@/app/domains/admin/modules/orders/data/orders';

@Component({
  selector: 'order-channel-pill',
  imports: [MatIcon],
  host: {
    class: 'flex',
  },
  template: `
    <div class="inline-flex items-center gap-x-1.5 text-sm leading-5">
      @switch (channel()) {
        @case ('pos') {
          <mat-icon
            class="size-4 shrink-0 text-neutral-a10"
            svgIcon="store"
          />
          <div>Point of sale</div>
        }
        @case ('marketplace') {
          <mat-icon
            class="size-4 shrink-0 text-neutral-a10"
            svgIcon="shopping-bag"
          />
          <div>Marketplace</div>
        }
        @default {
          <mat-icon
            class="size-4 shrink-0 text-neutral-a10"
            svgIcon="globe"
          />
          <div>Online store</div>
        }
      }
    </div>
  `,
})
export class OrderChannelPill {
  // Inputs / Outputs
  readonly channel = input.required<Channel>();
}

@Component({
  selector: 'order-item-status-pill',
  imports: [MatIcon],
  host: {
    class: 'flex',
  },
  template: `
    <div class="inline-flex items-center gap-x-1.5 text-sm leading-5">
      @switch (status()) {
        @case ('fulfilled') {
          <mat-icon
            class="size-4 shrink-0 text-jade-a10"
            svgIcon="circle-check"
          />
          <div>Fulfilled</div>
        }
        @case ('returned') {
          <mat-icon
            class="size-4 shrink-0 text-neutral-a9"
            svgIcon="undo-2"
          />
          <div>Returned</div>
        }
        @default {
          <mat-icon
            class="size-4 shrink-0 text-amber-a10"
            svgIcon="circle-dashed"
          />
          <div>Unfulfilled</div>
        }
      }
    </div>
  `,
})
export class OrderItemStatusPill {
  // Inputs / Outputs
  readonly status = input.required<LineItemStatus>();
}
