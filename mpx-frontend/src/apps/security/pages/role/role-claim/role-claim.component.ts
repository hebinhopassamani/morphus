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
import { Role } from '@security/entities/role';
import { RoleClaim } from '@security/entities/role-claim';
import { SubModule } from '@security/entities/sub-module';
import { ClaimService } from '@security/services/claim.service';
import { ModuleService } from '@security/services/module.service';
import { RoleClaimService } from '@security/services/role-claim.service';
import { RoleService } from '@security/services/role.service';
import { SubModuleService } from '@security/services/sub-module.service';

@Component({
  selector: 'mpx-role-claim-nxn',
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
  styleUrl: './role-claim.component.css',
  templateUrl: './role-claim.component.html',
})
export class RoleClaimComponent
  extends MorphusNxNComponent<RoleClaim, Claim>
  implements IMorphusNxNComponent, OnInit, OnDestroy
{
  private readonly roleService = inject(RoleService);
  private readonly claimService = inject(ClaimService);
  private readonly applicationService = inject(ApplicationService);
  private readonly moduleService = inject(ModuleService);
  private readonly subModuleService = inject(SubModuleService);
  public readonly roleClaimService = inject(RoleClaimService);

  protected readonly roleId = signal<string>('');
  protected readonly role = signal<Role | null>(null);

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
    const relatedClaimIds = new Set(this.relatedEntities().map((rc) => rc.claimId));

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

    return this.relatedEntities().filter((rc) => {
      if (appId && rc.claim?.module?.applicationId !== appId) {
        return false;
      }
      if (modId && rc.claim?.moduleId !== modId) {
        return false;
      }
      if (subId && rc.claim?.subModuleId !== subId) {
        return false;
      }
      if (!term) {
        return true;
      }
      return (
        (rc.claim?.claimType ?? '').toLowerCase().includes(term) ||
        (rc.claim?.claimValue ?? '').toLowerCase().includes(term) ||
        (rc.claim?.description ?? '').toLowerCase().includes(term) ||
        (rc.claim?.module?.name ?? '').toLowerCase().includes(term) ||
        (rc.claim?.subModule?.name ?? '').toLowerCase().includes(term)
      );
    });
  });

  constructor() {
    super();
    this.addPk('roleId').addPk('claimId');
  }

  ngOnInit(): void {
    const id = this.activatedRoute.snapshot.paramMap.get('id') ?? '';
    this.roleId.set(id);
    this.title1.set('Configurar Permissões do Perfil');
    this.title2.set(
      'Marque múltiplas permissões (ou todas) para transferir de um lado para o outro de uma só vez.',
    );
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
    const id = this.roleId();
    if (!id) {
      return;
    }

    const [loadedRole, apps, mods, subMods, claimsCatalog] = await Promise.all([
      firstValueFrom(this.roleService.getById(id)),
      firstValueFrom(this.applicationService.getList()),
      firstValueFrom(this.moduleService.getAll()),
      firstValueFrom(this.subModuleService.getAll()),
      firstValueFrom(this.claimService.getAll()),
    ]);

    const modMap = new Map((mods ?? []).map((m) => [m.id, m]));
    const embeddedSubs = (mods ?? []).flatMap((m) => m.subModules ?? []);
    const mergedSubsMap = new Map<string, SubModule>();
    for (const s of [...embeddedSubs, ...(subMods ?? [])]) {
      if (s?.id) {
        mergedSubsMap.set(s.id, s);
      }
    }
    const mergedSubs = Array.from(mergedSubsMap.values());
    const subMap = new Map(mergedSubs.map((s) => [s.id, s]));

    const enrichedRole: Role = {
      ...loadedRole,
      module: loadedRole.module ?? (loadedRole.moduleId ? modMap.get(loadedRole.moduleId) : undefined),
      subModule:
        loadedRole.subModule ??
        (loadedRole.subModuleId ? subMap.get(loadedRole.subModuleId) : undefined),
    };

    this.role.set(enrichedRole);
    this.title1.set(`Permissões do Perfil: ${enrichedRole.name}`);
    this.applications.set(apps ?? []);
    this.allModules.set(mods ?? []);
    this.allSubModules.set(mergedSubs);

    const enrichedClaims = (claimsCatalog ?? []).map((c) => ({
      ...c,
      module: c.module ?? (c.moduleId ? modMap.get(c.moduleId) : undefined),
      subModule: c.subModule ?? (c.subModuleId ? subMap.get(c.subModuleId) : undefined),
    }));
    this.allClaims.set(enrichedClaims);

    await this.loadRelationships();
  }

  async loadRelationships(): Promise<void> {
    const roleId = this.roleId();
    if (!roleId) {
      return;
    }

    const query: Record<string, string> = { roleId };
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

    const claimMap = new Map(this.allClaims().map((c) => [c.id, c]));
    const enrichedRelated = (related ?? [])
      .filter((rc) => !rc.roleId || rc.roleId === roleId)
      .map((rc) => ({
        ...rc,
        roleId: rc.roleId || roleId,
        claim: rc.claim
          ? {
              ...claimMap.get(rc.claimId),
              ...rc.claim,
              module: rc.claim.module ?? claimMap.get(rc.claimId)?.module,
              subModule: rc.claim.subModule ?? claimMap.get(rc.claimId)?.subModule,
            }
          : claimMap.get(rc.claimId),
      }))
      .sort((a, b) => {
        const keyA = `${a.claim?.claimType ?? ''}:${a.claim?.claimValue ?? ''}`;
        const keyB = `${b.claim?.claimType ?? ''}:${b.claim?.claimValue ?? ''}`;
        return keyA.localeCompare(keyB, 'pt-BR');
      });

    const relatedClaimIds = new Set(enrichedRelated.map((rc) => rc.claimId));
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
    const roleId = this.roleId();
    if (!roleId || !claim.id) {
      return;
    }

    // Transferência visual imediata para o TOPO da lista da direita com piscadinha
    this.flashTransferred([claim.id]);
    this.entitiesToRelate.update((list) => list.filter((c) => c.id !== claim.id));
    this.relatedEntities.update((list) => [
      {
        corporationId: claim.corporationId ?? '',
        roleId,
        claimId: claim.id!,
        claim,
        system: false,
        inactive: false,
      },
      ...list,
    ]);
    this.showAutoToast(`Permissão "${claim.claimType}:${claim.claimValue}" vinculada`);

    await firstValueFrom(this.roleClaimService.addRelationship({ roleId, claimId: claim.id }));
  }

  async addSelectedClaims(): Promise<void> {
    const roleId = this.roleId();
    const selected = this.getSelectedToRelateEntities();
    if (!roleId || !selected.length) {
      return;
    }

    const selectedIds = new Set(selected.map((c) => c.id).filter((id): id is string => !!id));
    this.flashTransferred(Array.from(selectedIds));
    this.entitiesToRelate.update((list) => list.filter((c) => !c.id || !selectedIds.has(c.id)));
    this.relatedEntities.update((list) => [
      ...selected.map((claim) => ({
        corporationId: claim.corporationId ?? '',
        roleId,
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
      this.roleClaimService.addRelationships(
        selected.map((c) => ({ roleId, claimId: c.id! })),
      ),
    );
  }

  async removeSingleClaim(rel: RoleClaim): Promise<void> {
    if (rel.system) {
      return;
    }

    this.flashTransferred([rel.claimId]);
    this.relatedEntities.update((list) => list.filter((rc) => rc.claimId !== rel.claimId));
    if (rel.claim) {
      this.entitiesToRelate.update((list) => [rel.claim!, ...list]);
    }
    this.showAutoToast(`Permissão removida`);

    await firstValueFrom(
      this.roleClaimService.removeRelationship({ roleId: rel.roleId, claimId: rel.claimId }),
    );
  }

  async removeSelectedClaims(): Promise<void> {
    const selected = this.getSelectedRelatedEntities();
    if (!selected.length) {
      return;
    }

    const removedIds = new Set(selected.map((rc) => rc.claimId));
    this.flashTransferred(Array.from(removedIds));
    const restoredClaims = selected.map((rc) => rc.claim).filter((c): c is Claim => !!c);
    this.relatedEntities.update((list) => list.filter((rc) => !removedIds.has(rc.claimId)));
    this.entitiesToRelate.update((list) => [...restoredClaims, ...list]);
    this.clearRelatedSelection();
    this.showAutoToast(`${selected.length} permissão(ões) removida(s)`);

    await firstValueFrom(
      this.roleClaimService.removeRelationships(
        selected.map((rc) => ({ roleId: rc.roleId, claimId: rc.claimId })),
      ),
    );
  }

  editRole(): void {
    const id = this.roleId();
    if (id) {
      void this.router.navigate(['/security/role', id]);
    }
  }

  back(): void {
    void this.router.navigate(['/security/role']);
  }
}
