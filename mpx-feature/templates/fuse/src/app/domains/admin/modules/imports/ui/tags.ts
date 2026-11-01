import { Component, input } from '@angular/core';
import { ImportStatus } from '@/app/domains/admin/modules/imports/data/imports';

@Component({
  selector: 'import-status-tag',
  host: {
    class: 'flex',
  },
  template: `
    @switch (status()) {
      @case ('completed') {
        <div
          class="inline-flex items-center rounded-lg bg-jade-a3 px-2 py-0.5 text-sm font-medium whitespace-nowrap text-jade-a11"
        >
          Completed
        </div>
      }
      @case ('partial') {
        <div
          class="inline-flex items-center rounded-lg bg-amber-a3 px-2 py-0.5 text-sm font-medium whitespace-nowrap text-amber-a11"
        >
          Partial
        </div>
      }
      @case ('failed') {
        <div
          class="inline-flex items-center rounded-lg bg-red-a3 px-2 py-0.5 text-sm font-medium whitespace-nowrap text-red-a11"
        >
          Failed
        </div>
      }
      @default {
        <div
          class="inline-flex items-center rounded-lg bg-blue-a3 px-2 py-0.5 text-sm font-medium whitespace-nowrap text-blue-a11"
        >
          Running
        </div>
      }
    }
  `,
})
export class ImportStatusTag {
  // Inputs / Outputs
  readonly status = input.required<ImportStatus>();
}
