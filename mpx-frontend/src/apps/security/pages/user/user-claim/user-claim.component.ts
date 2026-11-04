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
import { Claim } from '@security/entities/claim';
import { Module } from '@security/entities/module';
import { SubModule } from '@security/entities/sub-module';
import { User } from '@security/entities/user';
import { UserClaim } from '@security/entities/user-claim';
import { ClaimService } from '@security/services/claim.service';
import { ModuleService } from '@security/services/module.service';
import { SubModuleService } from '@security/services/sub-module.service';
import { UserClaimService } from '@security/services/user-claim.service';
import { UserService } from '@security/services/user.service';

@Component({
  selector: 'mpx-user-claim-nxn',
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
  styleUrl: './user-claim.component.css',
  templateUrl: './user-claim.component.html',
})
export class UserClaimComponent
  extends MorphusNxNComponent<UserClaim, Claim>
  implements IMorphusNxNComponent, OnInit, OnDestroy
{
  private readonly userService = inject(UserService);
  private readonly claimService = inject(ClaimService);
  private readonly applicationService = inject(ApplicationService);
  private readonly moduleService = inject(ModuleService);
  private readonly subModuleService = inject(SubModuleService);
  public readonly userClaimService = inject(UserClaimService);

  protected readonly userId = signal<string>('');
  protected readonly user = signal<User | null>(null);

  protected readonly applications = signal<MorphusApplication[]>([]);
  protected readonly allModules = signal<Module[]>([]);
  protected readonly allSubModules = signal<SubModule[]>([]);
  protected readonly allClaims = signal<Claim[]>([]);

  protected readonly filterApplicationId = signal<string>('');
  protected readonly filterModuleId = signal<string>('');
  protected readonly filterSubModuleId = signal<string>('');

  protected readonly searchToRelate = signal<string>('');
  protected readonly searchRelated = signal<string>('');

  protected readonly recentlyTransferredIds = signal<Set<string>>(new Set());

  protected isRecentlyTransferred(claimId?: string): boolean {
    return !!claimId && this.recentlyTransferredIds().has(claimId);
  }

  protected flashTransferred(ids: string[]): void {
    // Limpa e aplica no próximo microtask para re-disparar a animação CSS @keyframes mpx-row-flash
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

  protected readonly filteredClaimsToRelate = computed(() => {
    const term = this.searchToRelate().toLowerCase().trim();
    const appId = this.filterApplicationId();
    const modId = this.filterModuleId();
    const subId = this.filterSubModuleId();
    const relatedClaimIds = new Set(this.relatedEntities().map((uc) => uc.claimId));

    return this.entitiesToRelate().filter((c) => {
      if (!c.id || relatedClaimIds.has(c.id)) {
        return false;
      }
      if (appId && c.module?.applicationId !== appId) {
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
        (c.description ?? '').toLowerCase().includes(term) ||
        (c.key ?? '').toLowerCase().includes(term) ||
        (c.module?.name ?? '').toLowerCase().includes(term) ||
        (c.subModule?.name ?? '').toLowerCase().includes(term)
      );
    });
  });

  protected readonly filteredRelatedClaims = computed(() => {
    const term = this.searchRelated().toLowerCase().trim();
    const appId = this.filterApplicationId();
    const modId = this.filterModuleId();
    const subId = this.filterSubModuleId();

    return this.relatedEntities().filter((uc) => {
      if (appId && uc.claim?.module?.applicationId !== appId) {
        return false;
      }
      if (modId && uc.claim?.moduleId !== modId) {
        return false;
      }
      if (subId && uc.claim?.subModuleId !== subId) {
        return false;
      }
      if (!term) {
        return true;
      }
      return (
        (uc.claim?.claimType ?? '').toLowerCase().includes(term) ||
        (uc.claim?.claimValue ?? '').toLowerCase().includes(term) ||
        (uc.claim?.description ?? '').toLowerCase().includes(term) ||
        (uc.claim?.module?.name ?? '').toLowerCase().includes(term) ||
        (uc.claim?.subModule?.name ?? '').toLowerCase().includes(term)
      );
    });
  });

  constructor() {
    super();
    this.addPk('userId').addPk('claimId');
  }

  ngOnInit(): void {
    const id = this.activatedRoute.snapshot.paramMap.get('id') ?? '';
    this.userId.set(id);
    this.title1.set('Configurar Permissões do Usuário');
    this.title2.set('Conceda ou remova permissões diretas (Claims) para este usuário.');
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

    const [loadedUserById, allUsers, apps, mods, subMods, claimsCatalog] = await Promise.all([
      firstValueFrom(this.userService.getById(id)).catch(() => null),
      firstValueFrom(this.userService.getAll()).catch(() => []),
      firstValueFrom(this.applicationService.getList()).catch(() => []),
      firstValueFrom(this.moduleService.getAll()).catch(() => []),
      firstValueFrom(this.subModuleService.getAll()).catch(() => []),
      firstValueFrom(this.claimService.getAll()).catch(() => []),
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
    this.title1.set(`Permissões Diretas de ${loadedUser?.name || loadedUser?.email || 'Usuário'}`);
    this.applications.set(apps ?? []);
    this.allModules.set(mods ?? []);
    this.allSubModules.set(mergedSubs);

    const modMap = new Map((mods ?? []).map((m) => [m.id, m]));
    const subMap = new Map(mergedSubs.map((s) => [s.id, s]));
    const enrichedClaims = (claimsCatalog ?? []).map((c) => ({
      ...c,
      module: c.module ?? (c.moduleId ? modMap.get(c.moduleId) : undefined),
      subModule: c.subModule ?? (c.subModuleId ? subMap.get(c.subModuleId) : undefined),
    }));
    this.allClaims.set(enrichedClaims);

    await this.loadRelationships();
  }

  async loadRelationships(): Promise<void> {
    const userId = this.userId();
    if (!userId) {
      return;
    }

    const query: Record<string, string> = { userId };

    const [toRelate, related] = await Promise.all([
      firstValueFrom(this.userClaimService.getEntitiesToRelate(query)).catch(() => []),
      firstValueFrom(this.userClaimService.getRelatedEntities(query)).catch(() => []),
    ]);

    const claimMap = new Map(this.allClaims().map((c) => [c.id, c]));
    const toRelateIds = new Set((toRelate ?? []).map((c) => c.id));

    const enrichedRelatedMap = new Map<string, UserClaim>();
    for (const uc of related ?? []) {
      if (uc.userId && uc.userId !== userId) {
        continue;
      }
      const catalogClaim = claimMap.get(uc.claimId);
      enrichedRelatedMap.set(uc.claimId, {
        ...uc,
        userId: uc.userId || userId,
        claim: uc.claim
          ? {
              ...catalogClaim,
              ...uc.claim,
              module: uc.claim.module ?? catalogClaim?.module,
              subModule: uc.claim.subModule ?? catalogClaim?.subModule,
            }
          : catalogClaim,
      });
    }

    // Se a API não retornou vínculos em related-entities por filtro de tenant do User na Filial,
    // reconstrói os vínculos a partir do catálogo (tudo que existe em allClaims e não está em toRelate está vinculado!)
    if (toRelate && this.allClaims().length > 0) {
      for (const claim of this.allClaims()) {
        if (claim.id && !toRelateIds.has(claim.id) && !enrichedRelatedMap.has(claim.id)) {
          enrichedRelatedMap.set(claim.id, {
            corporationId: claim.corporationId ?? '',
            userId,
            claimId: claim.id,
            claim,
            system: false,
            inactive: false,
          });
        }
      }
    }

    const enrichedRelated = Array.from(enrichedRelatedMap.values()).sort((a, b) => {
      const keyA = `${a.claim?.claimType ?? ''}:${a.claim?.claimValue ?? ''}`;
      const keyB = `${b.claim?.claimType ?? ''}:${b.claim?.claimValue ?? ''}`;
      return keyA.localeCompare(keyB, 'pt-BR');
    });
    const relatedClaimIds = new Set(enrichedRelated.map((uc) => uc.claimId));
    const enrichedToRelate = (toRelate ?? [])
      .filter((c) => !!c.id && !relatedClaimIds.has(c.id))
      .map((c) => ({
        ...claimMap.get(c.id),
        ...c,
        module: c.module ?? claimMap.get(c.id)?.module,
        subModule: c.subModule ?? claimMap.get(c.id)?.subModule,
      }))
      .sort((a, b) => {
        const keyA = `${a.claimType ?? ''}:${a.claimValue ?? ''}`;
        const keyB = `${b.claimType ?? ''}:${b.claimValue ?? ''}`;
        return keyA.localeCompare(keyB, 'pt-BR');
      });

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

  async addSingleClaim(claim: Claim): Promise<void> {
    const userId = this.userId();
    if (!userId || !claim.id) {
      return;
    }

    // Transferência visual imediata para o TOPO da lista da direita com piscadinha
    this.flashTransferred([claim.id]);
    this.entitiesToRelate.update((list) => list.filter((c) => c.id !== claim.id));
    this.relatedEntities.update((list) => [
      {
        corporationId: claim.corporationId ?? '',
        userId,
        claimId: claim.id!,
        claim,
        system: false,
        inactive: false,
      },
      ...list,
    ]);
    this.showAutoToast(`Permissão "${claim.claimType}:${claim.claimValue}" vinculada`);

    await firstValueFrom(this.userClaimService.addRelationship({ userId, claimId: claim.id }));
  }

  async addSelectedClaims(): Promise<void> {
    const userId = this.userId();
    const selected = this.getSelectedToRelateEntities();
    if (!userId || !selected.length) {
      return;
    }

    const selectedIds = new Set(selected.map((c) => c.id).filter((id): id is string => !!id));
    this.flashTransferred(Array.from(selectedIds));
    this.entitiesToRelate.update((list) => list.filter((c) => !c.id || !selectedIds.has(c.id)));
    this.relatedEntities.update((list) => [
      ...selected.map((claim) => ({
        corporationId: claim.corporationId ?? '',
        userId,
        claimId: claim.id!,
        claim,
        system: false,
        inactive: false,
      })),
      ...list,
    ]);
    this.clearToRelateSelection();
    this.showAutoToast(`${selected.length} permissão(ões) vinculada(s)`);

    await firstValueFrom(
      this.userClaimService.addRelationships(
        selected.map((c) => ({ userId, claimId: c.id! })),
      ),
    );
  }

  async removeSingleClaim(rel: UserClaim): Promise<void> {
    if (rel.system) {
      return;
    }

    this.flashTransferred([rel.claimId]);
    this.relatedEntities.update((list) => list.filter((uc) => uc.claimId !== rel.claimId));
    if (rel.claim) {
      this.entitiesToRelate.update((list) => [rel.claim!, ...list]);
    }
    this.showAutoToast(`Permissão removida`);

    await firstValueFrom(
      this.userClaimService.removeRelationship({ userId: rel.userId, claimId: rel.claimId }),
    );
  }

  async removeSelectedClaims(): Promise<void> {
    const selected = this.getSelectedRelatedEntities();
    if (!selected.length) {
      return;
    }

    const removedIds = new Set(selected.map((uc) => uc.claimId));
    this.flashTransferred(Array.from(removedIds));
    const restoredClaims = selected.map((uc) => uc.claim).filter((c): c is Claim => !!c);
    this.relatedEntities.update((list) => list.filter((uc) => !removedIds.has(uc.claimId)));
    this.entitiesToRelate.update((list) => [...restoredClaims, ...list]);
    this.clearRelatedSelection();
    this.showAutoToast(`${selected.length} permissão(ões) removida(s)`);

    await firstValueFrom(
      this.userClaimService.removeRelationships(
        selected.map((uc) => ({ userId: uc.userId, claimId: uc.claimId })),
      ),
    );
  }

  goToUserRoles(): void {
    const id = this.userId();
    if (id) {
      void this.router.navigate(['/security/user', id, 'roles']);
    }
  }

  back(): void {
    void this.router.navigate(['/security/user']);
  }
}
