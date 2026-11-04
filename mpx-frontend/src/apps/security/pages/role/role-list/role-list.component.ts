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
import { Module } from '@security/entities/module';
import { Role } from '@security/entities/role';
import { SubModule } from '@security/entities/sub-module';
import { ModuleService } from '@security/services/module.service';
import { RoleService } from '@security/services/role.service';
import { SubModuleService } from '@security/services/sub-module.service';

@Component({
  selector: 'mpx-role-list',
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
  styleUrl: './role-list.component.css',
  templateUrl: './role-list.component.html',
})
export class RoleListComponent
  extends MorphusListComponent<Role>
  implements IMorphusListComponent, OnInit, OnDestroy
{
  private readonly roleService = inject(RoleService);
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
  private cachedRoles: Role[] = [];

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
    'name',
    'scope',
    'claimsShortcut',
    'key',
    'description',
    'origin',
    'actions',
  ];

  ngOnInit(): void {
    this.primaryKeys = ['id'];
    this.title1.set('Perfis de Acesso (Roles)');
    this.title2.set(
      'Gerencie os perfis de acesso da corporação e configure as permissões (Claims) vinculadas a cada perfil.',
    );
    void this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.destroySubscriptions();
  }

  private async loadInitialData(): Promise<void> {
    const [apps, mods, subMods, roles] = await Promise.all([
      firstValueFrom(this.applicationService.getList()),
      firstValueFrom(this.moduleService.getAll()),
      firstValueFrom(this.subModuleService.getAll()),
      firstValueFrom(this.roleService.getAll()),
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

    this.cachedRoles = (roles ?? []).map((r) => ({
      ...r,
      module: r.module ?? (r.moduleId ? modMap.get(r.moduleId) : undefined),
      subModule: r.subModule ?? (r.subModuleId ? subMap.get(r.subModuleId) : undefined),
    }));

    await this.loadList();
  }

  async loadList(_filter?: MorphusFilter): Promise<void> {
    let items = this.cachedRoles;
    const appId = this.selectedApplicationId();
    const modId = this.selectedModuleId();
    const subId = this.selectedSubModuleId();

    if (appId) {
      items = items.filter((r) => r.module?.applicationId === appId);
    }
    if (modId) {
      items = items.filter((r) => r.moduleId === modId);
    }
    if (subId) {
      items = items.filter((r) => r.subModuleId === subId);
    }

    const term = this.search.toLowerCase().trim();
    if (term) {
      items = items.filter(
        (r) =>
          (r.name ?? '').toLowerCase().includes(term) ||
          (r.key ?? '').toLowerCase().includes(term) ||
          (r.description ?? '').toLowerCase().includes(term) ||
          (r.module?.name ?? '').toLowerCase().includes(term) ||
          (r.subModule?.name ?? '').toLowerCase().includes(term),
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

  editEntity(entity: Role): void {
    void this.router.navigate([entity.id], { relativeTo: this.activatedRoute });
  }

  configureClaims(entity: Role): void {
    void this.router.navigate([entity.id, 'claims'], { relativeTo: this.activatedRoute });
  }

  deleteEntity(entity: Role): void {
    if (entity.system) {
      this.messageService.showWarn(
        'Perfis nativos do sistema não podem ser excluídos.',
        'Operação Bloqueada',
      );
      return;
    }

    this.messageService.confirmDelete(
      entity.name,
      async () => {
        if (entity.id) {
          await firstValueFrom(this.roleService.delete(entity.id));
        }
        this.cachedRoles = this.cachedRoles.filter((r) => r.id !== entity.id);
        this.setList(this.list().filter((r) => r.id !== entity.id));
        setTimeout(() => {
          this.messageService.showSuccess(`O perfil "${entity.name}" foi excluído com sucesso!`);
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
