import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatFormField, MatInput, MatPrefix, MatSuffix } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { IMorphusListComponent, MorphusFilter, MorphusListComponent } from '@core/mpx-base';
import { IModule } from '@security/entities/module';
import { ModuleFilterService } from '@security/services/module.filter.service';
import { MpxFilterComponent } from '@/components/morphus/filter';

@Component({
  selector: 'mpx-module-list',
  standalone: true,
  imports: [
    FormsModule,
    MatTableModule,
    MatButton,
    MatIconButton,
    MatDivider,
    MatFormField,
    MatInput,
    MatPrefix,
    MatSuffix,
    MatIcon,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
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
  protected search = '';

  protected readonly displayedColumns = ['name', 'key', 'description', 'origin', 'actions'];

  ngOnInit(): void {
    this.primaryKeys = ['id'];
    this.title1.set('Módulos do Sistema');
    this.title2.set('Gerencie os módulos e chaves de acesso das aplicações do seu Workspace.');
    void this.loadList();
  }

  ngOnDestroy(): void {
    this.destroySubscriptions();
  }

  async loadList(_filter?: MorphusFilter): Promise<void> {
    const allModules: IModule[] = [
      {
        id: '1',
        name: 'Usuários',
        key: 'USER',
        description: 'Gestão de contas de usuários, papéis e permissões',
        system: true,
        corporationId: '',
      },
      {
        id: '2',
        name: 'Corporações',
        key: 'CORPORATION',
        description: 'Gestão Multi-Tenant de corporações e proprietários',
        system: true,
        corporationId: '',
      },
      {
        id: '3',
        name: 'Menus',
        key: 'MENU',
        description: 'Árvore de navegação dinâmica por aplicação',
        system: true,
        corporationId: '',
      },
    ];

    const term = this.search.toLowerCase().trim();
    const searched = term
      ? allModules.filter(
          (item) =>
            item.name.toLowerCase().includes(term) ||
            item.key.toLowerCase().includes(term) ||
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

  deleteEntity(entity: IModule): void {
    this.messageService.confirmDelete(
      entity.name,
      () => {
        this.setList(this.list().filter((m) => m.id !== entity.id));
        setTimeout(() => {
          this.messageService.showSuccess(`O módulo "${entity.name}" foi excluído com sucesso!`);
        }, 150);
      },
      {
        doubleCheck: true,
        doubleCheckText: entity.key,
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
    this.moduleFilterService.clearFilter();
    await this.loadList();
  }

  onFilterClose(): void {
    this.moduleFilterService.closeFilter();
  }
}
