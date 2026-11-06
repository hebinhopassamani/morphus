import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {
  IMorphusListComponent,
  MorphusFilter,
  MorphusListComponent,
  MorphusListShared,
} from '@core/mpx-shared/list';
import { Corporation } from '@security/entities/corporation';
import { CorporationFilterService } from '@security/services/corporation.filter.service';
import { CorporationService } from '@security/services/corporation.service';

@Component({
  selector: 'mpx-corporation-list',
  standalone: true,
  imports: [MorphusListShared],
  styleUrl: './corporation-list.component.css',
  templateUrl: './corporation-list.component.html',
})
export class CorporationListComponent extends MorphusListComponent<Corporation> implements IMorphusListComponent, OnInit, OnDestroy {
  protected readonly corporationFilterService = inject(CorporationFilterService);
  private readonly corporationService = inject(CorporationService);
  protected search = '';
  private cachedCorporations: Corporation[] = [];

  protected readonly displayedColumns = ['name', 'email', 'description', 'actions'];

  ngOnInit(): void {
    this.primaryKeys = ['id'];
    this.title1.set('Corporações');
    this.title2.set('Gerencie as corporações (Tenants), filiais e proprietários.');
    void this.loadList();
  }

  ngOnDestroy(): void {
    this.destroySubscriptions();
  }

  async loadList(_filter?: MorphusFilter): Promise<void> {
    if (this.cachedCorporations.length === 0) {
      this.cachedCorporations = await firstValueFrom(this.corporationService.getAll());
    }

    const allCorporations = this.cachedCorporations;

    const term = this.search.toLowerCase().trim();
    const searched = term
      ? allCorporations.filter(
          (item) =>
            item.name.toLowerCase().includes(term) ||
            (item.fullName ?? '').toLowerCase().includes(term) ||
            (item.cpfCnpj ?? '').toLowerCase().includes(term) ||
            item.key.toLowerCase().includes(term) ||
            item.email.toLowerCase().includes(term) ||
            (item.description ?? '').toLowerCase().includes(term)
        )
      : allCorporations;

    const activeRows = this.corporationFilterService
      .filterRows()
      .filter((r) => r.column?.name !== undefined && r.operator?.key !== undefined && r.value !== undefined && r.value !== '');

    if (activeRows.length === 0) {
      this.setList(searched);
      return;
    }

    const filtered = searched.filter((item) => {
      let result = true;
      let pendingAndOr: 'And' | 'Or' | undefined = undefined;

      for (const row of activeRows) {
        const colName = row.column.name as keyof Corporation;
        const itemVal = item[colName];
        const filterVal = row.value;
        let matches = false;

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

  editEntity(entity: Corporation): void {
    void this.router.navigate([entity.id], { relativeTo: this.activatedRoute });
  }

  deleteEntity(entity: Corporation): void {
    if (entity.system) {
      this.messageService.showWarn(
        'A corporação matriz do sistema não pode ser excluída.',
        'Operação Bloqueada',
      );
      return;
    }
    this.messageService.confirmDelete(
      entity.name,
      async () => {
        if (entity.id) {
          await firstValueFrom(this.corporationService.delete(entity.id));
        }
        this.cachedCorporations = this.cachedCorporations.filter((c) => c.id !== entity.id);
        this.setList(this.list().filter((c) => c.id !== entity.id));
        setTimeout(() => {
          this.messageService.showSuccess(`A corporação "${entity.name}" foi excluída com sucesso!`);
        }, 150);
      },
      {
        doubleCheck: true,
      },
    );
  }

  openFilter(): void {
    this.corporationFilterService.openFilter();
  }

  async onFilter(): Promise<void> {
    await this.loadList(this.corporationFilterService.filter());
  }

  async onFilterClear(): Promise<void> {
    this.search = '';
    this.corporationFilterService.clearFilter();
    await this.loadList();
  }

  onFilterClose(): void {
    this.corporationFilterService.closeFilter();
  }
}
