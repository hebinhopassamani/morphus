import { Component, computed, input } from '@angular/core';
import { Marked } from 'marked';

const marked = new Marked();

@Component({
  selector: 'help-markdown',
  host: {
    class: 'prose block',
    '[innerHTML]': 'html()',
  },
  template: ``,
})
export class HelpMarkdown {
  // Inputs / Outputs
  readonly md = input.required<string>();

  // Computed state
  private html = computed(() => marked.parse(this.md(), { async: false }));
}
