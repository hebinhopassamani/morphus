import { computed, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatFormField, MatInput, MatLabel, MatPrefix, MatSuffix } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatTooltip } from '@angular/material/tooltip';
import { IMorphusListComponent, MorphusFilter, MorphusListComponent } from '@core/mpx-base';
import { MorphusApplication } from '@morphus/entities/application';
import { ApplicationService } from '@morphus/services/application.service';
import { Claim } from '@security/entities/claim';
import { Module } from '@security/entities/module';
import { SubModule } from '@security/entities/sub-module';
import { ClaimService } from '@security/services/claim.service';
import { ModuleService } from '@security/services/module.service';
import { SubModuleService } from '@security/services/sub-module.service';

@Component({
  selector: 'mpx-claim-list',
  standalone: true,
  imports: [
    FormsModule,
    MatButton,
    MatIconButton,
    MatFormField,
    MatLabel,
    MatInput,
    MatPrefix,
    MatSuffix,
    MatIcon,
    MatSelect,
    MatOption,
    MatTooltip,
  ],
  styleUrl: './claim-list.component.css',
  templateUrl: './claim-list.component.html',
})
export class ClaimListComponent
  extends MorphusListComponent<Claim>
  implements IMorphusListComponent, OnInit, OnDestroy
{
  private readonly claimService = inject(ClaimService);
  private readonly applicationService = inject(ApplicationService);
  private readonly moduleService = inject(ModuleService);
  private readonly subModuleService = inject(SubModuleService);

  protected search = '';
  protected readonly selectedApplicationId = signal<string>('');
  protected readonly selectedModuleId = signal<string>('');
  protected readonly selectedSubModuleId = signal<string>('');

  protected readonly applications = signal<MorphusApplication[]>([]);
  protected readonly allModules = signal<Module[]>([]);
  protected readonly allSubModules = signal<SubModule[]>([]);
  private cachedClaims: Claim[] = [];

  protected readonly availableModules = computed(() => {
    const appId = this.selectedApplicationId();
    const list = this.allModules();
    return appId ? list.filter((m) => m.applicationId === appId) : list;
  });

  protected readonly availableSubModules = computed(() => {
    const modId = this.selectedModuleId();
    const list = this.allSubModules();
    return modId ? list.filter((s) => s.moduleId === modId) : list;
  });

  protected readonly displayedColumns = [
    'claimType',
    'claimValue',
    'scope',
    'key',
    'description',
    'origin',
    'actions',
  ];

  ngOnInit(): void {
    this.primaryKeys = ['id'];
    this.title1.set('Catálogo de Permissões (Claims)');
    this.title2.set(
      'Gerencie as permissões granulares por módulo e submódulo para proteger endpoints e telas.',
    );
    void this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.destroySubscriptions();
  }

  private async loadInitialData(): Promise<void> {
    const [apps, mods, subMods, claims] = await Promise.all([
      firstValueFrom(this.applicationService.getList()),
      firstValueFrom(this.moduleService.getAll()),
      firstValueFrom(this.subModuleService.getAll()),
      firstValueFrom(this.claimService.getAll()),
    ]);

    const embeddedSubs = (mods ?? []).flatMap((m) => m.subModules ?? []);
    const mergedSubsMap = new Map<string, SubModule>();
    for (const s of [...embeddedSubs, ...(subMods ?? [])]) {
      if (s?.id) {
        mergedSubsMap.set(s.id, s);
      }
    }
    const mergedSubs = Array.from(mergedSubsMap.values());

    this.applications.set(apps ?? []);
    this.allModules.set(mods ?? []);
    this.allSubModules.set(mergedSubs);

    const modMap = new Map((mods ?? []).map((m) => [m.id, m]));
    const subMap = new Map(mergedSubs.map((s) => [s.id, s]));

    this.cachedClaims = (claims ?? []).map((c) => ({
      ...c,
      module: c.module ?? (c.moduleId ? modMap.get(c.moduleId) : undefined),
      subModule: c.subModule ?? (c.subModuleId ? subMap.get(c.subModuleId) : undefined),
    }));

    await this.loadList();
  }

  async loadList(_filter?: MorphusFilter): Promise<void> {
    let items = this.cachedClaims;
    const appId = this.selectedApplicationId();
    const modId = this.selectedModuleId();
    const subId = this.selectedSubModuleId();

    if (appId) {
      items = items.filter((c) => c.module?.applicationId === appId);
    }
    if (modId) {
      items = items.filter((c) => c.moduleId === modId);
    }
    if (subId) {
      items = items.filter((c) => c.subModuleId === subId);
    }

    const term = this.search.toLowerCase().trim();
    if (term) {
      items = items.filter(
        (c) =>
          (c.claimType ?? '').toLowerCase().includes(term) ||
          (c.claimValue ?? '').toLowerCase().includes(term) ||
          (c.key ?? '').toLowerCase().includes(term) ||
          (c.description ?? '').toLowerCase().includes(term) ||
          (c.module?.name ?? '').toLowerCase().includes(term) ||
          (c.subModule?.name ?? '').toLowerCase().includes(term),
      );
    }

    this.setList(items);
  }

  onApplicationChange(appId: string): void {
    this.selectedApplicationId.set(appId);
    this.selectedModuleId.set('');
    this.selectedSubModuleId.set('');
    void this.loadList();
  }

  async onModuleChange(modId: string): Promise<void> {
    this.selectedModuleId.set(modId);
    this.selectedSubModuleId.set('');
    if (modId) {
      const existing = this.allSubModules().filter((s) => s.moduleId === modId);
      if (existing.length === 0) {
        const fetched = (await firstValueFrom(this.subModuleService.getByModuleId(modId))) ?? [];
        if (fetched.length > 0) {
          this.allSubModules.update((curr) => [...curr, ...fetched]);
        }
      }
    }
    await this.loadList();
  }

  onSubModuleChange(subId: string): void {
    this.selectedSubModuleId.set(subId);
    void this.loadList();
  }

  newEntity(): void {
    void this.router.navigate(['new'], { relativeTo: this.activatedRoute });
  }

  editEntity(entity: Claim): void {
    void this.router.navigate([entity.id], { relativeTo: this.activatedRoute });
  }

  deleteEntity(entity: Claim): void {
    if (entity.system) {
      this.messageService.showWarn(
        'Permissões nativas do sistema não podem ser excluídas.',
        'Operação Bloqueada',
      );
      return;
    }

    this.messageService.confirmDelete(
      `${entity.claimType}:${entity.claimValue}`,
      async () => {
        if (entity.id) {
          await firstValueFrom(this.claimService.delete(entity.id));
        }
        this.cachedClaims = this.cachedClaims.filter((c) => c.id !== entity.id);
        this.setList(this.list().filter((c) => c.id !== entity.id));
        setTimeout(() => {
          this.messageService.showSuccess(
            `A permissão "${entity.claimType}:${entity.claimValue}" foi excluída!`,
          );
        }, 150);
      },
      { doubleCheck: true },
    );
  }

  openFilter(): void {}

  async onFilter(): Promise<void> {
    await this.loadList();
  }

  async onFilterClear(): Promise<void> {
    this.search = '';
    this.selectedApplicationId.set('');
    this.selectedModuleId.set('');
    this.selectedSubModuleId.set('');
    await this.loadList();
  }

  onFilterClose(): void {}
}
