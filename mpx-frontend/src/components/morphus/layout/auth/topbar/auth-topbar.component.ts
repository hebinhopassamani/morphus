import { Component, computed, inject } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { RouterLink } from '@angular/router';
import { Auth } from '@core/mpx-auth';
import { Theming } from '@core/mpx-theming';

@Component({
  imports: [
    MatIconButton,
    MatIcon,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    MatDivider,
    RouterLink,
  ],
  selector: 'sec-topbar',
  templateUrl: './auth-topbar.component.html',
})
export class SecTopBarComponent {
  protected readonly auth = inject(Auth);
  private readonly theming = inject(Theming);
  protected readonly isDark = computed(() => this.theming.isDark());

  protected readonly userInitials = computed(() => {
    const name = this.auth.user()?.name?.trim() || this.auth.user()?.email?.trim();
    if (!name) {
      return 'MP';
    }
    const parts = name.split(/\s+/);
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  });

  protected toggleScheme() {
    this.theming.scheme.set(this.isDark() ? 'light' : 'dark');
  }
}
