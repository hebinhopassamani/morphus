import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  MorphusApplication,
  MorphusApplicationModuleRef,
  MorphusApplicationSubModuleRef,
} from '@morphus/entities/application';
import { ApplicationService } from '@morphus/services/application.service';
import { MorphusContextService } from '@morphus/services/morphus-context.service';
import { AppBuilderMatchedPage } from '@app-builder/entities';
import { AppBuilderSanitizerService } from '@app-builder/services';

@Component({
  selector: 'mpx-builder-page',
  standalone: true,
  imports: [],
  host: {
    class: 'flex flex-auto flex-col p-6 lg:p-8',
  },
  templateUrl: './builder-page.component.html',
  styleUrl: './builder-page.component.scss',
})
export class AppBuilderPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sanitizer = inject(AppBuilderSanitizerService);
  private readonly applicationService = inject(ApplicationService);
  private readonly context = inject(MorphusContextService);

  private readonly paramMap = toSignal(this.route.paramMap);
  private readonly urlSegments = toSignal(this.route.url, { initialValue: [] });

  protected readonly isLoading = signal<boolean>(false);
  protected readonly fetchedApp = signal<MorphusApplication | null>(null);

  protected readonly appKey = computed<string>(() => {
    const own = this.paramMap()?.get('appKey');
    if (own) {
      return own;
    }
    return this.route.parent?.snapshot.paramMap.get('appKey') || '';
  });

  protected readonly subPath = computed<string>(() => {
    const segs = this.urlSegments() || [];
    return segs
      .map((s) => s.path)
      .filter(Boolean)
      .join('/');
  });

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

    const fromContext = this.context
      .availableApplications()
      .find(
        (a) =>
          (a.key ?? '').toUpperCase() === keyUpper ||
          (a.prefix ?? '').toUpperCase() === keyUpper,
      );

    return fromContext ?? fetched;
  });

  protected readonly matchedPage = computed<AppBuilderMatchedPage | null>(() => {
    const app = this.activeApp();
    if (!app?.applicationModules?.length) {
      return null;
    }

    const rawPath = this.subPath().trim();
    const allItems: { module: MorphusApplicationModuleRef; subModule: MorphusApplicationSubModuleRef }[] = [];

    for (const mod of app.applicationModules) {
      for (const sm of mod.applicationSubModules ?? []) {
        allItems.push({ module: mod, subModule: sm });
      }
    }

    if (allItems.length === 0) {
      return null;
    }

    if (!rawPath) {
      const def =
        allItems.find((x) => x.subModule.default) ??
        allItems.find((x) => (x.subModule.routePattern ?? '').toLowerCase() === 'dashboard') ??
        allItems[0];
      return { ...def, params: {} };
    }

    for (const item of allItems) {
      const pattern = (item.subModule.routePattern || item.subModule.key || '').trim();
      const matchParams = this.matchRoutePattern(pattern, rawPath);
      if (matchParams !== null) {
        return { ...item, params: matchParams };
      }
      if ((item.subModule.key ?? '').toUpperCase() === rawPath.toUpperCase()) {
        return { ...item, params: {} };
      }
    }

    return { ...allItems[0], params: {} };
  });

  protected readonly trustedHtml = computed<SafeHtml>(() => {
    const page = this.matchedPage();
    const rawHtml = page?.subModule.htmlContent || '';
    return this.sanitizer.toTrustedHtml(rawHtml);
  });

  constructor() {
    effect(() => {
      const key = this.appKey().trim();
      if (!key) {
        return;
      }

      untracked(() => {
        this.isLoading.set(true);
        this.applicationService.getByKey(key).subscribe({
          next: (app) => {
            this.fetchedApp.set(app ?? null);
            this.isLoading.set(false);

            if (app && !this.subPath()) {
              const allSubs = (app.applicationModules ?? []).flatMap(
                (m) => m.applicationSubModules ?? [],
              );
              const defSub =
                allSubs.find((s) => s.default) ??
                allSubs.find((s) => (s.routePattern ?? '').toLowerCase() === 'dashboard') ??
                allSubs[0];
              const targetSlug = defSub?.routePattern || defSub?.key || 'dashboard';
              void this.router.navigateByUrl(`/app/${app.key || key}/${targetSlug}`, {
                replaceUrl: true,
              });
            }
          },
          error: () => {
            this.isLoading.set(false);
          },
        });
      });
    });
  }

  private matchRoutePattern(pattern: string, actualPath: string): Record<string, string> | null {
    const cleanPattern = pattern.replace(/^\/+|\/+$/g, '');
    const cleanActual = actualPath.replace(/^\/+|\/+$/g, '');
    if (!cleanPattern) {
      return null;
    }

    const patternParts = cleanPattern.split('/');
    const actualParts = cleanActual.split('/');
    if (patternParts.length !== actualParts.length) {
      return null;
    }

    const params: Record<string, string> = {};
    for (let i = 0; i < patternParts.length; i++) {
      const p = patternParts[i];
      const a = actualParts[i];
      if (p.startsWith(':')) {
        params[p.substring(1)] = decodeURIComponent(a);
      } else if (p.toLowerCase() !== a.toLowerCase()) {
        return null;
      }
    }
    return params;
  }
}
