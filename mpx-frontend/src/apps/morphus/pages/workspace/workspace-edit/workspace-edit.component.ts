import { computed, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatIcon } from '@angular/material/icon';
import { MatError, MatFormField, MatInput, MatLabel, MatPrefix } from '@angular/material/input';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { MatTooltip } from '@angular/material/tooltip';
import { IMorphusEditComponent, MorphusEditComponent } from '@core/mpx-base';
import { MpxIconSelectorComponent } from '@src/components/morphus/icon-selector';
import { MorphusApplication } from '@morphus/entities/application';
import { Workspace } from '@morphus/entities/workspace';
import { WorkspaceApplication } from '@morphus/entities/workspace-application';
import { WorkspaceUser } from '@morphus/entities/workspace-user';
import { MorphusContextService } from '@morphus/services/morphus-context.service';
import { WorkspaceApplicationService } from '@morphus/services/workspace-application.service';
import { WorkspaceUserService } from '@morphus/services/workspace-user.service';
import { WorkspaceService } from '@morphus/services/workspace.service';
import { User } from '@security/entities/user';
import { WorkspaceValidator } from '../validators/workspace.validator';

@Component({
  selector: 'mpx-workspace-edit',
  standalone: true,
  imports: [
    FormsModule,
    MatButton,
    MatIconButton,
    MatCheckbox,
    MatIcon,
    MatFormField,
    MatLabel,
    MatInput,
    MatPrefix,
    MatError,
    MatTabGroup,
    MatTab,
    MatTooltip,
    MpxIconSelectorComponent,
  ],
  styleUrl: './workspace-edit.component.css',
  templateUrl: './workspace-edit.component.html',
})
export class WorkspaceEditComponent
  extends MorphusEditComponent<Workspace, WorkspaceValidator>
  implements IMorphusEditComponent, OnInit, OnDestroy
{
  private readonly workspaceService = inject(WorkspaceService);
  private readonly workspaceAppService = inject(WorkspaceApplicationService);
  private readonly workspaceUserService = inject(WorkspaceUserService);
  private readonly context = inject(MorphusContextService);

  protected readonly selectedTabIndex = signal<number>(0);

  // Estado N:N de Aplicações do Workspace
  protected readonly appsToRelate = signal<MorphusApplication[]>([]);
  protected readonly relatedApps = signal<WorkspaceApplication[]>([]);
  protected readonly searchAppToRelate = signal<string>('');
  protected readonly searchAppRelated = signal<string>('');
  protected readonly selectedAppToRelateIds = signal<Set<string>>(new Set());
  protected readonly selectedAppRelatedIds = signal<Set<string>>(new Set());

  // Modal de escolha de instância (Nova Instância Isolada vs. Compartilhada com Workspace Y)
  protected readonly pendingAppForInstanceModal = signal<MorphusApplication | null>(null);
  protected readonly otherWorkspacesForPendingApp = signal<Workspace[]>([]);
  protected readonly instanceMode = signal<'isolated' | 'shared'>('isolated');
  protected readonly selectedSharedWorkspaceId = signal<string | null>(null);

  protected readonly filteredAppsToRelate = computed(() => {
    const term = this.searchAppToRelate().toLowerCase().trim();
    const relatedSet = new Set(this.relatedApps().map((r) => r.applicationId));
    const list = this.appsToRelate().filter((a) => !!a.id && !relatedSet.has(a.id));
    if (!term) {
      return list;
    }
    return list.filter(
      (a) =>
        (a.name ?? '').toLowerCase().includes(term) ||
        (a.key ?? '').toLowerCase().includes(term) ||
        (a.description ?? '').toLowerCase().includes(term),
    );
  });

  protected readonly filteredRelatedApps = computed(() => {
    const term = this.searchAppRelated().toLowerCase().trim();
    const list = this.relatedApps();
    if (!term) {
      return list;
    }
    return list.filter(
      (r) =>
        (r.application?.name ?? '').toLowerCase().includes(term) ||
        (r.application?.key ?? '').toLowerCase().includes(term),
    );
  });

  // Estado N:N de Usuários do Workspace
  protected readonly usersToRelate = signal<User[]>([]);
  protected readonly relatedUsers = signal<WorkspaceUser[]>([]);
  protected readonly searchUserToRelate = signal<string>('');
  protected readonly searchUserRelated = signal<string>('');
  protected readonly selectedUserToRelateIds = signal<Set<string>>(new Set());
  protected readonly selectedUserRelatedIds = signal<Set<string>>(new Set());

  protected readonly filteredUsersToRelate = computed(() => {
    const term = this.searchUserToRelate().toLowerCase().trim();
    const relatedSet = new Set(this.relatedUsers().map((r) => r.userId));
    const list = this.usersToRelate().filter((u) => !!u.id && !relatedSet.has(u.id));
    if (!term) {
      return list;
    }
    return list.filter(
      (u) =>
        (u.name ?? '').toLowerCase().includes(term) ||
        (u.email ?? '').toLowerCase().includes(term),
    );
  });

  protected readonly filteredRelatedUsers = computed(() => {
    const term = this.searchUserRelated().toLowerCase().trim();
    const list = this.relatedUsers();
    if (!term) {
      return list;
    }
    return list.filter(
      (r) =>
        (r.user?.name ?? '').toLowerCase().includes(term) ||
        (r.user?.email ?? '').toLowerCase().includes(term),
    );
  });

  constructor() {
    super(WorkspaceValidator);
  }

  ngOnInit(): void {
    this.loadPrimaryKey();
    const tab = this.activatedRoute.snapshot.queryParamMap.get('tab');
    if (tab === 'applications') {
      this.selectedTabIndex.set(1);
    } else if (tab === 'users') {
      this.selectedTabIndex.set(2);
    }
    void this.loadEntity();
  }

  ngOnDestroy(): void {
    this.destroySubscriptions();
  }

  override loadPrimaryKey(): void {
    this.addPrimaryKey('id').loadPrimariKey(this.entity);
  }

  async loadEntity(): Promise<void> {
    if (this.isNew) {
      this.newEntity();
    } else {
      const currentId = this.entity().id;
      if (currentId) {
        const loaded = await firstValueFrom(this.workspaceService.getById(currentId));
        this.setEntity({
          ...loaded,
          icon: loaded.icon || 'layout-grid',
          default: Boolean(loaded.default),
        });
        await Promise.all([
          this.loadWorkspaceApplications(currentId),
          this.loadWorkspaceUsers(currentId),
        ]);
      }
      this.editEntity();
    }
  }

  async loadWorkspaceApplications(workspaceId?: string): Promise<void> {
    const wsId = workspaceId ?? this.entity().id;
    if (!wsId) {
      return;
    }
    const [toRelate, related] = await Promise.all([
      firstValueFrom(this.workspaceAppService.getEntitiesToRelate({ workspaceId: wsId })),
      firstValueFrom(this.workspaceAppService.getRelatedEntities({ workspaceId: wsId })),
    ]);
    const relatedIds = new Set((related ?? []).map((r) => r.applicationId));
    this.appsToRelate.set((toRelate ?? []).filter((a) => !!a.id && !relatedIds.has(a.id)));
    this.relatedApps.set(related ?? []);
    this.selectedAppToRelateIds.set(new Set());
    this.selectedAppRelatedIds.set(new Set());
  }

  async loadWorkspaceUsers(workspaceId?: string): Promise<void> {
    const wsId = workspaceId ?? this.entity().id;
    if (!wsId) {
      return;
    }
    const [toRelate, related] = await Promise.all([
      firstValueFrom(this.workspaceUserService.getEntitiesToRelate({ workspaceId: wsId })),
      firstValueFrom(this.workspaceUserService.getRelatedEntities({ workspaceId: wsId })),
    ]);
    const relatedIds = new Set((related ?? []).map((r) => r.userId));
    this.usersToRelate.set((toRelate ?? []).filter((u) => !!u.id && !relatedIds.has(u.id)));
    this.relatedUsers.set(related ?? []);
    this.selectedUserToRelateIds.set(new Set());
    this.selectedUserRelatedIds.set(new Set());
  }

  // =========================================================================
  // N:N Aplicações do Workspace (Multi-Seleção)
  // =========================================================================
  isAppToRelateSelected(appId?: string): boolean {
    return !!appId && this.selectedAppToRelateIds().has(appId);
  }

  toggleAppToRelate(appId?: string): void {
    if (!appId) {
      return;
    }
    this.selectedAppToRelateIds.update((curr) => {
      const next = new Set(curr);
      if (next.has(appId)) {
        next.delete(appId);
      } else {
        next.add(appId);
      }
      return next;
    });
  }

  areAllAppsToRelateSelected(): boolean {
    const visible = this.filteredAppsToRelate();
    return visible.length > 0 && visible.every((a) => !!a.id && this.selectedAppToRelateIds().has(a.id));
  }

  toggleSelectAllAppsToRelate(): void {
    const visible = this.filteredAppsToRelate();
    const allSelected = this.areAllAppsToRelateSelected();
    this.selectedAppToRelateIds.update((curr) => {
      const next = new Set(curr);
      for (const a of visible) {
        if (!a.id) {
          continue;
        }
        if (allSelected) {
          next.delete(a.id);
        } else {
          next.add(a.id);
        }
      }
      return next;
    });
  }

  isAppRelatedSelected(appId?: string): boolean {
    return !!appId && this.selectedAppRelatedIds().has(appId);
  }

  toggleAppRelated(rel: WorkspaceApplication): void {
    if (rel.system || !rel.applicationId) {
      return;
    }
    this.selectedAppRelatedIds.update((curr) => {
      const next = new Set(curr);
      if (next.has(rel.applicationId)) {
        next.delete(rel.applicationId);
      } else {
        next.add(rel.applicationId);
      }
      return next;
    });
  }

  areAllAppsRelatedSelected(): boolean {
    const removable = this.filteredRelatedApps().filter((r) => !r.system);
    return removable.length > 0 && removable.every((r) => this.selectedAppRelatedIds().has(r.applicationId));
  }

  toggleSelectAllAppsRelated(): void {
    const removable = this.filteredRelatedApps().filter((r) => !r.system);
    const allSelected = this.areAllAppsRelatedSelected();
    this.selectedAppRelatedIds.update((curr) => {
      const next = new Set(curr);
      for (const r of removable) {
        if (allSelected) {
          next.delete(r.applicationId);
        } else {
          next.add(r.applicationId);
        }
      }
      return next;
    });
  }

  async addSingleApp(app: MorphusApplication): Promise<void> {
    const workspaceId = this.entity().id;
    if (!workspaceId || !app.id) {
      return;
    }

    const otherWorkspaces = this.context.getWorkspacesWithApplication(app.id, workspaceId);
    if (otherWorkspaces.length > 0) {
      this.pendingAppForInstanceModal.set(app);
      this.otherWorkspacesForPendingApp.set(otherWorkspaces);
      this.instanceMode.set('isolated');
      this.selectedSharedWorkspaceId.set(otherWorkspaces[0]?.id ?? null);
      return;
    }

    await this.confirmLinkSingleApp(app.id, null);
  }

  protected closeInstanceModal(): void {
    this.pendingAppForInstanceModal.set(null);
    this.otherWorkspacesForPendingApp.set([]);
  }

  protected async confirmInstanceModal(): Promise<void> {
    const app = this.pendingAppForInstanceModal();
    if (!app?.id) {
      return;
    }
    const sharedWithWorkspaceId =
      this.instanceMode() === 'shared' ? this.selectedSharedWorkspaceId() : null;
    this.closeInstanceModal();
    await this.confirmLinkSingleApp(app.id, sharedWithWorkspaceId);
  }

  protected getSharedWorkspaceLabel(sharedWithWorkspaceId?: string | null): string | null {
    return this.context.getSharedWorkspaceName(sharedWithWorkspaceId);
  }

  private async confirmLinkSingleApp(
    applicationId: string,
    sharedWithWorkspaceId: string | null,
  ): Promise<void> {
    const workspaceId = this.entity().id;
    if (!workspaceId) {
      return;
    }
    await firstValueFrom(
      this.workspaceAppService.addRelationship({
        workspaceId,
        applicationId,
        sharedWithWorkspaceId,
      }),
    );
    await this.loadWorkspaceApplications(workspaceId);
    this.context.loadWorkspaces();
    this.context.loadCatalogApplications();
  }

  async addSelectedApps(): Promise<void> {
    const workspaceId = this.entity().id;
    const ids = Array.from(this.selectedAppToRelateIds());
    if (!workspaceId || !ids.length) {
      return;
    }
    await firstValueFrom(
      this.workspaceAppService.addRelationships(
        ids.map((applicationId) => ({ workspaceId, applicationId })),
      ),
    );
    await this.loadWorkspaceApplications(workspaceId);
    this.context.loadWorkspaces();
  }

  async removeSingleApp(rel: WorkspaceApplication): Promise<void> {
    if (rel.system) {
      return;
    }
    await firstValueFrom(
      this.workspaceAppService.removeRelationship({
        workspaceId: rel.workspaceId,
        applicationId: rel.applicationId,
      }),
    );
    await this.loadWorkspaceApplications(rel.workspaceId);
    this.context.loadWorkspaces();
  }

  async removeSelectedApps(): Promise<void> {
    const workspaceId = this.entity().id;
    const ids = Array.from(this.selectedAppRelatedIds());
    if (!workspaceId || !ids.length) {
      return;
    }
    await firstValueFrom(
      this.workspaceAppService.removeRelationships(
        ids.map((applicationId) => ({ workspaceId, applicationId })),
      ),
    );
    await this.loadWorkspaceApplications(workspaceId);
    this.context.loadWorkspaces();
  }

  async toggleAppActive(rel: WorkspaceApplication): Promise<void> {
    if (rel.inactive) {
      await firstValueFrom(
        this.workspaceAppService.activate({
          workspaceId: rel.workspaceId,
          applicationId: rel.applicationId,
        }),
      );
    } else {
      await firstValueFrom(
        this.workspaceAppService.deactivate({
          workspaceId: rel.workspaceId,
          applicationId: rel.applicationId,
        }),
      );
    }
    await this.loadWorkspaceApplications(rel.workspaceId);
    this.context.loadWorkspaces();
  }

  // =========================================================================
  // N:N Usuários do Workspace (Multi-Seleção)
  // =========================================================================
  canRemoveUser(rel: WorkspaceUser): boolean {
    return !rel.system && !rel.isOwner;
  }

  isUserToRelateSelected(userId?: string): boolean {
    return !!userId && this.selectedUserToRelateIds().has(userId);
  }

  toggleUserToRelate(userId?: string): void {
    if (!userId) {
      return;
    }
    this.selectedUserToRelateIds.update((curr) => {
      const next = new Set(curr);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  }

  areAllUsersToRelateSelected(): boolean {
    const visible = this.filteredUsersToRelate();
    return visible.length > 0 && visible.every((u) => !!u.id && this.selectedUserToRelateIds().has(u.id));
  }

  toggleSelectAllUsersToRelate(): void {
    const visible = this.filteredUsersToRelate();
    const allSelected = this.areAllUsersToRelateSelected();
    this.selectedUserToRelateIds.update((curr) => {
      const next = new Set(curr);
      for (const u of visible) {
        if (!u.id) {
          continue;
        }
        if (allSelected) {
          next.delete(u.id);
        } else {
          next.add(u.id);
        }
      }
      return next;
    });
  }

  isUserRelatedSelected(userId?: string): boolean {
    return !!userId && this.selectedUserRelatedIds().has(userId);
  }

  toggleUserRelated(rel: WorkspaceUser): void {
    if (!this.canRemoveUser(rel) || !rel.userId) {
      return;
    }
    this.selectedUserRelatedIds.update((curr) => {
      const next = new Set(curr);
      if (next.has(rel.userId)) {
        next.delete(rel.userId);
      } else {
        next.add(rel.userId);
      }
      return next;
    });
  }

  areAllUsersRelatedSelected(): boolean {
    const removable = this.filteredRelatedUsers().filter((r) => this.canRemoveUser(r));
    return removable.length > 0 && removable.every((r) => this.selectedUserRelatedIds().has(r.userId));
  }

  toggleSelectAllUsersRelated(): void {
    const removable = this.filteredRelatedUsers().filter((r) => this.canRemoveUser(r));
    const allSelected = this.areAllUsersRelatedSelected();
    this.selectedUserRelatedIds.update((curr) => {
      const next = new Set(curr);
      for (const r of removable) {
        if (allSelected) {
          next.delete(r.userId);
        } else {
          next.add(r.userId);
        }
      }
      return next;
    });
  }

  async addSingleUser(user: User): Promise<void> {
    const workspaceId = this.entity().id;
    if (!workspaceId || !user.id) {
      return;
    }
    await firstValueFrom(
      this.workspaceUserService.addRelationship({
        workspaceId,
        userId: user.id,
        isOwner: false,
      }),
    );
    await this.loadWorkspaceUsers(workspaceId);
  }

  async addSelectedUsers(): Promise<void> {
    const workspaceId = this.entity().id;
    const ids = Array.from(this.selectedUserToRelateIds());
    if (!workspaceId || !ids.length) {
      return;
    }
    await firstValueFrom(
      this.workspaceUserService.addRelationships(
        ids.map((userId) => ({ workspaceId, userId, isOwner: false })),
      ),
    );
    await this.loadWorkspaceUsers(workspaceId);
  }

  async removeSingleUser(rel: WorkspaceUser): Promise<void> {
    if (!this.canRemoveUser(rel)) {
      return;
    }
    await firstValueFrom(
      this.workspaceUserService.removeRelationship({
        workspaceId: rel.workspaceId,
        userId: rel.userId,
      }),
    );
    await this.loadWorkspaceUsers(rel.workspaceId);
  }

  async removeSelectedUsers(): Promise<void> {
    const workspaceId = this.entity().id;
    const ids = Array.from(this.selectedUserRelatedIds());
    if (!workspaceId || !ids.length) {
      return;
    }
    await firstValueFrom(
      this.workspaceUserService.removeRelationships(
        ids.map((userId) => ({ workspaceId, userId })),
      ),
    );
    await this.loadWorkspaceUsers(workspaceId);
  }

  async toggleUserActive(rel: WorkspaceUser): Promise<void> {
    if (rel.inactive) {
      await firstValueFrom(
        this.workspaceUserService.activate({
          workspaceId: rel.workspaceId,
          userId: rel.userId,
        }),
      );
    } else {
      await firstValueFrom(
        this.workspaceUserService.deactivate({
          workspaceId: rel.workspaceId,
          userId: rel.userId,
        }),
      );
    }
    await this.loadWorkspaceUsers(rel.workspaceId);
  }

  async toggleUserOwner(rel: WorkspaceUser): Promise<void> {
    if (rel.isOwner) {
      await firstValueFrom(
        this.workspaceUserService.removeOwner({
          workspaceId: rel.workspaceId,
          userId: rel.userId,
        }),
      );
    } else {
      await firstValueFrom(
        this.workspaceUserService.setOwner({
          workspaceId: rel.workspaceId,
          userId: rel.userId,
        }),
      );
    }
    await this.loadWorkspaceUsers(rel.workspaceId);
  }

  newEntity(): void {
    this.title1.set('Novo Workspace');
    this.title2.set('Informe os dados para cadastrar um novo espaço de trabalho na corporação.');
    this.setEntity({
      name: '',
      key: this.generateKey(),
      icon: 'layout-grid',
      default: false,
      description: '',
    });
  }

  editEntity(): void {
    this.title1.set(`Editar Workspace: ${this.entity().name ?? ''}`);
    this.title2.set(
      'Atualize os dados do workspace ou gerencie as aplicações e usuários vinculados.',
    );
  }

  async submitForm(): Promise<void> {
    if (this.isNew) {
      await this.create();
    } else {
      await this.update();
    }
  }

  async create(): Promise<void> {
    await firstValueFrom(this.workspaceService.create(this.entity()));
    this.context.loadWorkspaces();
    this.messageService.showSuccess(
      `O workspace "${this.entity().name}" foi criado com sucesso!`,
    );
    this.back();
  }

  async update(): Promise<void> {
    const id = this.entity().id ?? '';
    await firstValueFrom(this.workspaceService.update(id, this.entity()));
    this.context.loadWorkspaces();
    this.messageService.showSuccess(
      `Os dados do workspace "${this.entity().name}" foram atualizados com sucesso!`,
    );
    this.back();
  }

  back(): void {
    void this.router.navigate(['/morphus/workspace']);
  }

  async onSave(): Promise<void> {
    await this.submitForm();
  }

  onCancel(): void {
    this.back();
  }
}
