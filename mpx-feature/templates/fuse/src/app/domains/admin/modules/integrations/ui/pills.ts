import { Component, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import {
  IntegrationLevel,
  IntegrationStatus,
} from '@/app/domains/admin/modules/integrations/data/integrations';

@Component({
  selector: 'integration-level-pill',
  imports: [MatIcon],
  host: {
    class: 'flex min-w-0',
  },
  template: `
    <div class="inline-flex min-w-0 items-center gap-x-1.5 text-sm leading-5">
      @switch (level()) {
        @case ('native') {
          <mat-icon
            class="size-4 shrink-0 text-primary-a10"
            svgIcon="badge-check"
          />
          <div class="truncate">Native</div>
        }
        @case ('verified') {
          <mat-icon
            class="size-4 shrink-0 text-jade-a10"
            svgIcon="shield-check"
          />
          <div class="truncate">Verified partner</div>
        }
        @default {
          <mat-icon
            class="size-4 shrink-0 text-neutral-a10"
            svgIcon="users-round"
          />
          <div class="truncate">Community</div>
        }
      }
    </div>
  `,
})
export class IntegrationLevelPill {
  // Inputs / Outputs
  readonly level = input.required<IntegrationLevel>();
}

@Component({
  selector: 'integration-status-pill',
  imports: [MatIcon],
  host: {
    class: 'flex min-w-0',
  },
  template: `
    <div class="inline-flex min-w-0 items-center gap-x-1.5 text-sm leading-5">
      @switch (status()) {
        @case ('connected') {
          <mat-icon
            class="size-4 shrink-0 text-jade-a10"
            svgIcon="circle-check"
          />
          <div class="truncate">Connected</div>
        }
        @case ('needs-attention') {
          <mat-icon
            class="size-4 shrink-0 text-amber-a10"
            svgIcon="triangle-alert"
          />
          <div class="truncate">Needs attention</div>
        }
        @default {
          <mat-icon
            class="size-4 shrink-0 text-neutral-a9"
            svgIcon="plug"
          />
          <div class="truncate">Not connected</div>
        }
      }
    </div>
  `,
})
export class IntegrationStatusPill {
  // Inputs / Outputs
  readonly status = input.required<IntegrationStatus>();
}
