import { Component, computed, input } from '@angular/core';
import {
  HelpArticleStatus,
  STATUSES,
} from '@/app/domains/admin/modules/help-center/data/help-center';

@Component({
  selector: 'article-status-pill',
  host: {
    class:
      'inline-flex items-center rounded-full border px-2 py-px text-xs font-medium whitespace-nowrap',
    '[class]': 'statusItem().badge',
  },
  template: `{{ statusItem().label }}`,
})
export class ArticleStatusPill {
  // Inputs / Outputs
  readonly status = input.required<HelpArticleStatus>();

  // Computed state
  private statusItem = computed(() =>
    STATUSES.find((item) => item.id === this.status())!
  );
}
