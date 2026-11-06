import { computed, effect, inject, Injectable, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { catchError, filter, map, Observable, of, switchMap, tap } from 'rxjs';
import { Auth } from '@core/mpx-auth';
import { LocalStorage } from '@core/mpx-local-storage';
import { MorphusApplication } from '@morphus/entities/application';
import { Workspace } from '@morphus/entities/workspace';
import { WorkspaceApplication } from '@morphus/entities/workspace-application';
import { Menu } from '@security/entities/menu';
import { CorporationSummary } from '@security/entities/session';
import { ApplicationService } from './application.service';
import { MenuService } from './menu.service';
import { WorkspaceApplicationService } from './workspace-application.service';
import { WorkspaceService } from './workspace.service';

const ACTIVE_WORKSPACE_STORAGE_KEY = 'morphus:activeWorkspaceId';
const ACTIVE_APPLICATION_STORAGE_KEY = 'morphus:activeApplicationId';
const TRIAL_USED_STORAGE_KEY = 'morphus:hasUsedOrActiveTrial';
const PROVISIONED_WORKSPACE_APPS_KEY = 'morphus:provisionedWorkspaceApps';
const DEFAULT_TRIAL_DAYS = 14;
const INVISIBLE_APPLICATION_NAMES = new Set(['SEGURANÇA', 'SEGURANCA', 'SECURITY', 'WEBSITE']);
const SYSTEM_CORE_APPLICATION_NAMES = new Set([
  'MORPHUS',
  'SEGURANÇA',
  'SEGURANCA',
  'SECURITY',
  'WEBSITE',
]);

const FALLBACK_ECOSYSTEM_CATALOG: MorphusApplication[] = [
  {
    id: 'catalog-kalupa',
    key: 'KALUPA',
    name: 'Kalupa Automação',
    icon: 'workflow',
    color: 'amber',
    system: false,
    inactive: false,
    description:
      'Orquestração inteligente de documentos, captura por IA e entrega invisível na pasta local.',
  },
  {
    id: 'catalog-morphus-crm',
    key: 'MORPHUS_CRM',
    name: 'Morphus CRM',
    icon: 'users',
    color: 'indigo',
    system: false,
    inactive: false,
    description:
      'Gestão completa de funil comercial, carteira de clientes, propostas e relacionamento.',
  },
  {
    id: 'catalog-morphus-flow',
    key: 'MORPHUS_FLOW',
    name: 'Morphus Flow',
    icon: 'workflow',
    color: 'violet',
    system: false,
    inactive: false,
    description:
      'Motor visual de workflows configuráveis, aprovações por alçada e automação entre departamentos.',
  },
  {
    id: 'catalog-morphus-mail',
    key: 'MORPHUS_MAIL',
    name: 'Morphus Mail',
    icon: 'mail',
    color: 'jade',
    system: false,
    inactive: false,
    description:
      'Disparo de e-mails transacionais de alta entregabilidade, templates HTML e domínios verificados.',
  },
  {
    id: 'catalog-morphus-financeiro',
    key: 'MORPHUS_FINANCE',
    name: 'Morphus Financeiro',
    icon: 'wallet',
    color: 'jade',
    system: false,
    inactive: false,
    description:
      'Contas a pagar e receber, entrada de notas fiscais, conciliação bancária e fluxo de caixa.',
  },
];

export interface ApplicationTrialInfo {
  hasStartedTrial: boolean;
  trialUsed: boolean;
  isInTrial: boolean;
  hasCompletedTrial: boolean;
  trialDays: number;
  remainingDays: number;
  badgeLabel: string;
  topbarLabel: string;
  detailLabel: string;
}

@Injectable({
  providedIn: 'root',
})
export class MorphusContextService {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly localStorage = inject(LocalStorage);
  private readonly workspaceService = inject(WorkspaceService);
  private readonly applicationService = inject(ApplicationService);
  private readonly workspaceAppService = inject(WorkspaceApplicationService);
  private readonly menuService = inject(MenuService);

  private readonly workspacesState = signal<Workspace[]>([]);
  private readonly catalogApplicationsState = signal<MorphusApplication[]>([]);
  private readonly activeWorkspaceIdState = signal<string | null>(
    this.localStorage.getItem(ACTIVE_WORKSPACE_STORAGE_KEY),
  );
  private readonly activeApplicationIdState = signal<string | null>(
    this.localStorage.getItem(ACTIVE_APPLICATION_STORAGE_KEY),
  );
  private readonly menusState = signal<Menu[]>([]);
  private readonly loadingMenusState = signal<boolean>(false);
  private readonly switchingContextState = signal<boolean>(false);
  private readonly sidebarForceCollapsedState = signal<boolean>(false);
  readonly sidebarForceCollapsed = this.sidebarForceCollapsedState.asReadonly();

  setSidebarForceCollapsed(collapsed: boolean): void {
    this.sidebarForceCollapsedState.set(collapsed);
  }
  private readonly provisionedAppsState = signal<
    Record<string, { trialStartDate: string; trialDays: number; sharedWithWorkspaceId?: string | null }>
  >(this.loadProvisionedAppsFromStorage());

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

  readonly isAppRuntimeContext = computed(() => {
    const url = this.currentUrl() || '';
    return url.startsWith('/app/') || url.startsWith('/morphus/app/');
  });

  readonly workspaces = computed<Workspace[]>(() =>
    this.workspacesState().filter((w) => !w.inactive),
  );
  readonly menus = computed<Menu[]>(() => {
    if (this.isSecurityContext()) {
      return this.buildSecurityMenus();
    }
    if (this.isAppRuntimeContext()) {
      return this.buildOperationalAppMenus();
    }
    return this.menusState().length > 0 ? this.menusState() : this.buildMorphusMenus();
  });
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

  /**
   * Lista de aplicações operacionais vinculadas ao Workspace selecionado.
   * Nunca inclui Morphus, Segurança/Security ou Website para nenhum perfil.
   */
  readonly operationalApplications = computed<MorphusApplication[]>(() =>
    this.availableApplications().filter((app) => !this.isSystemCoreApplication(app)),
  );

  readonly activeOperationalApplication = computed<MorphusApplication | null>(() => {
    const apps = this.operationalApplications();
    if (!apps.length) {
      return null;
    }
    const savedId = this.activeApplicationIdState();
    return apps.find((a) => a.id === savedId) ?? apps.find((a) => a.default) ?? apps[0];
  });

  isSystemCoreApplication(app?: MorphusApplication | null): boolean {
    if (!app) {
      return false;
    }
    const nameUpper = (app.name ?? '').trim().toUpperCase();
    const keyUpper = (app.key ?? '').trim().toUpperCase();
    const prefixUpper = (app.prefix ?? '').trim().toUpperCase();
    return (
      Boolean(app.system) ||
      SYSTEM_CORE_APPLICATION_NAMES.has(nameUpper) ||
      SYSTEM_CORE_APPLICATION_NAMES.has(keyUpper) ||
      prefixUpper === 'MPX' ||
      prefixUpper === 'SEC' ||
      prefixUpper === 'WEB'
    );
  }

  getOperationalApplicationsForWorkspace(workspace: Workspace | null): MorphusApplication[] {
    return this.extractWorkspaceApplications(workspace).filter(
      (app) => !app.inactive && !this.isSystemCoreApplication(app),
    );
  }

  readonly catalogApplications = computed<MorphusApplication[]>(() => {
    const dbApps = this.catalogApplicationsState().filter(
      (app) =>
        !app.inactive &&
        !INVISIBLE_APPLICATION_NAMES.has((app.name ?? '').trim().toUpperCase()) &&
        !INVISIBLE_APPLICATION_NAMES.has((app.key ?? '').trim().toUpperCase()),
    );

    const existingNames = new Set(
      dbApps.map((a) => (a.name ?? '').trim().toUpperCase()).filter(Boolean),
    );

    const merged = [...dbApps];
    for (const fallback of FALLBACK_ECOSYSTEM_CATALOG) {
      const upper = (fallback.name ?? '').trim().toUpperCase();
      if (!existingNames.has(upper)) {
        merged.push(fallback);
        existingNames.add(upper);
      }
    }
    return merged;
  });

  readonly unlinkedApplications = computed<MorphusApplication[]>(() => {
    const activeIds = new Set(
      this.availableApplications()
        .map((a) => a.id)
        .filter((id): id is string => !!id),
    );
    const activeNames = new Set(
      this.availableApplications()
        .map((a) => (a.name ?? '').trim().toUpperCase())
        .filter(Boolean),
    );
    const provisionedMap = this.provisionedAppsState();
    const currentWorkspaceIds = new Set(
      this.workspaces()
        .map((w) => w.id)
        .filter((id): id is string => !!id),
    );

    return this.catalogApplications()
      .filter(
        (app) =>
          !!app.id &&
          !activeIds.has(app.id) &&
          !activeNames.has((app.name ?? '').trim().toUpperCase()),
      )
      .map((app) => {
        const appNameUpper = (app.name ?? '').trim().toUpperCase();
        const isAutoSeededCatalogApp =
          appNameUpper.includes('KALUPA') ||
          appNameUpper.includes('CRM') ||
          appNameUpper.includes('FINANCEIRO') ||
          appNameUpper.includes('FLOW') ||
          appNameUpper.includes('MAIL');
        const wasProvisionedInCurrentCorp = Object.keys(provisionedMap).some((k) => {
          const [wsId, name] = k.split(':');
          return currentWorkspaceIds.has(wsId) && name === appNameUpper;
        });
        const priorWa = (app.workspaceApplications ?? []).find(
          (wa) => wa.trialUsed || !!wa.trialStartDate,
        );
        return {
          ...app,
          trialStartDate: priorWa?.trialStartDate ?? (isAutoSeededCatalogApp ? null : app.trialStartDate ?? null),
          trialDays: priorWa?.trialDays ?? app.trialDays ?? DEFAULT_TRIAL_DAYS,
          trialUsed: Boolean(
            wasProvisionedInCurrentCorp ||
              priorWa?.trialUsed ||
              priorWa?.trialStartDate ||
              (!isAutoSeededCatalogApp && app.trialUsed),
          ),
        };
      });
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

  readonly activeApplicationTrial = computed<ApplicationTrialInfo>(() =>
    this.getApplicationTrialInfo(this.activeApplication()),
  );

  readonly hasUsedOrActiveTrial = computed<boolean>(() => {
    const apps = this.availableApplications();
    const hasTrialInWorkspace = apps.some((app) => {
      const info = this.getApplicationTrialInfo(app);
      return info.trialUsed || info.isInTrial || info.hasCompletedTrial;
    });
    if (hasTrialInWorkspace) {
      this.localStorage.setItem(TRIAL_USED_STORAGE_KEY, 'true');
      return true;
    }
    if (this.auth.isAuthenticated() && apps.length > 0) {
      return true;
    }
    return this.localStorage.getItem(TRIAL_USED_STORAGE_KEY) === 'true';
  });

  getApplicationTrialInfo(app?: MorphusApplication | null): ApplicationTrialInfo {
    const isBaseSystemApp =
      Boolean(app?.system) ||
      ['MORPHUS', 'SEGURANÇA', 'SEGURANCA', 'SECURITY', 'WEBSITE'].includes(
        (app?.name ?? '').trim().toUpperCase(),
      );
    const configuredDays =
      app?.trialDays && app.trialDays > 0 ? app.trialDays : DEFAULT_TRIAL_DAYS;
    const rawStart = app?.trialStartDate;
    const trialUsed = Boolean(app?.trialUsed || rawStart);

    if (isBaseSystemApp && !rawStart) {
      return {
        hasStartedTrial: false,
        trialUsed: false,
        isInTrial: false,
        hasCompletedTrial: false,
        trialDays: configuredDays,
        remainingDays: 0,
        badgeLabel: '',
        topbarLabel: '',
        detailLabel: 'Aplicação nativa da plataforma Morphus',
      };
    }

    if (!rawStart) {
      return {
        hasStartedTrial: false,
        trialUsed,
        isInTrial: false,
        hasCompletedTrial: false,
        trialDays: configuredDays,
        remainingDays: configuredDays,
        badgeLabel: `Teste grátis · ${configuredDays}d`,
        topbarLabel: `Teste grátis · ${configuredDays} dias`,
        detailLabel: `Disponível para teste grátis por ${configuredDays} dias`,
      };
    }

    const startDate = new Date(rawStart);
    if (Number.isNaN(startDate.getTime())) {
      return {
        hasStartedTrial: false,
        trialUsed,
        isInTrial: false,
        hasCompletedTrial: false,
        trialDays: configuredDays,
        remainingDays: configuredDays,
        badgeLabel: `Teste grátis · ${configuredDays}d`,
        topbarLabel: `Teste grátis · ${configuredDays} dias`,
        detailLabel: `Disponível para teste grátis por ${configuredDays} dias`,
      };
    }

    const endMs = startDate.getTime() + configuredDays * 24 * 60 * 60 * 1000;
    const diffMs = endMs - Date.now();
    const remainingDays = Math.max(0, Math.ceil(diffMs / (24 * 60 * 60 * 1000)));
    const isInTrial = remainingDays > 0;
    const hasCompletedTrial = remainingDays <= 0;

    return {
      hasStartedTrial: true,
      trialUsed: true,
      isInTrial,
      hasCompletedTrial,
      trialDays: configuredDays,
      remainingDays,
      badgeLabel: isInTrial ? `Teste · ${remainingDays}d` : 'Teste encerrado',
      topbarLabel: isInTrial
        ? `Período de teste · ${remainingDays} ${remainingDays === 1 ? 'dia restante' : 'dias restantes'}`
        : 'Período de teste concluído',
      detailLabel: isInTrial
        ? `Período de teste grátis (${configuredDays} dias): restam ${remainingDays} ${remainingDays === 1 ? 'dia' : 'dias'}`
        : `Período de teste grátis de ${configuredDays} dias já cumprido`,
    };
  }

  getWorkspacesWithApplication(applicationId?: string | null, excludeWorkspaceId?: string | null): Workspace[] {
    if (!applicationId) {
      return [];
    }
    const targetApp =
      this.catalogApplications().find((a) => a.id === applicationId) ??
      FALLBACK_ECOSYSTEM_CATALOG.find((a) => a.id === applicationId);
    const targetNameUpper = (targetApp?.name ?? '').trim().toUpperCase();

    return this.workspaces().filter((ws) => {
      if (ws.id === excludeWorkspaceId) {
        return false;
      }
      const wsApps = this.extractWorkspaceApplications(ws);
      return wsApps.some(
        (a) =>
          a.id === applicationId ||
          (!!targetNameUpper && (a.name ?? '').trim().toUpperCase() === targetNameUpper),
      );
    });
  }

  getSharedWorkspaceName(sharedWithWorkspaceId?: string | null): string | null {
    if (!sharedWithWorkspaceId) {
      return null;
    }
    return this.workspaces().find((w) => w.id === sharedWithWorkspaceId)?.name ?? null;
  }

  provisionApplicationInWorkspace(params: {
    applicationId: string;
    workspaceId: string;
    sharedWithWorkspaceId?: string | null;
  }): Observable<WorkspaceApplication> {
    const catalogApp =
      this.catalogApplications().find((a) => a.id === params.applicationId) ??
      FALLBACK_ECOSYSTEM_CATALOG.find((a) => a.id === params.applicationId);
    const appNameUpper = (catalogApp?.name ?? '').trim().toUpperCase();

    const existingDbApp = this.catalogApplicationsState().find(
      (a) =>
        a.id === params.applicationId ||
        (!!appNameUpper && (a.name ?? '').trim().toUpperCase() === appNameUpper),
    );

    const ensureAppId$: Observable<string> = existingDbApp?.id
      ? of(existingDbApp.id)
      : params.applicationId.startsWith('catalog-') && catalogApp
        ? this.applicationService
            .create({
              name: catalogApp.name,
              icon: catalogApp.icon || 'boxes',
              color: catalogApp.color || 'violet',
              description: catalogApp.description,
              system: false,
              inactive: false,
            })
            .pipe(
              map((created) => created?.id || params.applicationId),
              catchError(() => of(params.applicationId)),
            )
        : of(params.applicationId);

    return ensureAppId$.pipe(
      switchMap((resolvedAppId) => {
        if (resolvedAppId.startsWith('catalog-')) {
          return of({
            workspaceId: params.workspaceId,
            applicationId: resolvedAppId,
            trialStartDate: new Date().toISOString(),
            trialDays: DEFAULT_TRIAL_DAYS,
            trialUsed: true,
            sharedWithWorkspaceId: params.sharedWithWorkspaceId ?? null,
          } as WorkspaceApplication);
        }

        return this.workspaceAppService
          .startTrial({
            applicationId: resolvedAppId,
            workspaceId: params.workspaceId,
            sharedWithWorkspaceId: params.sharedWithWorkspaceId ?? null,
          })
          .pipe(
            catchError(() =>
              this.workspaceAppService
                .addToWorkspace({
                  workspaceId: params.workspaceId,
                  applicationId: resolvedAppId,
                  sharedWithWorkspaceId: params.sharedWithWorkspaceId ?? null,
                  trialUsed: true,
                })
                .pipe(
                  map(
                    () =>
                      ({
                        workspaceId: params.workspaceId,
                        applicationId: resolvedAppId,
                        trialStartDate: new Date().toISOString(),
                        trialDays: DEFAULT_TRIAL_DAYS,
                        trialUsed: true,
                        sharedWithWorkspaceId: params.sharedWithWorkspaceId ?? null,
                      }) as WorkspaceApplication,
                  ),
                  catchError(() =>
                    of({
                      workspaceId: params.workspaceId,
                      applicationId: resolvedAppId,
                      trialStartDate: new Date().toISOString(),
                      trialDays: DEFAULT_TRIAL_DAYS,
                      trialUsed: true,
                      sharedWithWorkspaceId: params.sharedWithWorkspaceId ?? null,
                    } as WorkspaceApplication),
                  ),
                ),
            ),
          );
      }),
      tap(() => {
        if (appNameUpper) {
          this.recordProvisionedApp(
            params.workspaceId,
            appNameUpper,
            params.sharedWithWorkspaceId ?? null,
          );
        }
        this.loadWorkspaces();
        this.loadCatalogApplications();
      }),
    );
  }

  private loadProvisionedAppsFromStorage(): Record<
    string,
    { trialStartDate: string; trialDays: number; sharedWithWorkspaceId?: string | null }
  > {
    try {
      const raw = this.localStorage.getItem(PROVISIONED_WORKSPACE_APPS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  private recordProvisionedApp(
    workspaceId: string,
    appNameUpper: string,
    sharedWithWorkspaceId: string | null,
  ): void {
    const key = `${workspaceId}:${appNameUpper}`;
    this.provisionedAppsState.update((prev) => {
      const next = {
        ...prev,
        [key]: {
          trialStartDate: prev[key]?.trialStartDate || new Date().toISOString(),
          trialDays: DEFAULT_TRIAL_DAYS,
          sharedWithWorkspaceId,
        },
      };
      this.localStorage.setItem(PROVISIONED_WORKSPACE_APPS_KEY, JSON.stringify(next));
      return next;
    });
  }

  constructor() {
    // Recarrega os Workspaces sempre que a Corporação logada mudar
    effect(() => {
      const corpId = this.auth.corporation()?.id;
      const isAuth = this.auth.isAuthenticated();

      untracked(() => {
        if (isAuth && corpId) {
          this.loadWorkspaces();
          this.loadCatalogApplications();
        } else {
          this.workspacesState.set([]);
          this.catalogApplicationsState.set([]);
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

  loadCatalogApplications(): void {
    this.applicationService.getList().subscribe({
      next: (apps) => {
        this.catalogApplicationsState.set(apps ?? []);
      },
      error: () => {
        this.catalogApplicationsState.set([]);
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

  selectWorkspace(workspace: Workspace, redirect = true): void {
    if (!workspace.id) {
      return;
    }

    this.activeWorkspaceIdState.set(workspace.id);
    this.localStorage.setItem(ACTIVE_WORKSPACE_STORAGE_KEY, workspace.id);

    const operationalApps = this.getOperationalApplicationsForWorkspace(workspace);
    const visibleApps = this.extractWorkspaceApplications(workspace).filter(
      (app) =>
        !app.inactive &&
        !INVISIBLE_APPLICATION_NAMES.has((app.name ?? '').trim().toUpperCase()) &&
        !INVISIBLE_APPLICATION_NAMES.has((app.key ?? '').trim().toUpperCase()),
    );
    const defaultApp =
      operationalApps.find((a) => a.default) ??
      operationalApps[0] ??
      visibleApps.find((a) => a.default) ??
      visibleApps.find((a) => a.name?.trim().toUpperCase() === 'MORPHUS') ??
      visibleApps[0];

    if (defaultApp?.id) {
      this.activeApplicationIdState.set(defaultApp.id);
      this.localStorage.setItem(ACTIVE_APPLICATION_STORAGE_KEY, defaultApp.id);
    } else {
      this.activeApplicationIdState.set(null);
      this.localStorage.removeItem(ACTIVE_APPLICATION_STORAGE_KEY);
    }

    if (redirect) {
      this.switchingContextState.set(true);
      this.reRenderApplicationView(defaultApp ?? null);
    }
  }

  selectApplication(application: MorphusApplication): void {
    if (!application.id) {
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
    if (menus?.length > 0 && menus.some((m) => m.label === 'Visão Geral')) {
      return [...menus]
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((m) => ({
          ...m,
          subMenus: [...(m.subMenus ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
        }));
    }
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
        icon: 'chart-no-axes-combined',
        order: 1,
        subMenus: [
          {
            id: 'morphus-item-dashboard',
            key: 'MORPHUS_ITEM_DASHBOARD',
            applicationId: '',
            label: 'Painel Principal',
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
        ],
      },
      {
        id: 'morphus-sec-platform',
        key: 'MORPHUS_SEC_PLATFORM',
        applicationId: '',
        label: 'Estrutura & Ambientes',
        icon: 'building-2',
        order: 2,
        subMenus: [
          {
            id: 'morphus-item-organization',
            key: 'MORPHUS_ITEM_ORGANIZATION',
            applicationId: '',
            label: 'Corporações',
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
            label: 'Aplicações',
            url: '/morphus/application',
            icon: 'boxes',
            order: 3,
          },
        ],
      },
      {
        id: 'morphus-sec-security',
        key: 'MORPHUS_SEC_SECURITY',
        applicationId: '',
        label: 'Segurança & Equipe',
        icon: 'shield-check',
        order: 3,
        subMenus: [
          {
            id: 'morphus-item-security-hub',
            key: 'MORPHUS_ITEM_SECURITY_HUB',
            applicationId: '',
            label: 'Painel de Segurança',
            url: '/security',
            icon: 'shield-check',
            order: 1,
          },
          {
            id: 'morphus-item-users',
            key: 'MORPHUS_ITEM_USERS',
            applicationId: '',
            label: 'Usuários',
            url: '/security/user',
            icon: 'users',
            order: 2,
          },
          {
            id: 'morphus-item-roles',
            key: 'MORPHUS_ITEM_ROLES',
            applicationId: '',
            label: 'Perfis de Acesso',
            url: '/security/role',
            icon: 'shield',
            order: 3,
          },
          {
            id: 'morphus-item-claims',
            key: 'MORPHUS_ITEM_CLAIMS',
            applicationId: '',
            label: 'Permissões',
            url: '/security/claim',
            icon: 'key-round',
            order: 4,
          },
          {
            id: 'morphus-item-modules',
            key: 'MORPHUS_ITEM_MODULES',
            applicationId: '',
            label: 'Módulos e Submódulos',
            url: '/security/module',
            icon: 'boxes',
            order: 5,
          },
        ],
      },
      {
        id: 'morphus-sec-settings',
        key: 'MORPHUS_SEC_SETTINGS',
        applicationId: '',
        label: 'Configurações',
        icon: 'settings',
        order: 4,
        subMenus: [
          {
            id: 'morphus-item-settings',
            key: 'MORPHUS_ITEM_SETTINGS',
            applicationId: '',
            label: 'Minha Conta',
            url: '/morphus/settings',
            icon: 'user-round',
            order: 1,
          },
          {
            id: 'morphus-item-billing',
            key: 'MORPHUS_ITEM_BILLING',
            applicationId: '',
            label: 'Planos e Assinatura',
            url: '/morphus/settings/billing',
            icon: 'receipt-text',
            order: 2,
          },
          {
            id: 'morphus-item-notifications',
            key: 'MORPHUS_ITEM_NOTIFICATIONS',
            applicationId: '',
            label: 'Notificações',
            url: '/morphus/settings/notifications',
            icon: 'bell',
            order: 3,
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
        icon: 'shield-check',
        order: 1,
        subMenus: [
          {
            id: 'sec-item-dashboard',
            key: 'SEC_ITEM_DASHBOARD',
            applicationId: '',
            label: 'Painel de Segurança',
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
        label: 'Controle de Acesso',
        icon: 'users',
        order: 2,
        subMenus: [
          {
            id: 'sec-item-user',
            key: 'SEC_ITEM_USER',
            applicationId: '',
            label: 'Usuários',
            url: '/security/user',
            icon: 'users',
            order: 1,
          },
          {
            id: 'sec-item-role',
            key: 'SEC_ITEM_ROLE',
            applicationId: '',
            label: 'Perfis (Roles)',
            url: '/security/role',
            icon: 'shield',
            order: 2,
          },
          {
            id: 'sec-item-claim',
            key: 'SEC_ITEM_CLAIM',
            applicationId: '',
            label: 'Permissões (Claims)',
            url: '/security/claim',
            icon: 'key-round',
            order: 3,
          },
          {
            id: 'sec-item-user-role',
            key: 'SEC_ITEM_USER_ROLE',
            applicationId: '',
            label: 'Vincular Perfis e Permissões',
            url: '/security/user-role',
            icon: 'user-plus',
            order: 4,
          },
        ],
      },
      {
        id: 'sec-section-modules',
        key: 'SEC_SECTION_MODULES',
        applicationId: '',
        label: 'Estrutura de Módulos',
        icon: 'boxes',
        order: 3,
        subMenus: [
          {
            id: 'sec-item-module',
            key: 'SEC_ITEM_MODULE',
            applicationId: '',
            label: 'Módulos e Submódulos',
            url: '/security/module',
            icon: 'boxes',
            order: 1,
          },
          {
            id: 'sec-item-application',
            key: 'SEC_ITEM_APPLICATION',
            applicationId: '',
            label: 'Aplicações',
            url: '/morphus/application',
            icon: 'layout-grid',
            order: 2,
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
    const provisionedMap = this.provisionedAppsState();
    const wsId = workspace.id || '';

    const rawList: MorphusApplication[] = workspace.workspaceApplications?.length
      ? workspace.workspaceApplications
          .filter((wa) => !wa.inactive && !!wa.application)
          .map((wa) => {
            const nameUpper = (wa.application!.name ?? '').trim().toUpperCase();
            const localProv = provisionedMap[`${wsId}:${nameUpper}`];
            return {
              ...wa.application!,
              default: Boolean(wa.default || wa.application!.default),
              trialStartDate:
                localProv?.trialStartDate ??
                wa.trialStartDate ??
                wa.application!.trialStartDate ??
                null,
              trialDays:
                localProv?.trialDays ??
                wa.trialDays ??
                wa.application!.trialDays ??
                DEFAULT_TRIAL_DAYS,
              trialUsed: Boolean(
                localProv || wa.trialUsed || wa.trialStartDate || wa.application!.trialUsed,
              ),
              sharedWithWorkspaceId:
                localProv?.sharedWithWorkspaceId ??
                wa.sharedWithWorkspaceId ??
                wa.application!.sharedWithWorkspaceId ??
                null,
            };
          })
      : [...(workspace.applications ?? [])];

    const existingNames = new Set(
      rawList.map((a) => (a.name ?? '').trim().toUpperCase()).filter(Boolean),
    );

    for (const [key, prov] of Object.entries(provisionedMap)) {
      if (!key.startsWith(`${wsId}:`)) {
        continue;
      }
      const appNameUpper = key.substring(wsId.length + 1);
      if (existingNames.has(appNameUpper)) {
        continue;
      }
      const catalogMatch = this.catalogApplications().find(
        (c) => (c.name ?? '').trim().toUpperCase() === appNameUpper,
      );
      if (catalogMatch) {
        rawList.push({
          ...catalogMatch,
          trialStartDate: prov.trialStartDate,
          trialDays: prov.trialDays,
          trialUsed: true,
          sharedWithWorkspaceId: prov.sharedWithWorkspaceId ?? null,
        });
        existingNames.add(appNameUpper);
      }
    }

    return rawList;
  }

  private buildOperationalAppMenus(): Menu[] {
    const url = this.currentUrl() || '';
    const match = url.match(/^\/(?:morphus\/)?app\/([^/?#]+)/i);
    const urlKeyUpper = (match?.[1] || '').trim().toUpperCase();

    const app =
      this.operationalApplications().find(
        (a) =>
          (a.key ?? '').toUpperCase() === urlKeyUpper ||
          (a.prefix ?? '').toUpperCase() === urlKeyUpper,
      ) ??
      this.activeOperationalApplication() ??
      this.activeApplication();

    const appKey = app?.key || app?.prefix || match?.[1] || 'FIN';
    const modules = app?.applicationModules ?? [];

    if (!modules.length) {
      return [
        {
          id: 'app-sec-overview',
          key: 'APP_SEC_OVERVIEW',
          applicationId: app?.id || '',
          label: 'Visão Geral',
          icon: 'chart-no-axes-combined',
          order: 0,
          subMenus: [
            {
              id: 'app-item-dashboard',
              key: 'APP_ITEM_DASHBOARD',
              applicationId: app?.id || '',
              label: 'Dashboard',
              url: `/app/${appKey}/dashboard`,
              icon: 'chart-no-axes-combined',
              order: 1,
            },
          ],
        },
      ];
    }

    return [...modules]
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((mod, modIdx) => ({
        id: mod.id || `app-mod-${modIdx}`,
        key: mod.key || `APP_MOD_${modIdx}`,
        applicationId: app?.id || '',
        label: mod.label || mod.name,
        icon: mod.icon || 'layers',
        order: mod.order ?? modIdx,
        subMenus: [...(mod.applicationSubModules ?? [])]
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          .map((sm, smIdx) => {
            const slug = sm.routePattern || sm.key || 'dashboard';
            return {
              id: sm.id || `app-sub-${modIdx}-${smIdx}`,
              key: sm.key || `APP_SUB_${modIdx}_${smIdx}`,
              applicationId: app?.id || '',
              label: sm.label || sm.name,
              url: `/app/${appKey}/${slug}`,
              icon: sm.icon || mod.icon || 'file-text',
              order: sm.order ?? smIdx + 1,
            };
          }),
      }));
  }

  private resolveApplicationEntryRoute(application: MorphusApplication | null): string {
    if (!application) {
      return '/morphus/admin/dashboard';
    }
    const key = (application.key ?? 'MORPHUS').trim().toUpperCase();
    if (key === 'SECURITY') {
      return '/security';
    }
    if (!this.isSystemCoreApplication(application)) {
      const appKey = application.key || application.prefix || 'FIN';
      const allSubs = (application.applicationModules ?? []).flatMap(
        (m) => m.applicationSubModules ?? [],
      );
      const defSub =
        allSubs.find((s) => s.default) ??
        allSubs.find((s) => (s.routePattern ?? '').toLowerCase() === 'dashboard') ??
        allSubs[0];
      const entrySlug = defSub?.routePattern || defSub?.key || 'dashboard';
      return `/app/${appKey}/${entrySlug}`;
    }
    return '/morphus/admin/dashboard';
  }
}
