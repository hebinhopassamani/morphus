import { Component, computed, inject, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatPseudoCheckbox } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { Auth } from '@core/mpx-auth';
import { Scheme, Theming } from '@core/mpx-theming';
import { MpxQuickSettingsComponent } from '@morphus/layout/topbar/quick-settings.component';

@Component({
  imports: [
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    MatTooltipModule,
    MatPseudoCheckbox,
    RouterLink,
    MpxQuickSettingsComponent,
  ],
  selector: 'mpx-topbar',
  styleUrl: './topbar.component.css',
  templateUrl: './topbar.component.html',
})
export class MpxTopBarComponent {
  readonly menuToggle = output<void>();

  protected readonly auth = inject(Auth);
  protected readonly theming = inject(Theming);

  protected readonly isDark = computed(() => this.theming.isDark());

  protected readonly userInitials = computed(() => {
    const name = this.auth.user()?.name?.trim();
    if (!name) {
      return 'MP';
    }
    const parts = name.split(/\s+/);
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  });

  protected readonly schemes: { label: string; value: Scheme }[] = [
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
    { label: 'System', value: 'system' },
  ];

  protected toggleScheme(): void {
    this.theming.scheme.set(this.isDark() ? 'light' : 'dark');
  }

  protected updateScheme(scheme: Scheme): void {
    this.theming.scheme.set(scheme);
  }
}
