import { Component, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { Segment } from '@/app/domains/admin/modules/customers/data/customers';

@Component({
  selector: 'customer-segment-pill',
  imports: [MatIcon],
  host: {
    class: 'flex',
  },
  template: `
    <div class="inline-flex items-center gap-x-1.5 text-sm leading-5">
      @switch (segment()) {
        @case ('new') {
          <mat-icon
            class="size-4 shrink-0 text-blue-a10"
            svgIcon="sparkles"
          />
          <div>New</div>
        }
        @case ('vip') {
          <mat-icon
            class="size-4 shrink-0 text-amber-a10"
            svgIcon="crown"
          />
          <div>VIP</div>
        }
        @case ('at-risk') {
          <mat-icon
            class="size-4 shrink-0 text-red-a10"
            svgIcon="circle-alert"
          />
          <div>At risk</div>
        }
        @default {
          <mat-icon
            class="size-4 shrink-0 text-jade-a10"
            svgIcon="repeat"
          />
          <div>Returning</div>
        }
      }
    </div>
  `,
})
export class CustomerSegmentPill {
  // Inputs / Outputs
  readonly segment = input.required<Segment>();
}
