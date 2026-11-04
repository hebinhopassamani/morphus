import { computed, effect, inject, Injectable, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';
import { Auth } from '@core/mpx-auth';
import { LocalStorage } from '@core/mpx-local-storage';
import { MorphusApplication } from '@morphus/entities/application';
import { Workspace } from '@morphus/entities/workspace';
import { Menu } from '@security/entities/menu';
import { CorporationSummary } from '@security/entities/session';
import { MenuService } from './menu.service';
import { WorkspaceService } from './workspace.service';

const ACTIVE_WORKSPACE_STORAGE_KEY = 'morphus:activeWorkspaceId';
const ACTIVE_APPLICATION_STORAGE_KEY = 'morphus:activeApplicationId';
const INVISIBLE_APPLICATION_NAMES = new Set(['SEGURANÇA', 'SEGURANCA', 'SECURITY', 'WEBSITE']);

@Injectable({
  providedIn: 'root',
})
export class MorphusContextService {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly localStorage = inject(LocalStorage);
  private readonly workspaceService = inject(WorkspaceService);
  private readonly menuService = inject(MenuService);

  private readonly workspacesState = signal<Workspace[]>([]);
  private readonly activeWorkspaceIdState = signal<string | null>(
    this.localStorage.getItem(ACTIVE_WORKSPACE_STORAGE_KEY),
  );
  private readonly activeApplicationIdState = signal<string | null>(
    this.localStorage.getItem(ACTIVE_APPLICATION_STORAGE_KEY),
  );
  private readonly menusState = signal<Menu[]>([]);
  private readonly loadingMenusState = signal<boolean>(false);
  private readonly switchingContextState = signal<boolean>(false);

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects || e.url),
    ),
    { initialValue: this.router.url },
  );

  readonly isSecurityContext = computed(() =>
    (this.currentUrl() || '').startsWith('/security'),
  );

  readonly workspaces = computed<Workspace[]>(() =>
    this.workspacesState().filter((w) => !w.inactive),
  );
  readonly menus = computed<Menu[]>(() =>
    this.isSecurityContext()
      ? this.buildSecurityMenus()
      : this.menusState().length > 0
        ? this.menusState()
        : this.buildMorphusMenus(),
  );
  readonly isLoadingMenus = this.loadingMenusState.asReadonly();
  readonly isSwitchingContext = this.switchingContextState.asReadonly();

  readonly activeWorkspace = computed<Workspace | null>(() => {
    const list = this.workspaces();
    if (!list.length) {
      return null;
    }
    const savedId = this.activeWorkspaceIdState();
    return (
      list.find((w) => w.id === savedId) ??
      list.find((w) => w.default) ??
      list.find((w) => w.system) ??
      list[0]
    );
  });

  readonly availableApplications = computed<MorphusApplication[]>(() => {
    const apps = this.extractWorkspaceApplications(this.activeWorkspace());
    return apps.filter(
      (app) =>
        !app.inactive &&
        !INVISIBLE_APPLICATION_NAMES.has((app.name ?? '').trim().toUpperCase()) &&
        !INVISIBLE_APPLICATION_NAMES.has((app.key ?? '').trim().toUpperCase()),
    );
  });

  readonly activeApplication = computed<MorphusApplication | null>(() => {
    const apps = this.availableApplications();
    if (!apps.length) {
      return null;
    }
    const savedId = this.activeApplicationIdState();
    return (
      apps.find((a) => a.id === savedId) ??
      apps.find((a) => a.name?.trim().toUpperCase() === 'MORPHUS') ??
      apps[0]
    );
  });

  constructor() {
    // Recarrega os Workspaces sempre que a Corporação logada mudar
    effect(() => {
      const corpId = this.auth.corporation()?.id;
      const isAuth = this.auth.isAuthenticated();

      untracked(() => {
        if (isAuth && corpId) {
          this.loadWorkspaces();
        } else {
          this.workspacesState.set([]);
          this.menusState.set([]);
        }
      });
    });

    // Recarrega os Menus sempre que a Aplicação ativa mudar
    effect(() => {
      const activeApp = this.activeApplication();

      untracked(() => {
        if (activeApp?.id) {
          this.loadMenusForApplication(activeApp.id);
        } else {
          this.menusState.set(this.buildFallbackMenus());
        }
      });
    });
  }

  isImageIcon(icon?: string | null): boolean {
    if (!icon) {
      return false;
    }
    const trimmed = icon.trim();
    return (
      trimmed.startsWith('http://') ||
      trimmed.startsWith('https://') ||
      trimmed.startsWith('/') ||
      trimmed.startsWith('data:image/')
    );
  }

  loadWorkspaces(): void {
    this.workspaceService.getList().subscribe({
      next: (workspaces) => {
        this.workspacesState.set(workspaces ?? []);
      },
      error: () => {
        this.workspacesState.set([]);
      },
    });
  }

  switchCorporation(corp: CorporationSummary): void {
    if (!corp.id || corp.id === this.auth.corporation()?.id) {
      return;
    }

    this.switchingContextState.set(true);
    this.activeWorkspaceIdState.set(null);
    this.activeApplicationIdState.set(null);
    this.localStorage.removeItem(ACTIVE_WORKSPACE_STORAGE_KEY);
    this.localStorage.removeItem(ACTIVE_APPLICATION_STORAGE_KEY);

    this.auth.switchCorporation(corp.id).subscribe({
      next: () => {
        void this.router.navigateByUrl('/morphus').finally(() => {
          this.switchingContextState.set(false);
        });
      },
      error: () => {
        this.switchingContextState.set(false);
      },
    });
  }

  selectWorkspace(workspace: Workspace): void {
    if (!workspace.id || workspace.id === this.activeWorkspace()?.id) {
      return;
    }

    this.switchingContextState.set(true);
    this.activeWorkspaceIdState.set(workspace.id);
    this.localStorage.setItem(ACTIVE_WORKSPACE_STORAGE_KEY, workspace.id);

    const visibleApps = this.extractWorkspaceApplications(workspace).filter(
      (app) =>
        !app.inactive &&
        !INVISIBLE_APPLICATION_NAMES.has((app.name ?? '').trim().toUpperCase()) &&
        !INVISIBLE_APPLICATION_NAMES.has((app.key ?? '').trim().toUpperCase()),
    );
    const defaultApp =
      visibleApps.find((a) => a.name?.trim().toUpperCase() === 'MORPHUS') ?? visibleApps[0];

    if (defaultApp?.id) {
      this.activeApplicationIdState.set(defaultApp.id);
      this.localStorage.setItem(ACTIVE_APPLICATION_STORAGE_KEY, defaultApp.id);
    } else {
      this.activeApplicationIdState.set(null);
      this.localStorage.removeItem(ACTIVE_APPLICATION_STORAGE_KEY);
    }

    this.reRenderApplicationView(defaultApp ?? null);
  }

  selectApplication(application: MorphusApplication): void {
    if (!application.id || application.id === this.activeApplication()?.id) {
      return;
    }

    this.switchingContextState.set(true);
    this.activeApplicationIdState.set(application.id);
    this.localStorage.setItem(ACTIVE_APPLICATION_STORAGE_KEY, application.id);

    this.reRenderApplicationView(application);
  }

  loadMenusForApplication(applicationId: string): void {
    this.loadingMenusState.set(true);
    this.menuService.getByApplicationId(applicationId).subscribe({
      next: (menus) => {
        const normalized = this.normalizeMenus(menus ?? []);
        this.menusState.set(normalized.length > 0 ? normalized : this.buildFallbackMenus());
        this.loadingMenusState.set(false);
      },
      error: () => {
        this.menusState.set(this.buildFallbackMenus());
        this.loadingMenusState.set(false);
      },
    });
  }

  private normalizeMenus(menus: Menu[]): Menu[] {
    return this.buildMorphusMenus();
  }

  private buildFallbackMenus(): Menu[] {
    return this.buildMorphusMenus();
  }

  private buildMorphusMenus(): Menu[] {
    return [
      {
        id: 'morphus-sec-overview',
        key: 'MORPHUS_SEC_OVERVIEW',
        applicationId: '',
        label: 'Visão Geral',
        order: 0,
        subMenus: [
          {
            id: 'morphus-item-dashboard',
            key: 'MORPHUS_ITEM_DASHBOARD',
            applicationId: '',
            label: 'Dashboard',
            url: '/morphus',
            icon: 'chart-no-axes-combined',
            order: 1,
          },
          {
            id: 'morphus-item-portal',
            key: 'MORPHUS_ITEM_PORTAL',
            applicationId: '',
            label: 'Portal da Corporação',
            url: '/website/home',
            icon: 'globe',
            order: 2,
          },
          {
            id: 'morphus-item-security-hub',
            key: 'MORPHUS_ITEM_SECURITY_HUB',
            applicationId: '',
            label: 'Morphus Security (Auth0)',
            url: '/security',
            icon: 'shield-check',
            order: 3,
          },
        ],
      },
      {
        id: 'morphus-sec-platform',
        key: 'MORPHUS_SEC_PLATFORM',
        applicationId: '',
        label: 'Organização & Apps',
        order: 1,
        subMenus: [
          {
            id: 'morphus-item-organization',
            key: 'MORPHUS_ITEM_ORGANIZATION',
            applicationId: '',
            label: 'Organization (Corporações)',
            url: '/morphus/corporation',
            icon: 'building-2',
            order: 1,
          },
          {
            id: 'morphus-item-workspaces',
            key: 'MORPHUS_ITEM_WORKSPACES',
            applicationId: '',
            label: 'Workspaces',
            url: '/morphus/workspace',
            icon: 'layers',
            order: 2,
          },
          {
            id: 'morphus-item-applications',
            key: 'MORPHUS_ITEM_APPLICATIONS',
            applicationId: '',
            label: 'Applications & My Apps',
            url: '/morphus/application',
            icon: 'boxes',
            order: 3,
          },
          {
            id: 'morphus-item-app-models',
            key: 'MORPHUS_ITEM_APP_MODELS',
            applicationId: '',
            label: 'Application Templates',
            url: '/morphus',
            icon: 'layout-grid',
            order: 4,
          },
          {
            id: 'morphus-item-forms-pages',
            key: 'MORPHUS_ITEM_FORMS_PAGES',
            applicationId: '',
            label: 'My Forms, Pages & Code Components',
            url: '/morphus',
            icon: 'file-text',
            order: 5,
          },
          {
            id: 'morphus-item-app-profiles',
            key: 'MORPHUS_ITEM_APP_PROFILES',
            applicationId: '',
            label: 'Application Profiles',
            url: '/morphus',
            icon: 'sliders-horizontal',
            order: 6,
          },
          {
            id: 'morphus-item-billing',
            key: 'MORPHUS_ITEM_BILLING',
            applicationId: '',
            label: 'Plans & Billing',
            url: '/morphus/settings/billing',
            icon: 'receipt-text',
            order: 7,
          },
        ],
      },
      {
        id: 'morphus-sec-automation',
        key: 'MORPHUS_SEC_AUTOMATION',
        applicationId: '',
        label: 'IA, Fluxos & Extensões',
        order: 2,
        subMenus: [
          {
            id: 'morphus-item-agents',
            key: 'MORPHUS_ITEM_AGENTS',
            applicationId: '',
            label: 'Agents (IA)',
            url: '/morphus',
            icon: 'sparkles',
            order: 1,
          },
          {
            id: 'morphus-item-workflows',
            key: 'MORPHUS_ITEM_WORKFLOWS',
            applicationId: '',
            label: 'Workflows (Morphus Flow)',
            url: '/morphus',
            icon: 'workflow',
            order: 2,
          },
          {
            id: 'morphus-item-plugins',
            key: 'MORPHUS_ITEM_PLUGINS',
            applicationId: '',
            label: 'Plugins & Integrations',
            url: '/morphus',
            icon: 'rocket',
            order: 3,
          },
          {
            id: 'morphus-item-webhooks',
            key: 'MORPHUS_ITEM_WEBHOOKS',
            applicationId: '',
            label: 'WebHooks',
            url: '/morphus',
            icon: 'link',
            order: 4,
          },
        ],
      },
      {
        id: 'morphus-sec-mail-obs',
        key: 'MORPHUS_SEC_MAIL_OBS',
        applicationId: '',
        label: 'Comunicação & Monitoramento',
        order: 3,
        subMenus: [
          {
            id: 'morphus-item-domains',
            key: 'MORPHUS_ITEM_DOMAINS',
            applicationId: '',
            label: 'Domains & Emails',
            url: '/morphus',
            icon: 'mail',
            order: 1,
          },
          {
            id: 'morphus-item-email-templates',
            key: 'MORPHUS_ITEM_EMAIL_TEMPLATES',
            applicationId: '',
            label: 'Email Templates & Settings',
            url: '/morphus',
            icon: 'inbox',
            order: 2,
          },
          {
            id: 'morphus-item-monitoring',
            key: 'MORPHUS_ITEM_MONITORING',
            applicationId: '',
            label: 'Monitoring & System Logs',
            url: '/morphus',
            icon: 'server',
            order: 3,
          },
          {
            id: 'morphus-item-settings',
            key: 'MORPHUS_ITEM_SETTINGS',
            applicationId: '',
            label: 'Settings',
            url: '/morphus/settings',
            icon: 'settings',
            order: 4,
          },
        ],
      },
    ];
  }

  private buildSecurityMenus(): Menu[] {
    return [
      {
        id: 'sec-section-overview',
        key: 'SEC_SECTION_OVERVIEW',
        applicationId: '',
        label: 'Visão Geral',
        order: 0,
        subMenus: [
          {
            id: 'sec-item-dashboard',
            key: 'SEC_ITEM_DASHBOARD',
            applicationId: '',
            label: 'Security Dashboard',
            url: '/security',
            icon: 'shield-check',
            order: 1,
          },
          {
            id: 'sec-item-morphus',
            key: 'SEC_ITEM_MORPHUS',
            applicationId: '',
            label: 'Voltar ao Morphus',
            url: '/morphus',
            icon: 'layout-grid',
            order: 2,
          },
          {
            id: 'sec-item-portal',
            key: 'SEC_ITEM_PORTAL',
            applicationId: '',
            label: 'Portal da Corporação',
            url: '/website/home',
            icon: 'globe',
            order: 3,
          },
        ],
      },
      {
        id: 'sec-section-identity',
        key: 'SEC_SECTION_IDENTITY',
        applicationId: '',
        label: 'Identidade & Controle de Acesso',
        order: 1,
        subMenus: [
          {
            id: 'sec-item-user',
            key: 'SEC_ITEM_USER',
            applicationId: '',
            label: 'Users (Usuários)',
            url: '/security/user',
            icon: 'users',
            order: 1,
          },
          {
            id: 'sec-item-role',
            key: 'SEC_ITEM_ROLE',
            applicationId: '',
            label: 'Roles (Perfis)',
            url: '/security/role',
            icon: 'shield',
            order: 2,
          },
          {
            id: 'sec-item-claim',
            key: 'SEC_ITEM_CLAIM',
            applicationId: '',
            label: 'Claims (Permissões)',
            url: '/security/claim',
            icon: 'key-round',
            order: 3,
          },
          {
            id: 'sec-item-module',
            key: 'SEC_ITEM_MODULE',
            applicationId: '',
            label: 'Modules (Módulos)',
            url: '/security/module',
            icon: 'boxes',
            order: 4,
          },
        ],
      },
      {
        id: 'sec-section-auth',
        key: 'SEC_SECTION_AUTH',
        applicationId: '',
        label: 'Autenticação & Proteção',
        order: 2,
        subMenus: [
          {
            id: 'sec-item-how-to-auth',
            key: 'SEC_ITEM_HOW_TO_AUTH',
            applicationId: '',
            label: 'How to Authenticate',
            url: '/security',
            icon: 'rocket',
            order: 1,
          },
          {
            id: 'sec-item-social-auth',
            key: 'SEC_ITEM_SOCIAL_AUTH',
            applicationId: '',
            label: 'Social Authentication',
            url: '/security',
            icon: 'globe',
            order: 2,
          },
          {
            id: 'sec-item-sso',
            key: 'SEC_ITEM_SSO',
            applicationId: '',
            label: 'SSO Integration',
            url: '/security',
            icon: 'building',
            order: 3,
          },
          {
            id: 'sec-item-mfa',
            key: 'SEC_ITEM_MFA',
            applicationId: '',
            label: 'Multi-Factor Auth (MFA)',
            url: '/security',
            icon: 'fingerprint-pattern',
            order: 4,
          },
          {
            id: 'sec-item-attack',
            key: 'SEC_ITEM_ATTACK',
            applicationId: '',
            label: 'Attack Protection',
            url: '/security',
            icon: 'shield',
            order: 5,
          },
        ],
      },
      {
        id: 'sec-section-monitoring',
        key: 'SEC_SECTION_MONITORING',
        applicationId: '',
        label: 'Observabilidade & Eventos',
        order: 3,
        subMenus: [
          {
            id: 'sec-item-monitoring',
            key: 'SEC_ITEM_MONITORING',
            applicationId: '',
            label: 'Monitoring',
            url: '/security',
            icon: 'chart-no-axes-combined',
            order: 1,
          },
          {
            id: 'sec-item-logs',
            key: 'SEC_ITEM_LOGS',
            applicationId: '',
            label: 'Security Logs',
            url: '/security',
            icon: 'file-text',
            order: 2,
          },
          {
            id: 'sec-item-webhooks',
            key: 'SEC_ITEM_WEBHOOKS',
            applicationId: '',
            label: 'Webhooks',
            url: '/security',
            icon: 'link',
            order: 3,
          },
        ],
      },
    ];
  }

  private reRenderApplicationView(application: MorphusApplication | null): void {
    const targetRoute = this.resolveApplicationEntryRoute(application);
    setTimeout(() => {
      void this.router.navigateByUrl(targetRoute).finally(() => {
        this.switchingContextState.set(false);
      });
    }, 0);
  }

  private extractWorkspaceApplications(workspace: Workspace | null): MorphusApplication[] {
    if (!workspace) {
      return [];
    }
    if (workspace.workspaceApplications?.length) {
      return workspace.workspaceApplications
        .filter((wa) => !wa.inactive && !!wa.application)
        .map((wa) => wa.application!);
    }
    return workspace.applications ?? [];
  }

  private resolveApplicationEntryRoute(application: MorphusApplication | null): string {
    const key = (application?.key ?? 'MORPHUS').trim().toUpperCase();
    if (key === 'SECURITY') {
      return '/security';
    }
    return '/morphus';
  }
}
