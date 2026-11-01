import { Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import SettingsLayout from '@/app/domains/admin/modules/settings/layout';

@Component({
  selector: 'settings-eyebrow',
  imports: [MatButton, MatIcon],
  host: {
    class: 'contents',
  },
  template: `
    @if (layout.isNarrow()) {
      <button
        matButton
        class="tertiary tiny -ms-1.5 w-fit"
        (click)="layout.toggle()"
      >
        <mat-icon svgIcon="panel-left" />
        Settings
      </button>
    }
  `,
})
export class SettingsEyebrow {
  // Dependencies
  private layout = inject(SettingsLayout);
}
