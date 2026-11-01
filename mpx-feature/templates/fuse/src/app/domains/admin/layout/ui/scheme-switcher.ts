import { Component, computed, inject } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { Theming } from '@/app/core/theming';

@Component({
  selector: 'scheme-switcher',
  imports: [MatIconButton, MatIcon],
  template: `
    <button
      matIconButton
      (click)="this.theming.scheme.set(isDark() ? 'light' : 'dark')"
    >
      <mat-icon [svgIcon]="theming.isDark() ? 'sun' : 'moon'" />
    </button>
  `,
})
export class SchemeSwitcher {
  // Dependencies
  private readonly theming = inject(Theming);

  // Computed State
  private readonly isDark = computed(() => this.theming.isDark());
}
