import { computed, effect, inject, Service, signal, untracked } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '@/apps/core/auth';
import { LocalStorage } from '@/apps/core/local-storage';
import { MorphusApplication } from '@morphus/entities/application';
import { Workspace } from '@morphus/entities/workspace';
import { Menu } from '@security/entities/Menu';
import { CorporationSummary } from '@security/entities/Session';
import { MenuService } from './menu.service';
import { WorkspaceService } from './workspace.service';

const ACTIVE_WORKSPACE_STORAGE_KEY = 'morphus:activeWorkspaceId';
const ACTIVE_APPLICATION_STORAGE_KEY = 'morphus:activeApplicationId';
const INVISIBLE_APPLICATION_KEYS = new Set(['SECURITY', 'WEBSITE']);

@Service()
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

  readonly workspaces = computed<Workspace[]>(() =>
    this.workspacesState().filter((w) => !w.inactive),
  );
  readonly menus = this.menusState.asReadonly();
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
      list.find((w) => w.key === 'MORPHUS_WORKSPACE') ??
      list[0]
    );
  });

  readonly availableApplications = computed<MorphusApplication[]>(() => {
    const apps = this.activeWorkspace()?.applications ?? [];
    return apps.filter(
      (app) =>
        !app.inactive &&
        !INVISIBLE_APPLICATION_KEYS.has((app.key ?? '').trim().toUpperCase()),
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
      apps.find((a) => a.key === 'MORPHUS') ??
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
          this.menusState.set([]);
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
        void this.router.navigateByUrl('/admin/corporation').finally(() => {
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

    const visibleApps = (workspace.applications ?? []).filter(
      (app) =>
        !app.inactive &&
        !INVISIBLE_APPLICATION_KEYS.has((app.key ?? '').trim().toUpperCase()),
    );
    const defaultApp =
      visibleApps.find((a) => a.key === 'MORPHUS') ?? visibleApps[0];

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
        this.menusState.set(menus ?? []);
        this.loadingMenusState.set(false);
      },
      error: () => {
        this.menusState.set([]);
        this.loadingMenusState.set(false);
      },
    });
  }

  private reRenderApplicationView(application: MorphusApplication | null): void {
    const targetRoute = this.resolveApplicationEntryRoute(application);
    setTimeout(() => {
      void this.router.navigateByUrl(targetRoute).finally(() => {
        this.switchingContextState.set(false);
      });
    }, 0);
  }

  private resolveApplicationEntryRoute(application: MorphusApplication | null): string {
    const key = (application?.key ?? 'MORPHUS').trim().toUpperCase();
    if (key === 'MORPHUS') {
      return '/admin/corporation';
    }
    return '/admin/corporation';
  }
}
