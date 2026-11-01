import { Component, computed, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatFormField, MatInput, MatPrefix, MatSuffix } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { IMorphusListComponent, MorphusFilter, MorphusListComponent } from '@core/mpx-base';
import { IModule } from '@security/entities/Modules';

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
  ],
  styleUrl: './module-list.component.css',
  templateUrl: './module-list.component.html',
})
export class ModuleListComponent
  extends MorphusListComponent<IModule>
  implements IMorphusListComponent, OnInit, OnDestroy
{
  protected readonly search = signal<string>('');
  protected readonly filterOpen = signal<boolean>(false);

  protected readonly displayedColumns = ['name', 'key', 'description', 'origin', 'actions'];

  protected readonly filteredList = computed<IModule[]>(() => {
    const term = this.search().toLowerCase().trim();
    if (!term) {
      return this.list();
    }
    return this.list().filter(
      (item) =>
        item.name.toLowerCase().includes(term) ||
        item.key.toLowerCase().includes(term) ||
        (item.description ?? '').toLowerCase().includes(term),
    );
  });

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
    // Sem regra de negócio/API por enquanto: dados visuais de exemplo para a tela
    this.setList([
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
    ]);
  }

  newEntity(): void {
    void this.router.navigate(['new'], { relativeTo: this.activatedRoute });
  }

  editEntity(entity: IModule): void {
    void this.router.navigate([entity.id], { relativeTo: this.activatedRoute });
  }

  openFilter(): void {
    this.filterOpen.set(true);
  }

  async onFilter(): Promise<void> {
    await this.loadList({ search: this.search() });
  }

  async onFilterClear(): Promise<void> {
    this.search.set('');
    await this.loadList();
  }

  onFilterClose(): void {
    this.filterOpen.set(false);
  }
}
