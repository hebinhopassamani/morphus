import { Component, computed, inject, input } from '@angular/core';
import {
  BucketId,
  TicketsService,
} from '@/app/domains/admin/modules/tickets/data/tickets';

@Component({
  selector: 'ticket-buckets',
  host: {
    class: 'flex flex-wrap gap-1.5',
  },
  template: `
    @for (bucket of tags(); track bucket.id) {
      <div
        class="inline-flex items-center rounded-full border px-2 py-px text-xs font-medium whitespace-nowrap"
        [class]="bucket.tagClass"
      >
        {{ bucket.name }}
      </div>
    }
  `,
})
export class TicketBuckets {
  // Dependencies
  private ticketsService = inject(TicketsService);

  // Inputs / Outputs
  readonly buckets = input.required<BucketId[]>();

  // Computed state
  private tags = computed(() =>
    this.ticketsService
      .buckets()
      .filter((bucket) => this.buckets().includes(bucket.id))
  );
}
