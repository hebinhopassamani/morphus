import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatFormField, MatInput, MatLabel, MatPrefix, MatSuffix } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatTooltip } from '@angular/material/tooltip';
import { IMorphusListComponent, MorphusFilter, MorphusListComponent } from '@core/mpx-base';
import { MpxFilterComponent } from '@/components/morphus/filter';
import { MorphusApplication } from '@morphus/entities/application';
import { ApplicationService } from '@morphus/services/application.service';
import { IModule } from '@security/entities/module';
import { ModuleFilterService } from '@security/services/module.filter.service';
import { ModuleService } from '@security/services/module.service';

@Component({
  selector: 'mpx-module-list',
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
    MpxFilterComponent,
  ],
  styleUrl: './module-list.component.css',
  templateUrl: './module-list.component.html',
})
export class ModuleListComponent
  extends MorphusListComponent<IModule>
  implements IMorphusListComponent, OnInit, OnDestroy
{
  protected readonly moduleFilterService = inject(ModuleFilterService);
  private readonly moduleService = inject(ModuleService);
  private readonly applicationService = inject(ApplicationService);

  protected search = '';
  protected selectedApplicationId = '';
  protected readonly applications = signal<MorphusApplication[]>([]);
  private cachedModules: IModule[] = [];

  protected readonly displayedColumns = [
    'name',
    'application',
    'subModulesCount',
    'key',
    'description',
    'origin',
    'actions',
  ];

  ngOnInit(): void {
    this.primaryKeys = ['id'];
    this.title1.set('Módulos do Sistema');
    this.title2.set(
      'Gerencie os módulos das aplicações e acesse um módulo para cadastrar seus submódulos.',
    );
    void this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.destroySubscriptions();
  }

  private async loadInitialData(): Promise<void> {
    try {
      const apps = await firstValueFrom(this.applicationService.getList());
      this.applications.set(apps ?? []);
    } catch {
      this.applications.set([]);
    }
    await this.loadList();
  }

  async loadList(_filter?: MorphusFilter): Promise<void> {
    if (this.cachedModules.length === 0) {
      this.cachedModules = await firstValueFrom(this.moduleService.getModules());
    }

    let allModules = this.cachedModules;

    if (this.selectedApplicationId) {
      allModules = allModules.filter((m) => m.applicationId === this.selectedApplicationId);
    }

    const term = this.search.toLowerCase().trim();
    const searched = term
      ? allModules.filter(
          (item) =>
            item.name.toLowerCase().includes(term) ||
            item.key.toLowerCase().includes(term) ||
            (item.application?.name ?? '').toLowerCase().includes(term) ||
            (item.description ?? '').toLowerCase().includes(term),
        )
      : allModules;

    const activeRows = this.moduleFilterService
      .filterRows()
      .filter(
        (r) =>
          r.column?.name !== undefined &&
          r.operator?.key !== undefined &&
          r.value !== undefined &&
          r.value !== '',
      );

    if (activeRows.length === 0) {
      this.setList(searched);
      return;
    }

    const filtered = searched.filter((item) => {
      let result = true;
      let pendingAndOr: 'And' | 'Or' | undefined = undefined;

      for (const row of activeRows) {
        const colName = row.column.name as keyof IModule;
        const itemVal = item[colName];
        const filterVal = row.value;
        let matches = false;

        if (row.column.dataType === 'boolean') {
          matches = Boolean(itemVal) === Boolean(filterVal);
        } else {
          const a = String(itemVal ?? '').toLowerCase();
          const b = String(filterVal ?? '').toLowerCase();
          switch (row.operator.key) {
            case 'EQUAL':
              matches = a === b;
              break;
            case 'NOT_EQUAL':
              matches = a !== b;
              break;
            case 'LIKE_WITH':
              matches = a.includes(b);
              break;
            case 'START_WITH':
              matches = a.startsWith(b);
              break;
            case 'END_WITH':
              matches = a.endsWith(b);
              break;
            default:
              matches = a === b;
              break;
          }
        }

        if (pendingAndOr === 'Or') {
          result = result || matches;
        } else if (pendingAndOr === 'And') {
          result = result && matches;
        } else {
          result = matches;
        }

        pendingAndOr = row.andOr;
      }

      return result;
    });

    this.setList(filtered);
  }

  newEntity(): void {
    void this.router.navigate(['new'], { relativeTo: this.activatedRoute });
  }

  editEntity(entity: IModule): void {
    void this.router.navigate([entity.id], { relativeTo: this.activatedRoute });
  }

  openSubModules(entity: IModule): void {
    void this.router.navigate([entity.id], {
      relativeTo: this.activatedRoute,
      queryParams: { tab: 'submodules' },
    });
  }

  deleteEntity(entity: IModule): void {
    if (entity.system) {
      this.messageService.showWarn(
        'Módulos nativos do sistema não podem ser excluídos.',
        'Operação Bloqueada',
      );
      return;
    }
    this.messageService.confirmDelete(
      entity.name,
      async () => {
        if (entity.id) {
          await firstValueFrom(this.moduleService.delete(entity.id));
        }
        this.cachedModules = this.cachedModules.filter((m) => m.id !== entity.id);
        this.setList(this.list().filter((m) => m.id !== entity.id));
        setTimeout(() => {
          this.messageService.showSuccess(`O módulo "${entity.name}" foi excluído com sucesso!`);
        }, 150);
      },
      {
        doubleCheck: true,
      },
    );
  }

  openFilter(): void {
    this.moduleFilterService.openFilter();
  }

  async onFilter(): Promise<void> {
    await this.loadList(this.moduleFilterService.filter());
  }

  async onFilterClear(): Promise<void> {
    this.search = '';
    this.selectedApplicationId = '';
    this.moduleFilterService.clearFilter();
    await this.loadList();
  }

  onFilterClose(): void {
    this.moduleFilterService.closeFilter();
  }
}
