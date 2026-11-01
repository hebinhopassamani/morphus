import { Component, computed, inject } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { Theming } from '@/apps/core/theming';

@Component({
  imports: [MatButton, MatIconButton, MatIcon, RouterLink],
  selector: 'web-topbar',
  styleUrl: './topbar.component.css',
  templateUrl: './topbar.component.html',
})
export class WebTopBarComponent {
  private readonly theming = inject(Theming);
  protected readonly isDark = computed(() => this.theming.isDark());

  protected toggleScheme(): void {
    this.theming.scheme.set(this.isDark() ? 'light' : 'dark');
  }
}
