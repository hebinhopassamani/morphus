import { Component, computed, inject } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatPseudoCheckbox } from '@angular/material/core';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '@core/mpx-auth';
import { Scheme, Theming } from '@core/mpx-theming';
import { MorphusApplication } from '@morphus/entities/application';
import { Workspace } from '@morphus/entities/workspace';
import { THEME_PRESETS } from '@morphus/pages/settings/data/preferences';
import { MorphusContextService } from '@morphus/services/morphus-context.service';
import { CorporationSummary } from '@security/entities/session';

@Component({
  imports: [
    MatButton,
    MatIconButton,
    MatPseudoCheckbox,
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
  protected readonly context = inject(MorphusContextService);
  private readonly router = inject(Router);
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

  protected readonly schemes: { label: string; value: Scheme }[] = [
    { label: 'Claro (Light)', value: 'light' },
    { label: 'Escuro (Dark)', value: 'dark' },
    { label: 'Automático (System)', value: 'system' },
  ];

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

  protected readonly topbarOtherApplications = computed(() => {
    const activeId = this.context.activeOperationalApplication()?.id;
    return this.context.operationalApplications().filter((app) => app.id !== activeId);
  });

  protected readonly topbarOtherWorkspaces = computed(() => {
    const activeId = this.context.activeWorkspace()?.id;
    return this.context.workspaces().filter((ws) => ws.id !== activeId);
  });

  protected readonly topbarOtherCorporations = computed(() => {
    const activeId = this.auth.corporation()?.id;
    return this.auth.availableCorporations().filter((corp) => corp.id !== activeId);
  });

  protected selectTopbarApplication(app: MorphusApplication): void {
    this.context.selectApplication(app);
  }

  protected selectTopbarWorkspace(ws: Workspace): void {
    const isOnWebsite = (this.router.url || '').startsWith('/website');
    this.context.selectWorkspace(ws, !isOnWebsite);
  }

  protected selectTopbarCorporation(corp: CorporationSummary): void {
    if (corp.inactive || corp.id === this.auth.corporation()?.id) {
      return;
    }
    this.auth.switchCorporation(corp.id).subscribe({
      next: () => {
        this.context.loadWorkspaces();
      },
    });
  }

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
