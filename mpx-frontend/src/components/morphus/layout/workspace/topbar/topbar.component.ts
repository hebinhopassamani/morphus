import { Component, computed, inject, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatPseudoCheckbox } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { Auth } from '@core/mpx-auth';
import { Scheme, Theming } from '@core/mpx-theming';
import { THEME_PRESETS } from '@morphus/pages/settings/data/preferences';

@Component({
  imports: [
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MatPseudoCheckbox,
    RouterLink,
  ],
  selector: 'mpx-topbar',
  templateUrl: './topbar.component.html',
})
export class MpxTopBarComponent {
  readonly sidebarOpened = input<boolean>(true);
  readonly menuToggle = output<void>();

  protected readonly auth = inject(Auth);
  protected readonly theming = inject(Theming);

  protected readonly isDark = computed(() => this.theming.isDark());
  protected readonly themePresets = THEME_PRESETS;
  protected readonly selectedPreset = computed(
    () =>
      THEME_PRESETS.find(
        (preset) =>
          preset.primary.value.toLowerCase() ===
          this.theming.theme().primary.toLowerCase(),
      ) ?? THEME_PRESETS[0],
  );

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

  protected readonly schemes: { label: string; value: Scheme }[] = [
    { label: 'Claro (Light)', value: 'light' },
    { label: 'Escuro (Dark)', value: 'dark' },
    { label: 'Automático (System)', value: 'system' },
  ];

  protected toggleScheme(): void {
    this.theming.scheme.set(this.isDark() ? 'light' : 'dark');
  }

  protected updateScheme(scheme: Scheme): void {
    this.theming.scheme.set(scheme);
  }

  protected setPreset(preset: (typeof THEME_PRESETS)[number]): void {
    this.theming.theme.update((theme) => ({
      ...theme,
      primary: preset.primary.value,
      neutral: preset.neutral.value,
    }));
  }

  protected toggleDarkSidebar(): void {
    this.theming.sidebarScheme.set(
      this.theming.sidebarScheme() === 'dark' ? 'light' : 'dark',
    );
  }
}
