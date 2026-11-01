import { Component } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'inbox-format-toolbar',
  imports: [MatIcon, MatIconButton, MatTooltip],
  host: {
    class: 'flex items-center gap-x-0.5',
  },
  template: `
    @for (tool of tools; track tool.icon) {
      <button
        matIconButton
        type="button"
        class="small"
        [matTooltip]="tool.label"
      >
        <mat-icon [svgIcon]="tool.icon" />
      </button>
    }
  `,
})
export class InboxFormatToolbar {
  // State
  private tools = [
    { label: 'Bold', icon: 'bold' },
    { label: 'Italic', icon: 'italic' },
    { label: 'Underline', icon: 'underline' },
    { label: 'Bulleted list', icon: 'list' },
    { label: 'Numbered list', icon: 'list-ordered' },
    { label: 'Link', icon: 'link' },
    { label: 'Attach file', icon: 'paperclip' },
  ];
}
