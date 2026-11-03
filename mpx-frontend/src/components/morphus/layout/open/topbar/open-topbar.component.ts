import { Component, computed, inject } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '@core/mpx-auth';
import { Theming } from '@core/mpx-theming';

@Component({
  imports: [
    MatButton,
    MatIconButton,
    MatIcon,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    MatDivider,
    RouterLink,
  ],
  selector: 'web-topbar',
  templateUrl: './open-topbar.component.html',
})
export class WebTopBarComponent {
  protected readonly auth = inject(Auth);
  private readonly router = inject(Router);
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

  protected toggleScheme(): void {
    this.theming.scheme.set(this.isDark() ? 'light' : 'dark');
  }

  protected navigateToSection(sectionId: string): void {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    void this.router.navigate(['/website'], { fragment: sectionId });
  }

  protected openSwitchCorporation(): void {
    const currentUrl = this.router.url.startsWith('/website/select-corporation')
      ? '/website'
      : this.router.url || '/website';
    this.auth.openCorporationSelector(currentUrl, 'website');
  }
}
