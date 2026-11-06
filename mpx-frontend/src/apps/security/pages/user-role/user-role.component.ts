import { computed, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {
  IMorphusNxNComponent,
  MorphusNxNComponent,
  MorphusNxNShared,
} from '@core/mpx-shared/nxn';
import { MorphusApplication } from '@morphus/entities/application';
import { ApplicationService } from '@morphus/services/application.service';
import { Claim } from '@security/entities/claim';
import { Module } from '@security/entities/module';
import { Role } from '@security/entities/role';
import { RoleClaim } from '@security/entities/role-claim';
import { SubModule } from '@security/entities/sub-module';
import { User } from '@security/entities/user';
import { UserClaim } from '@security/entities/user-claim';
import { UserRole } from '@security/entities/user-role';
import { ClaimService } from '@security/services/claim.service';
import { ModuleService } from '@security/services/module.service';
import { RoleClaimService } from '@security/services/role-claim.service';
import { RoleService } from '@security/services/role.service';
import { SubModuleService } from '@security/services/sub-module.service';
import { UserClaimService } from '@security/services/user-claim.service';
import { UserRoleService } from '@security/services/user-role.service';
import { UserService } from '@security/services/user.service';

@Component({
  selector: 'mpx-user-role',
  standalone: true,
  imports: [MorphusNxNShared],
  styleUrl: './user-role.component.css',
  templateUrl: './user-role.component.html',
})
export class UserRoleComponent
  extends MorphusNxNComponent<UserRole, Role>
  implements IMorphusNxNComponent, OnInit, OnDestroy
{
  private readonly userService = inject(UserService);
  private readonly roleService = inject(RoleService);
  private readonly claimService = inject(ClaimService);
  private readonly applicationService = inject(ApplicationService);
  private readonly moduleService = inject(ModuleService);
  private readonly subModuleService = inject(SubModuleService);
  public readonly userRoleService = inject(UserRoleService);
  private readonly roleClaimService = inject(RoleClaimService);
  private readonly userClaimService = inject(UserClaimService);

  protected readonly mainTabIndex = signal<number>(0);
  protected readonly userRelationSubTab = signal<'roles' | 'claims'>('roles');

  // Filtro hierárquico global da tela: Aplicação -> Módulo -> Submódulo
  protected readonly applications = signal<MorphusApplication[]>([]);
  protected readonly allModules = signal<Module[]>([]);
  protected readonly allSubModules = signal<SubModule[]>([]);

  protected readonly filterApplicationId = signal<string>('');
  protected readonly filterModuleId = signal<string>('');
  protected readonly filterSubModuleId = signal<string>('');

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

  // =========================================================================
  // 1. USUÁRIOS + N:N (UserRole & UserClaim)
  // =========================================================================
  protected readonly users = signal<User[]>([]);
  protected readonly userSearch = signal<string>('');
  protected readonly selectedUser = signal<User | null>(null);
  protected readonly userFormOpen = signal<boolean>(false);
  protected readonly editingUser = signal<Partial<User> & { password?: string }>({});

  protected readonly filteredUsers = computed(() => {
    const term = this.userSearch().toLowerCase().trim();
    const list = this.users();
    if (!term) {
      return list;
    }
    return list.filter(
      (u) =>
        (u.name ?? '').toLowerCase().includes(term) ||
        (u.email ?? '').toLowerCase().includes(term) ||
        (u.key ?? '').toLowerCase().includes(term),
    );
  });

  // N:N UserRole (Perfis do Usuário selecionado)
  protected readonly searchRoleToRelate = signal<string>('');
  protected readonly searchRoleRelated = signal<string>('');

  protected readonly filteredRolesToRelate = computed(() => {
    const term = this.searchRoleToRelate().toLowerCase().trim();
    const relatedRoleIds = new Set(this.relatedEntities().map((r) => r.roleId));
    const list = this.entitiesToRelate().filter((r) => !!r.id && !relatedRoleIds.has(r.id));
    if (!term) {
      return list;
    }
    return list.filter(
      (r) =>
        (r.name ?? '').toLowerCase().includes(term) ||
        (r.key ?? '').toLowerCase().includes(term) ||
        (r.module?.name ?? '').toLowerCase().includes(term) ||
        (r.subModule?.name ?? '').toLowerCase().includes(term),
    );
  });

  protected readonly filteredRelatedRoles = computed(() => {
    const term = this.searchRoleRelated().toLowerCase().trim();
    const list = this.relatedEntities();
    if (!term) {
      return list;
    }
    return list.filter(
      (ur) =>
        (ur.role?.name ?? '').toLowerCase().includes(term) ||
        (ur.role?.key ?? '').toLowerCase().includes(term) ||
        (ur.role?.module?.name ?? '').toLowerCase().includes(term),
    );
  });

  // N:N UserClaim (Permissões Diretas do Usuário selecionado)
  protected readonly userClaimsToRelate = signal<Claim[]>([]);
  protected readonly relatedUserClaims = signal<UserClaim[]>([]);
  protected readonly searchUserClaimToRelate = signal<string>('');
  protected readonly searchUserClaimRelated = signal<string>('');
  protected readonly selectedUserClaimToRelateIds = signal<Set<string>>(new Set());
  protected readonly selectedUserClaimRelatedIds = signal<Set<string>>(new Set());

  protected readonly filteredUserClaimsToRelate = computed(() => {
    const term = this.searchUserClaimToRelate().toLowerCase().trim();
    const relatedSet = new Set(this.relatedUserClaims().map((uc) => uc.claimId));
    const list = this.userClaimsToRelate().filter((c) => !!c.id && !relatedSet.has(c.id));
    if (!term) {
      return list;
    }
    return list.filter(
      (c) =>
        (c.claimType ?? '').toLowerCase().includes(term) ||
        (c.claimValue ?? '').toLowerCase().includes(term) ||
        (c.description ?? '').toLowerCase().includes(term) ||
        (c.module?.name ?? '').toLowerCase().includes(term) ||
        (c.subModule?.name ?? '').toLowerCase().includes(term),
    );
  });

  protected readonly filteredRelatedUserClaims = computed(() => {
    const term = this.searchUserClaimRelated().toLowerCase().trim();
    const list = this.relatedUserClaims();
    if (!term) {
      return list;
    }
    return list.filter(
      (uc) =>
        (uc.claim?.claimType ?? '').toLowerCase().includes(term) ||
        (uc.claim?.claimValue ?? '').toLowerCase().includes(term) ||
        (uc.claim?.description ?? '').toLowerCase().includes(term),
    );
  });

  // =========================================================================
  // 2. PERFIS (ROLES) + N:N RoleClaim (Multi-Seleção de 40+ Claims)
  // =========================================================================
  protected readonly roles = signal<Role[]>([]);
  protected readonly roleSearch = signal<string>('');
  protected readonly selectedRole = signal<Role | null>(null);
  protected readonly roleFormOpen = signal<boolean>(false);
  protected readonly editingRole = signal<Partial<Role>>({});

  protected readonly filteredRoles = computed(() => {
    const term = this.roleSearch().toLowerCase().trim();
    const appId = this.filterApplicationId();
    const modId = this.filterModuleId();
    const subId = this.filterSubModuleId();

    return this.roles().filter((r) => {
      if (appId && r.module?.applicationId && r.module.applicationId !== appId) {
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
        (r.description ?? '').toLowerCase().includes(term)
      );
    });
  });

  protected readonly roleClaimsToRelate = signal<Claim[]>([]);
  protected readonly relatedRoleClaims = signal<RoleClaim[]>([]);
  protected readonly searchRoleClaimToRelate = signal<string>('');
  protected readonly searchRoleClaimRelated = signal<string>('');
  protected readonly selectedRoleClaimToRelateIds = signal<Set<string>>(new Set());
  protected readonly selectedRoleClaimRelatedIds = signal<Set<string>>(new Set());

  protected readonly filteredRoleClaimsToRelate = computed(() => {
    const term = this.searchRoleClaimToRelate().toLowerCase().trim();
    const relatedSet = new Set(this.relatedRoleClaims().map((rc) => rc.claimId));
    const list = this.roleClaimsToRelate().filter((c) => !!c.id && !relatedSet.has(c.id));
    if (!term) {
      return list;
    }
    return list.filter(
      (c) =>
        (c.claimType ?? '').toLowerCase().includes(term) ||
        (c.claimValue ?? '').toLowerCase().includes(term) ||
        (c.description ?? '').toLowerCase().includes(term) ||
        (c.module?.name ?? '').toLowerCase().includes(term) ||
        (c.subModule?.name ?? '').toLowerCase().includes(term),
    );
  });

  protected readonly filteredRelatedRoleClaims = computed(() => {
    const term = this.searchRoleClaimRelated().toLowerCase().trim();
    const list = this.relatedRoleClaims();
    if (!term) {
      return list;
    }
    return list.filter(
      (rc) =>
        (rc.claim?.claimType ?? '').toLowerCase().includes(term) ||
        (rc.claim?.claimValue ?? '').toLowerCase().includes(term) ||
        (rc.claim?.description ?? '').toLowerCase().includes(term),
    );
  });

  // =========================================================================
  // 3. PERMISSÕES (CLAIMS) CRUD
  // =========================================================================
  protected readonly claims = signal<Claim[]>([]);
  protected readonly claimSearch = signal<string>('');
  protected readonly claimFormOpen = signal<boolean>(false);
  protected readonly editingClaim = signal<Partial<Claim>>({});

  protected readonly filteredClaims = computed(() => {
    const term = this.claimSearch().toLowerCase().trim();
    const appId = this.filterApplicationId();
    const modId = this.filterModuleId();
    const subId = this.filterSubModuleId();

    return this.claims().filter((c) => {
      if (appId && c.module?.applicationId && c.module.applicationId !== appId) {
        return false;
      }
      if (modId && c.moduleId !== modId) {
        return false;
      }
      if (subId && c.subModuleId !== subId) {
        return false;
      }
      if (!term) {
        return true;
      }
      return (
        (c.claimType ?? '').toLowerCase().includes(term) ||
        (c.claimValue ?? '').toLowerCase().includes(term) ||
        (c.key ?? '').toLowerCase().includes(term) ||
        (c.description ?? '').toLowerCase().includes(term)
      );
    });
  });

  // Submódulos disponíveis para os formulários de Role e Claim conforme o ModuleId escolhido
  protected readonly roleFormSubModules = computed(() => {
    const modId = this.editingRole().moduleId;
    return modId ? this.allSubModules().filter((s) => s.moduleId === modId) : [];
  });

  protected readonly claimFormSubModules = computed(() => {
    const modId = this.editingClaim().moduleId;
    return modId ? this.allSubModules().filter((s) => s.moduleId === modId) : [];
  });

  constructor() {
    super();
    this.addPk('userId').addPk('roleId');
  }

  ngOnInit(): void {
    this.title1.set('Usuários, Perfis & Permissões (RBAC)');
    this.title2.set(
      'Gerencie identidades, crie perfis e vincule permissões em lote com filtro por Aplicação, Módulo e Submódulo.',
    );
    void this.loadItems();
  }

  ngOnDestroy(): void {
    this.destroySubscriptions();
  }

  async loadItems(): Promise<void> {
    const [apps, mods, subMods, userList, roleList, claimList] = await Promise.all([
      firstValueFrom(this.applicationService.getList()),
      firstValueFrom(this.moduleService.getAll()),
      firstValueFrom(this.subModuleService.getAll()),
      firstValueFrom(this.userService.getAll()),
      firstValueFrom(this.roleService.getAll()),
      firstValueFrom(this.claimService.getAll()),
    ]);

    this.applications.set(apps ?? []);
    this.allModules.set(mods ?? []);
    this.allSubModules.set(subMods ?? []);
    this.users.set(userList ?? []);
    this.roles.set(roleList ?? []);
    this.claims.set(claimList ?? []);

    if (!this.selectedUser() && (userList?.length ?? 0) > 0) {
      await this.selectUser(userList[0]);
    } else if (this.selectedUser()?.id) {
      await this.loadSelectedUserRelationships();
    }

    if (!this.selectedRole() && (roleList?.length ?? 0) > 0) {
      await this.selectRole(roleList[0]);
    } else if (this.selectedRole()?.id) {
      await this.loadSelectedRoleRelationships();
    }
  }

  // Mudança nos filtros globais de Aplicação -> Módulo -> Submódulo
  async onApplicationFilterChange(appId: string): Promise<void> {
    this.filterApplicationId.set(appId);
    this.filterModuleId.set('');
    this.filterSubModuleId.set('');
    await this.reloadActiveRelationships();
  }

  async onModuleFilterChange(modId: string): Promise<void> {
    this.filterModuleId.set(modId);
    this.filterSubModuleId.set('');
    await this.reloadActiveRelationships();
  }

  async onSubModuleFilterChange(subId: string): Promise<void> {
    this.filterSubModuleId.set(subId);
    await this.reloadActiveRelationships();
  }

  private async reloadActiveRelationships(): Promise<void> {
    await Promise.all([
      this.loadSelectedUserRelationships(),
      this.loadSelectedRoleRelationships(),
    ]);
  }

  // =========================================================================
  // 1. CRUD DE USUÁRIOS & N:N (UserRole / UserClaim)
  // =========================================================================
  async selectUser(user: User): Promise<void> {
    this.selectedUser.set(user);
    await this.loadSelectedUserRelationships();
  }

  async loadSelectedUserRelationships(): Promise<void> {
    const userId = this.selectedUser()?.id;
    if (!userId) {
      return;
    }
    const query: Record<string, string> = { userId };
    if (this.filterApplicationId()) {
      query['applicationId'] = this.filterApplicationId();
    }
    if (this.filterModuleId()) {
      query['moduleId'] = this.filterModuleId();
    }
    if (this.filterSubModuleId()) {
      query['subModuleId'] = this.filterSubModuleId();
    }

    const [rolesToRelate, relatedRoles, claimsToRelate, relatedClaims] = await Promise.all([
      firstValueFrom(this.userRoleService.getEntitiesToRelate(query)),
      firstValueFrom(this.userRoleService.getRelatedEntities(query)),
      firstValueFrom(this.userClaimService.getEntitiesToRelate(query)),
      firstValueFrom(this.userClaimService.getRelatedEntities(query)),
    ]);

    const relatedRoleIds = new Set((relatedRoles ?? []).map((ur) => ur.roleId));
    this.setEntitiesToRelate(
      (rolesToRelate ?? []).filter((r) => !!r.id && !relatedRoleIds.has(r.id)),
    );
    this.setRelatedEntities(relatedRoles ?? []);

    const relatedClaimIds = new Set((relatedClaims ?? []).map((uc) => uc.claimId));
    this.userClaimsToRelate.set(
      (claimsToRelate ?? []).filter((c) => !!c.id && !relatedClaimIds.has(c.id)),
    );
    this.relatedUserClaims.set(relatedClaims ?? []);
    this.selectedUserClaimToRelateIds.set(new Set());
    this.selectedUserClaimRelatedIds.set(new Set());
  }

  openNewUserForm(): void {
    this.editingUser.set({
      name: '',
      email: '',
      phoneNumber: '',
      key: this.generateKey(),
      password: '',
    });
    this.userFormOpen.set(true);
  }

  openEditUserForm(user: User): void {
    this.editingUser.set({
      ...user,
      password: '',
    });
    this.userFormOpen.set(true);
  }

  cancelUserForm(): void {
    this.userFormOpen.set(false);
    this.editingUser.set({});
  }

  updateUserField(field: string, value: unknown): void {
    this.editingUser.update((curr) => ({ ...curr, [field]: value }));
  }

  async saveUser(): Promise<void> {
    const u = this.editingUser();
    if (!u.name || !u.email) {
      return;
    }
    if (u.id) {
      const updated = await firstValueFrom(this.userService.update(u.id, u));
      this.messageService.showSuccess(`Usuário "${updated.name}" atualizado!`);
      this.selectedUser.set(updated);
    } else {
      const created = await firstValueFrom(this.userService.create(u));
      this.messageService.showSuccess(`Usuário "${created.name}" criado com sucesso!`);
      this.selectedUser.set(created);
    }
    this.cancelUserForm();
    const list = await firstValueFrom(this.userService.getAll());
    this.users.set(list ?? []);
    await this.loadSelectedUserRelationships();
  }

  deleteUser(user: User): void {
    if (user.system) {
      this.messageService.showWarn(
        'Usuários nativos do sistema não podem ser excluídos.',
        'Operação Bloqueada',
      );
      return;
    }
    this.messageService.confirmDelete(
      user.name ?? user.email ?? '',
      async () => {
        if (user.id) {
          await firstValueFrom(this.userService.delete(user.id));
        }
        const list = await firstValueFrom(this.userService.getAll());
        this.users.set(list ?? []);
        if (this.selectedUser()?.id === user.id) {
          this.selectedUser.set(list[0] ?? null);
          await this.loadSelectedUserRelationships();
        }
        this.messageService.showSuccess('Usuário excluído com sucesso!');
      },
      { doubleCheck: true },
    );
  }

  // Ações em lote e unitárias para UserRole (Perfis do Usuário)
  async addSingleUserRole(role: Role): Promise<void> {
    const userId = this.selectedUser()?.id;
    if (!userId || !role.id) {
      return;
    }
    await firstValueFrom(this.userRoleService.addRelationship({ userId, roleId: role.id }));
    await this.loadSelectedUserRelationships();
    this.messageService.showSuccess(`Perfil "${role.name}" vinculado ao usuário!`);
  }

  async addSelectedUserRoles(): Promise<void> {
    const userId = this.selectedUser()?.id;
    const selected = this.getSelectedToRelateEntities();
    if (!userId || !selected.length) {
      return;
    }
    await firstValueFrom(
      this.userRoleService.addRelationships(
        selected.map((r) => ({ userId, roleId: r.id! })),
      ),
    );
    await this.loadSelectedUserRelationships();
    this.messageService.showSuccess(`${selected.length} perfil(is) vinculado(s) ao usuário!`);
  }

  async removeSingleUserRole(rel: UserRole): Promise<void> {
    if (rel.system) {
      return;
    }
    await firstValueFrom(
      this.userRoleService.removeRelationship({ userId: rel.userId, roleId: rel.roleId }),
    );
    await this.loadSelectedUserRelationships();
    this.messageService.showSuccess('Perfil removido do usuário!');
  }

  async removeSelectedUserRoles(): Promise<void> {
    const selected = this.getSelectedRelatedEntities();
    if (!selected.length) {
      return;
    }
    await firstValueFrom(
      this.userRoleService.removeRelationships(
        selected.map((ur) => ({ userId: ur.userId, roleId: ur.roleId })),
      ),
    );
    await this.loadSelectedUserRelationships();
    this.messageService.showSuccess(`${selected.length} perfil(is) removido(s) do usuário!`);
  }

  // Multi-seleção e lote para UserClaim (Permissões Diretas do Usuário)
  isUserClaimToRelateSelected(claimId?: string): boolean {
    return !!claimId && this.selectedUserClaimToRelateIds().has(claimId);
  }

  toggleUserClaimToRelate(claimId?: string): void {
    if (!claimId) {
      return;
    }
    this.selectedUserClaimToRelateIds.update((curr) => {
      const next = new Set(curr);
      if (next.has(claimId)) {
        next.delete(claimId);
      } else {
        next.add(claimId);
      }
      return next;
    });
  }

  areAllUserClaimsToRelateSelected(): boolean {
    const visible = this.filteredUserClaimsToRelate();
    return visible.length > 0 && visible.every((c) => !!c.id && this.selectedUserClaimToRelateIds().has(c.id));
  }

  toggleSelectAllUserClaimsToRelate(): void {
    const visible = this.filteredUserClaimsToRelate();
    const allSelected = this.areAllUserClaimsToRelateSelected();
    this.selectedUserClaimToRelateIds.update((curr) => {
      const next = new Set(curr);
      for (const c of visible) {
        if (!c.id) {
          continue;
        }
        if (allSelected) {
          next.delete(c.id);
        } else {
          next.add(c.id);
        }
      }
      return next;
    });
  }

  isUserClaimRelatedSelected(claimId?: string): boolean {
    return !!claimId && this.selectedUserClaimRelatedIds().has(claimId);
  }

  toggleUserClaimRelated(uc: UserClaim): void {
    if (uc.system || !uc.claimId) {
      return;
    }
    this.selectedUserClaimRelatedIds.update((curr) => {
      const next = new Set(curr);
      if (next.has(uc.claimId)) {
        next.delete(uc.claimId);
      } else {
        next.add(uc.claimId);
      }
      return next;
    });
  }

  areAllUserClaimsRelatedSelected(): boolean {
    const removable = this.filteredRelatedUserClaims().filter((uc) => !uc.system);
    return removable.length > 0 && removable.every((uc) => this.selectedUserClaimRelatedIds().has(uc.claimId));
  }

  toggleSelectAllUserClaimsRelated(): void {
    const removable = this.filteredRelatedUserClaims().filter((uc) => !uc.system);
    const allSelected = this.areAllUserClaimsRelatedSelected();
    this.selectedUserClaimRelatedIds.update((curr) => {
      const next = new Set(curr);
      for (const uc of removable) {
        if (allSelected) {
          next.delete(uc.claimId);
        } else {
          next.add(uc.claimId);
        }
      }
      return next;
    });
  }

  async addSingleUserClaim(claim: Claim): Promise<void> {
    const userId = this.selectedUser()?.id;
    if (!userId || !claim.id) {
      return;
    }
    await firstValueFrom(this.userClaimService.addRelationship({ userId, claimId: claim.id }));
    await this.loadSelectedUserRelationships();
    this.messageService.showSuccess(`Permissão "${claim.claimValue}" concedida ao usuário!`);
  }

  async addSelectedUserClaims(): Promise<void> {
    const userId = this.selectedUser()?.id;
    const ids = Array.from(this.selectedUserClaimToRelateIds());
    if (!userId || !ids.length) {
      return;
    }
    await firstValueFrom(
      this.userClaimService.addRelationships(ids.map((claimId) => ({ userId, claimId }))),
    );
    await this.loadSelectedUserRelationships();
    this.messageService.showSuccess(`${ids.length} permissão(ões) concedida(s) ao usuário!`);
  }

  async removeSingleUserClaim(uc: UserClaim): Promise<void> {
    if (uc.system) {
      return;
    }
    await firstValueFrom(
      this.userClaimService.removeRelationship({ userId: uc.userId, claimId: uc.claimId }),
    );
    await this.loadSelectedUserRelationships();
    this.messageService.showSuccess('Permissão removida do usuário!');
  }

  async removeSelectedUserClaims(): Promise<void> {
    const userId = this.selectedUser()?.id;
    const ids = Array.from(this.selectedUserClaimRelatedIds());
    if (!userId || !ids.length) {
      return;
    }
    await firstValueFrom(
      this.userClaimService.removeRelationships(ids.map((claimId) => ({ userId, claimId }))),
    );
    await this.loadSelectedUserRelationships();
    this.messageService.showSuccess(`${ids.length} permissão(ões) removida(s) do usuário!`);
  }

  // =========================================================================
  // 2. CRUD DE PERFIS (ROLES) & N:N RoleClaim (Multi-Seleção em Lote)
  // =========================================================================
  async selectRole(role: Role): Promise<void> {
    this.selectedRole.set(role);
    await this.loadSelectedRoleRelationships();
  }

  async loadSelectedRoleRelationships(): Promise<void> {
    const roleId = this.selectedRole()?.id;
    if (!roleId) {
      return;
    }
    const query: Record<string, string> = { roleId };
    if (this.filterApplicationId()) {
      query['applicationId'] = this.filterApplicationId();
    }
    if (this.filterModuleId()) {
      query['moduleId'] = this.filterModuleId();
    }
    if (this.filterSubModuleId()) {
      query['subModuleId'] = this.filterSubModuleId();
    }

    const [toRelate, related] = await Promise.all([
      firstValueFrom(this.roleClaimService.getEntitiesToRelate(query)),
      firstValueFrom(this.roleClaimService.getRelatedEntities(query)),
    ]);

    const relatedIds = new Set((related ?? []).map((rc) => rc.claimId));
    this.roleClaimsToRelate.set(
      (toRelate ?? []).filter((c) => !!c.id && !relatedIds.has(c.id)),
    );
    this.relatedRoleClaims.set(related ?? []);
    this.selectedRoleClaimToRelateIds.set(new Set());
    this.selectedRoleClaimRelatedIds.set(new Set());
  }

  openNewRoleForm(): void {
    const defaultModuleId = this.filterModuleId() || this.allModules()[0]?.id || '';
    const defaultSubModuleId =
      this.filterSubModuleId() ||
      this.allSubModules().find((s) => s.moduleId === defaultModuleId)?.id ||
      '';
    this.editingRole.set({
      name: '',
      key: this.generateKey(),
      description: '',
      moduleId: defaultModuleId,
      subModuleId: defaultSubModuleId,
    });
    this.roleFormOpen.set(true);
  }

  openEditRoleForm(role: Role): void {
    this.editingRole.set({ ...role });
    this.roleFormOpen.set(true);
  }

  cancelRoleForm(): void {
    this.roleFormOpen.set(false);
    this.editingRole.set({});
  }

  updateRoleField(field: keyof Role, value: unknown): void {
    this.editingRole.update((curr) => {
      const next: Partial<Role> = { ...curr, [field]: value };
      if (field === 'moduleId') {
        const firstSub = this.allSubModules().find((s) => s.moduleId === value);
        next.subModuleId = firstSub?.id ?? '';
      }
      return next;
    });
  }

  async saveRole(): Promise<void> {
    const r = this.editingRole();
    if (!r.name || !r.moduleId || !r.subModuleId) {
      return;
    }
    if (r.id) {
      const updated = await firstValueFrom(this.roleService.update(r.id, r));
      this.messageService.showSuccess(`Perfil "${updated.name}" atualizado!`);
      this.selectedRole.set(updated);
    } else {
      const created = await firstValueFrom(this.roleService.create(r));
      this.messageService.showSuccess(`Perfil "${created.name}" criado com sucesso!`);
      this.selectedRole.set(created);
    }
    this.cancelRoleForm();
    const list = await firstValueFrom(this.roleService.getAll());
    this.roles.set(list ?? []);
    await this.loadSelectedRoleRelationships();
  }

  deleteRole(role: Role): void {
    if (role.system) {
      this.messageService.showWarn(
        'Perfis nativos do sistema não podem ser excluídos.',
        'Operação Bloqueada',
      );
      return;
    }
    this.messageService.confirmDelete(
      role.name,
      async () => {
        if (role.id) {
          await firstValueFrom(this.roleService.delete(role.id));
        }
        const list = await firstValueFrom(this.roleService.getAll());
        this.roles.set(list ?? []);
        if (this.selectedRole()?.id === role.id) {
          this.selectedRole.set(list[0] ?? null);
          await this.loadSelectedRoleRelationships();
        }
        this.messageService.showSuccess(`Perfil "${role.name}" excluído!`);
      },
      { doubleCheck: true },
    );
  }

  // Multi-seleção e Lote para RoleClaim (Permissões do Perfil)
  isRoleClaimToRelateSelected(claimId?: string): boolean {
    return !!claimId && this.selectedRoleClaimToRelateIds().has(claimId);
  }

  toggleRoleClaimToRelate(claimId?: string): void {
    if (!claimId) {
      return;
    }
    this.selectedRoleClaimToRelateIds.update((curr) => {
      const next = new Set(curr);
      if (next.has(claimId)) {
        next.delete(claimId);
      } else {
        next.add(claimId);
      }
      return next;
    });
  }

  areAllRoleClaimsToRelateSelected(): boolean {
    const visible = this.filteredRoleClaimsToRelate();
    return visible.length > 0 && visible.every((c) => !!c.id && this.selectedRoleClaimToRelateIds().has(c.id));
  }

  toggleSelectAllRoleClaimsToRelate(): void {
    const visible = this.filteredRoleClaimsToRelate();
    const allSelected = this.areAllRoleClaimsToRelateSelected();
    this.selectedRoleClaimToRelateIds.update((curr) => {
      const next = new Set(curr);
      for (const c of visible) {
        if (!c.id) {
          continue;
        }
        if (allSelected) {
          next.delete(c.id);
        } else {
          next.add(c.id);
        }
      }
      return next;
    });
  }

  isRoleClaimRelatedSelected(claimId?: string): boolean {
    return !!claimId && this.selectedRoleClaimRelatedIds().has(claimId);
  }

  toggleRoleClaimRelated(rc: RoleClaim): void {
    if (rc.system || !rc.claimId) {
      return;
    }
    this.selectedRoleClaimRelatedIds.update((curr) => {
      const next = new Set(curr);
      if (next.has(rc.claimId)) {
        next.delete(rc.claimId);
      } else {
        next.add(rc.claimId);
      }
      return next;
    });
  }

  areAllRoleClaimsRelatedSelected(): boolean {
    const removable = this.filteredRelatedRoleClaims().filter((rc) => !rc.system);
    return removable.length > 0 && removable.every((rc) => this.selectedRoleClaimRelatedIds().has(rc.claimId));
  }

  toggleSelectAllRoleClaimsRelated(): void {
    const removable = this.filteredRelatedRoleClaims().filter((rc) => !rc.system);
    const allSelected = this.areAllRoleClaimsRelatedSelected();
    this.selectedRoleClaimRelatedIds.update((curr) => {
      const next = new Set(curr);
      for (const rc of removable) {
        if (allSelected) {
          next.delete(rc.claimId);
        } else {
          next.add(rc.claimId);
        }
      }
      return next;
    });
  }

  async addSingleRoleClaim(claim: Claim): Promise<void> {
    const roleId = this.selectedRole()?.id;
    if (!roleId || !claim.id) {
      return;
    }
    await firstValueFrom(this.roleClaimService.addRelationship({ roleId, claimId: claim.id }));
    await this.loadSelectedRoleRelationships();
    this.messageService.showSuccess(`Permissão "${claim.claimValue}" vinculada ao perfil!`);
  }

  async addSelectedRoleClaims(): Promise<void> {
    const roleId = this.selectedRole()?.id;
    const ids = Array.from(this.selectedRoleClaimToRelateIds());
    if (!roleId || !ids.length) {
      return;
    }
    await firstValueFrom(
      this.roleClaimService.addRelationships(ids.map((claimId) => ({ roleId, claimId }))),
    );
    await this.loadSelectedRoleRelationships();
    this.messageService.showSuccess(
      `${ids.length} permissão(ões) vinculada(s) ao perfil em lote!`,
    );
  }

  async removeSingleRoleClaim(rc: RoleClaim): Promise<void> {
    if (rc.system) {
      return;
    }
    await firstValueFrom(
      this.roleClaimService.removeRelationship({ roleId: rc.roleId, claimId: rc.claimId }),
    );
    await this.loadSelectedRoleRelationships();
    this.messageService.showSuccess('Permissão removida do perfil!');
  }

  async removeSelectedRoleClaims(): Promise<void> {
    const roleId = this.selectedRole()?.id;
    const ids = Array.from(this.selectedRoleClaimRelatedIds());
    if (!roleId || !ids.length) {
      return;
    }
    await firstValueFrom(
      this.roleClaimService.removeRelationships(ids.map((claimId) => ({ roleId, claimId }))),
    );
    await this.loadSelectedRoleRelationships();
    this.messageService.showSuccess(
      `${ids.length} permissão(ões) removida(s) do perfil em lote!`,
    );
  }

  // =========================================================================
  // 3. CRUD DE PERMISSÕES (CLAIMS)
  // =========================================================================
  openNewClaimForm(): void {
    const defaultModuleId = this.filterModuleId() || this.allModules()[0]?.id || '';
    const defaultSubModuleId =
      this.filterSubModuleId() ||
      this.allSubModules().find((s) => s.moduleId === defaultModuleId)?.id ||
      '';
    this.editingClaim.set({
      claimType: '',
      claimValue: '',
      key: this.generateKey(),
      description: '',
      moduleId: defaultModuleId,
      subModuleId: defaultSubModuleId,
    });
    this.claimFormOpen.set(true);
  }

  openEditClaimForm(claim: Claim): void {
    this.editingClaim.set({ ...claim });
    this.claimFormOpen.set(true);
  }

  cancelClaimForm(): void {
    this.claimFormOpen.set(false);
    this.editingClaim.set({});
  }

  updateClaimField(field: keyof Claim, value: unknown): void {
    this.editingClaim.update((curr) => {
      const next: Partial<Claim> = { ...curr, [field]: value };
      if (field === 'moduleId') {
        const firstSub = this.allSubModules().find((s) => s.moduleId === value);
        next.subModuleId = firstSub?.id ?? '';
      }
      return next;
    });
  }

  async saveClaim(): Promise<void> {
    const c = this.editingClaim();
    if (!c.claimType || !c.claimValue || !c.moduleId || !c.subModuleId) {
      return;
    }
    if (c.id) {
      await firstValueFrom(this.claimService.update(c.id, c));
      this.messageService.showSuccess(`Permissão "${c.claimValue}" atualizada!`);
    } else {
      await firstValueFrom(this.claimService.create(c));
      this.messageService.showSuccess(`Permissão "${c.claimValue}" criada com sucesso!`);
    }
    this.cancelClaimForm();
    const list = await firstValueFrom(this.claimService.getAll());
    this.claims.set(list ?? []);
    await this.reloadActiveRelationships();
  }

  deleteClaim(claim: Claim): void {
    if (claim.system) {
      this.messageService.showWarn(
        'Permissões nativas do sistema não podem ser excluídas.',
        'Operação Bloqueada',
      );
      return;
    }
    this.messageService.confirmDelete(
      `${claim.claimType}:${claim.claimValue}`,
      async () => {
        if (claim.id) {
          await firstValueFrom(this.claimService.delete(claim.id));
        }
        const list = await firstValueFrom(this.claimService.getAll());
        this.claims.set(list ?? []);
        await this.reloadActiveRelationships();
        this.messageService.showSuccess('Permissão excluída com sucesso!');
      },
      { doubleCheck: true },
    );
  }
}
