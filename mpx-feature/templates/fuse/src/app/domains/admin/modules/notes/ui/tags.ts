import { DatePipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import {
  NOTE_LABELS,
  NoteLabelId,
} from '@/app/domains/admin/modules/notes/data/notes';

@Component({
  selector: 'note-label-tags',
  imports: [DatePipe, MatIcon],
  host: {
    class: 'flex flex-wrap gap-1.5',
  },
  template: `
    @if (reminder(); as reminder) {
      <div
        class="inline-flex items-center gap-x-1.5 rounded-lg bg-neutral-a3 px-2 py-0.5 text-sm font-medium whitespace-nowrap text-neutral-a11"
      >
        <mat-icon
          class="size-3.5"
          svgIcon="bell"
        />
        {{ reminder | date: 'MMM d' }}
      </div>
    }
    @for (label of tags(); track label.id) {
      <div
        class="inline-flex items-center rounded-lg bg-neutral-a3 px-2 py-0.5 text-sm font-medium whitespace-nowrap text-neutral-a11"
      >
        {{ label.name }}
      </div>
    }
  `,
})
export class NoteLabelTags {
  // Inputs / Outputs
  readonly labels = input.required<NoteLabelId[]>();
  readonly reminder = input<string | null>(null);

  // Computed state
  private tags = computed(() =>
    NOTE_LABELS.filter((label) => this.labels().includes(label.id))
  );
}
