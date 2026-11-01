import { Component, computed, input } from '@angular/core';
import {
  STATUSES,
  TicketStatus,
} from '@/app/domains/admin/modules/tickets/data/tickets';

@Component({
  selector: 'ticket-status-pill',
  host: {
    class: 'flex shrink-0 items-center gap-x-1.5',
  },
  template: `
    <div
      class="size-1.5 rounded-full"
      [class]="statusItem().color"
    ></div>
    {{ statusItem().label }}
  `,
})
export class TicketStatusPill {
  // Inputs / Outputs
  readonly status = input.required<TicketStatus>();

  // Computed state
  private statusItem = computed(() =>
    STATUSES.find((item) => item.id === this.status())!
  );
}
