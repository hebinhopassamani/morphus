import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { Theming } from '@core/mpx-theming';
import { MorphusWorkspaceLayout, MpxTopBarComponent } from '@src/components/morphus/layout';
import {
  MorphusApplication,
  MorphusApplicationModuleRef,
  MorphusApplicationSubModuleRef,
} from '@morphus/entities/application';
import { ApplicationService } from '@morphus/services/application.service';
import { MorphusContextService } from '@morphus/services/morphus-context.service';
import { AppBuilderNavItem } from '@app-builder/entities';
import { AppBuilderSanitizerService } from '@app-builder/services';

@Component({
  selector: 'mpx-builder-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatButton,
    MatIcon,
    MorphusWorkspaceLayout,
    MpxTopBarComponent,
  ],
  host: {
    class: 'flex min-h-dvh w-full flex-auto flex-col',
  },
  templateUrl: './builder-shell.component.html',
  styleUrl: './builder-shell.component.scss',
})
export class AppBuilderShellComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sanitizer = inject(AppBuilderSanitizerService);
  private readonly applicationService = inject(ApplicationService);
  protected readonly context = inject(MorphusContextService);
  protected readonly theming = inject(Theming);

  private readonly paramMap = toSignal(this.route.paramMap);
  protected readonly fetchedApp = signal<MorphusApplication | null>(null);

  protected readonly appKey = computed<string>(() => this.paramMap()?.get('appKey') || '');

  protected readonly activeApp = computed<MorphusApplication | null>(() => {
    const keyUpper = this.appKey().trim().toUpperCase();
    const fetched = this.fetchedApp();
    if (
      fetched &&
      ((fetched.key ?? '').toUpperCase() === keyUpper ||
        (fetched.prefix ?? '').toUpperCase() === keyUpper)
    ) {
      return fetched;
    }

    return (
      this.context
        .availableApplications()
        .find(
          (a) =>
            (a.key ?? '').toUpperCase() === keyUpper ||
            (a.prefix ?? '').toUpperCase() === keyUpper,
        ) ?? fetched
    );
  });

  protected readonly layoutKey = computed<string>(() => {
    const raw = (this.activeApp()?.layoutKey || 'sidebar-default').trim().toLowerCase();
    return raw || 'sidebar-default';
  });

  protected readonly navItems = computed<AppBuilderNavItem[]>(() => {
    const app = this.activeApp();
    const key = app?.key || app?.prefix || this.appKey() || 'FIN';
    const modules: MorphusApplicationModuleRef[] = app?.applicationModules ?? [];
    const items: AppBuilderNavItem[] = [];

    for (const mod of modules) {
      const subs: MorphusApplicationSubModuleRef[] = mod.applicationSubModules ?? [];
      for (const sm of subs) {
        const slug = sm.routePattern || sm.key || 'dashboard';
        items.push({
          id: sm.id || `${mod.key}-${sm.key}`,
          moduleLabel: mod.label || mod.name,
          label: sm.label || sm.name,
          icon: sm.icon || mod.icon || 'file-text',
          url: `/app/${key}/${slug}`,
        });
      }
    }

    if (items.length === 0) {
      items.push({
        id: 'default-dashboard',
        moduleLabel: 'Visão Geral',
        label: 'Dashboard',
        icon: 'chart-no-axes-combined',
        url: `/app/${key}/dashboard`,
      });
    }

    return items;
  });

  protected readonly trustedCustomLayoutHtml = computed<SafeHtml>(() => {
    const raw = this.activeApp()?.customLayoutHtml || '';
    return this.sanitizer.toTrustedHtml(raw);
  });

  constructor() {
    effect(() => {
      const key = this.appKey().trim();
      if (!key) {
        return;
      }

      untracked(() => {
        this.applicationService.getByKey(key).subscribe({
          next: (app) => {
            this.fetchedApp.set(app ?? null);
          },
        });
      });
    });
  }

  protected goToPortal(): void {
    void this.router.navigateByUrl('/website/home');
  }

  protected goToAppStudio(): void {
    const appId = this.activeApp()?.id;
    if (appId) {
      void this.router.navigate(['/morphus/application', appId], {
        queryParams: { tab: 'pages' },
      });
      return;
    }
    void this.router.navigateByUrl('/morphus/application');
  }
}
