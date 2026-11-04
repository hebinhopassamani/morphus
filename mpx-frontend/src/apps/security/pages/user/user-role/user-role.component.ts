import { computed, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatInput, MatLabel, MatPrefix } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatTooltip } from '@angular/material/tooltip';
import { IMorphusNxNComponent, MorphusNxNComponent } from '@core/mpx-base';
import { MorphusApplication } from '@morphus/entities/application';
import { ApplicationService } from '@morphus/services/application.service';
import { Module } from '@security/entities/module';
import { Role } from '@security/entities/role';
import { SubModule } from '@security/entities/sub-module';
import { User } from '@security/entities/user';
import { UserRole } from '@security/entities/user-role';
import { ModuleService } from '@security/services/module.service';
import { RoleService } from '@security/services/role.service';
import { SubModuleService } from '@security/services/sub-module.service';
import { UserRoleService } from '@security/services/user-role.service';
import { UserService } from '@security/services/user.service';

@Component({
  selector: 'mpx-user-role-nxn',
  standalone: true,
  imports: [
    FormsModule,
    MatButton,
    MatIcon,
    MatFormField,
    MatLabel,
    MatInput,
    MatPrefix,
    MatSelect,
    MatOption,
    MatTooltip,
  ],
  styleUrl: './user-role.component.css',
  templateUrl: './user-role.component.html',
})
export class UserRoleComponent
  extends MorphusNxNComponent<UserRole, Role>
  implements IMorphusNxNComponent, OnInit, OnDestroy
{
  private readonly userService = inject(UserService);
  private readonly roleService = inject(RoleService);
  private readonly applicationService = inject(ApplicationService);
  private readonly moduleService = inject(ModuleService);
  private readonly subModuleService = inject(SubModuleService);
  public readonly userRoleService = inject(UserRoleService);

  protected readonly userId = signal<string>('');
  protected readonly user = signal<User | null>(null);

  protected readonly applications = signal<MorphusApplication[]>([]);
  protected readonly allModules = signal<Module[]>([]);
  protected readonly allSubModules = signal<SubModule[]>([]);
  protected readonly allRoles = signal<Role[]>([]);

  protected readonly filterApplicationId = signal<string>('');
  protected readonly filterModuleId = signal<string>('');
  protected readonly filterSubModuleId = signal<string>('');

  protected readonly searchToRelate = signal<string>('');
  protected readonly searchRelated = signal<string>('');

  protected readonly recentlyTransferredIds = signal<Set<string>>(new Set());

  protected isRecentlyTransferred(roleId?: string): boolean {
    return !!roleId && this.recentlyTransferredIds().has(roleId);
  }

  protected flashTransferred(ids: string[]): void {
    this.recentlyTransferredIds.set(new Set());
    setTimeout(() => {
      this.recentlyTransferredIds.set(new Set(ids));
    }, 10);
  }

  protected readonly availableModules = computed(() => {
    const appId = this.filterApplicationId();
    const list = this.allModules();
    return appId ? list.filter((m) => m.applicationId === appId) : list;
  });

  protected readonly availableSubModules = computed(() => {
    const modId = this.filterModuleId();
    const list = this.allSubModules();
    return modId ? list.filter((sm) => sm.moduleId === modId) : list;
  });

  protected readonly filteredRolesToRelate = computed(() => {
    const term = this.searchToRelate().toLowerCase().trim();
    const appId = this.filterApplicationId();
    const modId = this.filterModuleId();
    const subId = this.filterSubModuleId();
    const relatedRoleIds = new Set(this.relatedEntities().map((r) => r.roleId));

    return this.entitiesToRelate().filter((r) => {
      if (!r.id || relatedRoleIds.has(r.id)) {
        return false;
      }
      if (appId && r.module?.applicationId !== appId) {
        return false;
      }
      if (modId && r.moduleId !== modId) {
        return false;
      }
      if (subId && r.subModuleId !== subId) {
        return false;
      }
      if (!term) {
        return true;
      }
      return (
        (r.name ?? '').toLowerCase().includes(term) ||
        (r.key ?? '').toLowerCase().includes(term) ||
        (r.description ?? '').toLowerCase().includes(term) ||
        (r.module?.name ?? '').toLowerCase().includes(term) ||
        (r.subModule?.name ?? '').toLowerCase().includes(term)
      );
    });
  });

  protected readonly filteredRelatedRoles = computed(() => {
    const term = this.searchRelated().toLowerCase().trim();
    const appId = this.filterApplicationId();
    const modId = this.filterModuleId();
    const subId = this.filterSubModuleId();

    return this.relatedEntities().filter((ur) => {
      if (appId && ur.role?.module?.applicationId !== appId) {
        return false;
      }
      if (modId && ur.role?.moduleId !== modId) {
        return false;
      }
      if (subId && ur.role?.subModuleId !== subId) {
        return false;
      }
      if (!term) {
        return true;
      }
      return (
        (ur.role?.name ?? '').toLowerCase().includes(term) ||
        (ur.role?.key ?? '').toLowerCase().includes(term) ||
        (ur.role?.module?.name ?? '').toLowerCase().includes(term) ||
        (ur.role?.subModule?.name ?? '').toLowerCase().includes(term)
      );
    });
  });

  constructor() {
    super();
    this.addPk('userId').addPk('roleId');
  }

  ngOnInit(): void {
    const id = this.activatedRoute.snapshot.paramMap.get('id') ?? '';
    this.userId.set(id);
    this.title1.set('Configurar Perfis do Usuário');
    this.title2.set('Vincule ou remova perfis (Roles) do usuário selecionado.');
    void this.loadItems();
  }

  ngOnDestroy(): void {
    this.destroySubscriptions();
  }

  protected showAutoToast(msg: string, severity: 'success' | 'info' | 'warn' | 'error' = 'success'): void {
    this.toast.show({
      message: msg,
      severity,
      position: 'top-right',
      duration: 2600,
    });
  }

  async loadItems(): Promise<void> {
    const id = this.userId();
    if (!id) {
      return;
    }

    const [loadedUserById, allUsers, apps, mods, subMods, rolesCatalog] = await Promise.all([
      firstValueFrom(this.userService.getById(id)).catch(() => null),
      firstValueFrom(this.userService.getAll()).catch(() => []),
      firstValueFrom(this.applicationService.getList()).catch(() => []),
      firstValueFrom(this.moduleService.getAll()).catch(() => []),
      firstValueFrom(this.subModuleService.getAll()).catch(() => []),
      firstValueFrom(this.roleService.getAll()).catch(() => []),
    ]);

    const loadedUser = loadedUserById ?? (allUsers ?? []).find((u) => u.id === id) ?? null;

    const embeddedSubs = (mods ?? []).flatMap((m) => m.subModules ?? []);
    const mergedSubsMap = new Map<string, SubModule>();
    for (const s of [...embeddedSubs, ...(subMods ?? [])]) {
      if (s?.id) {
        mergedSubsMap.set(s.id, s);
      }
    }
    const mergedSubs = Array.from(mergedSubsMap.values());

    this.user.set(loadedUser);
    this.title1.set(`Perfis de ${loadedUser?.name || loadedUser?.email || 'Usuário'}`);
    this.applications.set(apps ?? []);
    this.allModules.set(mods ?? []);
    this.allSubModules.set(mergedSubs);

    const modMap = new Map((mods ?? []).map((m) => [m.id, m]));
    const subMap = new Map(mergedSubs.map((s) => [s.id, s]));
    const enrichedRoles = (rolesCatalog ?? []).map((r) => ({
      ...r,
      module: r.module ?? (r.moduleId ? modMap.get(r.moduleId) : undefined),
      subModule: r.subModule ?? (r.subModuleId ? subMap.get(r.subModuleId) : undefined),
    }));
    this.allRoles.set(enrichedRoles);

    await this.loadRelationships();
  }

  async loadRelationships(): Promise<void> {
    const userId = this.userId();
    if (!userId) {
      return;
    }

    const query: Record<string, string> = { userId };

    const [toRelate, related] = await Promise.all([
      firstValueFrom(this.userRoleService.getEntitiesToRelate(query)).catch(() => []),
      firstValueFrom(this.userRoleService.getRelatedEntities(query)).catch(() => []),
    ]);

    const roleMap = new Map(this.allRoles().map((r) => [r.id, r]));
    const toRelateIds = new Set((toRelate ?? []).map((r) => r.id));

    const enrichedRelatedMap = new Map<string, UserRole>();
    for (const ur of related ?? []) {
      if (ur.userId && ur.userId !== userId) {
        continue;
      }
      const catalogRole = roleMap.get(ur.roleId);
      enrichedRelatedMap.set(ur.roleId, {
        ...ur,
        userId: ur.userId || userId,
        role: ur.role
          ? {
              ...catalogRole,
              ...ur.role,
              module: ur.role.module ?? catalogRole?.module,
              subModule: ur.role.subModule ?? catalogRole?.subModule,
            }
          : catalogRole,
      });
    }

    if (toRelate && this.allRoles().length > 0) {
      for (const role of this.allRoles()) {
        if (role.id && !toRelateIds.has(role.id) && !enrichedRelatedMap.has(role.id)) {
          enrichedRelatedMap.set(role.id, {
            corporationId: role.corporationId ?? '',
            userId,
            roleId: role.id,
            role,
            system: false,
            inactive: false,
          });
        }
      }
    }

    const enrichedRelated = Array.from(enrichedRelatedMap.values()).sort((a, b) =>
      (a.role?.name ?? '').localeCompare(b.role?.name ?? '', 'pt-BR'),
    );
    const relatedRoleIds = new Set(enrichedRelated.map((ur) => ur.roleId));
    const enrichedToRelate = (toRelate ?? [])
      .filter((r) => !!r.id && !relatedRoleIds.has(r.id))
      .map((r) => ({
        ...roleMap.get(r.id),
        ...r,
        module: r.module ?? roleMap.get(r.id)?.module,
        subModule: r.subModule ?? roleMap.get(r.id)?.subModule,
      }))
      .sort((a, b) => (a.name ?? '').localeCompare(b.name ?? '', 'pt-BR'));

    this.recentlyTransferredIds.set(new Set());
    this.setEntitiesToRelate(enrichedToRelate);
    this.setRelatedEntities(enrichedRelated);
  }

  onApplicationFilterChange(appId: string): void {
    this.filterApplicationId.set(appId);
    this.filterModuleId.set('');
    this.filterSubModuleId.set('');
  }

  async onModuleFilterChange(modId: string): Promise<void> {
    this.filterModuleId.set(modId);
    this.filterSubModuleId.set('');
    if (modId) {
      const existing = this.allSubModules().filter((s) => s.moduleId === modId);
      if (existing.length === 0) {
        const fetched = (await firstValueFrom(this.subModuleService.getByModuleId(modId))) ?? [];
        if (fetched.length > 0) {
          this.allSubModules.update((curr) => [...curr, ...fetched]);
        }
      }
    }
  }

  onSubModuleFilterChange(subId: string): void {
    this.filterSubModuleId.set(subId);
  }

  async addSingleRole(role: Role): Promise<void> {
    const userId = this.userId();
    if (!userId || !role.id) {
      return;
    }

    // Transferência visual imediata para o TOPO da lista da direita com piscadinha
    this.flashTransferred([role.id]);
    this.entitiesToRelate.update((list) => list.filter((r) => r.id !== role.id));
    this.relatedEntities.update((list) => [
      {
        corporationId: role.corporationId ?? '',
        userId,
        roleId: role.id!,
        role,
        system: false,
        inactive: false,
      },
      ...list,
    ]);
    this.showAutoToast(`Perfil "${role.name}" vinculado`);

    await firstValueFrom(this.userRoleService.addRelationship({ userId, roleId: role.id }));
  }

  async addSelectedRoles(): Promise<void> {
    const userId = this.userId();
    const selected = this.getSelectedToRelateEntities();
    if (!userId || !selected.length) {
      return;
    }

    const selectedIds = new Set(selected.map((r) => r.id).filter((id): id is string => !!id));
    this.flashTransferred(Array.from(selectedIds));
    this.entitiesToRelate.update((list) => list.filter((r) => !r.id || !selectedIds.has(r.id)));
    this.relatedEntities.update((list) => [
      ...selected.map((role) => ({
        corporationId: role.corporationId ?? '',
        userId,
        roleId: role.id!,
        role,
        system: false,
        inactive: false,
      })),
      ...list,
    ]);
    this.clearToRelateSelection();
    this.showAutoToast(`${selected.length} perfil(is) vinculado(s)`);

    await firstValueFrom(
      this.userRoleService.addRelationships(
        selected.map((r) => ({ userId, roleId: r.id! })),
      ),
    );
  }

  async removeSingleRole(rel: UserRole): Promise<void> {
    if (rel.system) {
      return;
    }

    this.flashTransferred([rel.roleId]);
    this.relatedEntities.update((list) => list.filter((ur) => ur.roleId !== rel.roleId));
    if (rel.role) {
      this.entitiesToRelate.update((list) => [rel.role!, ...list]);
    }
    this.showAutoToast(`Perfil removido`);

    await firstValueFrom(
      this.userRoleService.removeRelationship({ userId: rel.userId, roleId: rel.roleId }),
    );
  }

  async removeSelectedRoles(): Promise<void> {
    const selected = this.getSelectedRelatedEntities();
    if (!selected.length) {
      return;
    }

    const removedIds = new Set(selected.map((ur) => ur.roleId));
    this.flashTransferred(Array.from(removedIds));
    const restoredRoles = selected.map((ur) => ur.role).filter((r): r is Role => !!r);
    this.relatedEntities.update((list) => list.filter((ur) => !removedIds.has(ur.roleId)));
    this.entitiesToRelate.update((list) => [...restoredRoles, ...list]);
    this.clearRelatedSelection();
    this.showAutoToast(`${selected.length} perfil(is) removido(s)`);

    await firstValueFrom(
      this.userRoleService.removeRelationships(
        selected.map((ur) => ({ userId: ur.userId, roleId: ur.roleId })),
      ),
    );
  }

  goToUserClaims(): void {
    const id = this.userId();
    if (id) {
      void this.router.navigate(['/security/user', id, 'claims']);
    }
  }

  back(): void {
    void this.router.navigate(['/security/user']);
  }
}
