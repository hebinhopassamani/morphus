import { Component, inject, output } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { Theming } from '@/app/core/theming';

@Component({
  selector: 'settings-unsaved-changes',
  imports: [MatButton, MatIcon],
  host: {
    class: 'sticky bottom-8 self-center',
  },
  template: `
    <div
      class="relative isolate flex items-center gap-x-3 rounded-[calc(var(--theme-border-radius)*1.5)] border border-transparent bg-neutral-a4 py-2 ps-4 pe-2 text-neutral-12 before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:rounded-[calc(var(--theme-border-radius)*1.5-1px)] before:bg-white before:shadow-lg sm:gap-x-6 dark:bg-neutral-a5 dark:before:bg-neutral-3"
      [class.scheme-dark]="!theming.isDark()"
      [class.scheme-light]="theming.isDark()"
    >
      <div class="flex items-center gap-x-2">
        <mat-icon
          class="size-4 text-current"
          svgIcon="info"
        />
        <div class="font-medium whitespace-nowrap">
          Unsaved<span class="max-sm:hidden"> changes</span>
        </div>
      </div>

      <div class="flex items-center gap-x-1.5">
        <button
          matButton
          type="button"
          class="tertiary small"
          (click)="discard.emit()"
        >
          Discard
        </button>
        <button
          matButton
          type="submit"
          class="primary small"
        >
          Save
        </button>
      </div>
    </div>
  `,
})
export class SettingsUnsavedChanges {
  // Dependencies
  private theming = inject(Theming);

  // Inputs / Outputs
  readonly discard = output();
}
