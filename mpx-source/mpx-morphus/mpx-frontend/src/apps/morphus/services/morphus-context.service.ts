import { computed, effect, inject, Service, signal, untracked } from '@angular/core';
import { Auth } from '@/apps/core/auth';
import { LocalStorage } from '@/apps/core/local-storage';
import { MorphusApplication } from '@morphus/entities/application';
import { Workspace } from '@morphus/entities/workspace';
import { Menu } from '@security/entities/Menu';
import { MenuService } from './menu.service';
import { WorkspaceService } from './workspace.service';

const ACTIVE_WORKSPACE_STORAGE_KEY = 'morphus:activeWorkspaceId';
const ACTIVE_APPLICATION_STORAGE_KEY = 'morphus:activeApplicationId';

@Service()
export class MorphusContextService {
  private readonly auth = inject(Auth);
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

  readonly workspaces = this.workspacesState.asReadonly();
  readonly menus = this.menusState.asReadonly();
  readonly isLoadingMenus = this.loadingMenusState.asReadonly();

  readonly activeWorkspace = computed<Workspace | null>(() => {
    const list = this.workspacesState();
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
    return this.activeWorkspace()?.applications ?? [];
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

  selectWorkspace(workspace: Workspace): void {
    if (!workspace.id) {
      return;
    }
    this.activeWorkspaceIdState.set(workspace.id);
    this.localStorage.setItem(ACTIVE_WORKSPACE_STORAGE_KEY, workspace.id);

    // Seleciona a primeira aplicação do novo workspace (preferindo MORPHUS se existir)
    const apps = workspace.applications ?? [];
    const defaultApp = apps.find((a) => a.key === 'MORPHUS') ?? apps[0];
    if (defaultApp?.id) {
      this.selectApplication(defaultApp);
    }
  }

  selectApplication(application: MorphusApplication): void {
    if (!application.id) {
      return;
    }
    this.activeApplicationIdState.set(application.id);
    this.localStorage.setItem(ACTIVE_APPLICATION_STORAGE_KEY, application.id);
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
}
