import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatFormField, MatInput, MatPrefix, MatSuffix } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { IMorphusListComponent, MorphusFilter, MorphusListComponent } from '@core/mpx-base';
import { MpxFilterComponent } from '@/components/morphus/filter';
import { Workspace } from '@morphus/entities/workspace';
import { MorphusContextService } from '@morphus/services/morphus-context.service';
import { WorkspaceFilterService } from '@morphus/services/workspace.filter.service';
import { WorkspaceService } from '@morphus/services/workspace.service';

@Component({
  selector: 'mpx-workspace-list',
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
  styleUrl: './workspace-list.component.css',
  templateUrl: './workspace-list.component.html',
})
export class WorkspaceListComponent
  extends MorphusListComponent<Workspace>
  implements IMorphusListComponent, OnInit, OnDestroy
{
  protected readonly workspaceFilterService = inject(WorkspaceFilterService);
  private readonly workspaceService = inject(WorkspaceService);
  private readonly context = inject(MorphusContextService);
  protected search = '';
  private cachedWorkspaces: Workspace[] = [];

  protected readonly displayedColumns = ['name', 'key', 'description', 'actions'];

  ngOnInit(): void {
    this.primaryKeys = ['id'];
    this.title1.set('Workspaces');
    this.title2.set('Gerencie os espaços de trabalho da corporação e defina o workspace padrão.');
    void this.loadList();
  }

  ngOnDestroy(): void {
    this.destroySubscriptions();
  }

  async loadList(_filter?: MorphusFilter): Promise<void> {
    if (this.cachedWorkspaces.length === 0) {
      this.cachedWorkspaces = await firstValueFrom(this.workspaceService.getAll());
    }

    const allWorkspaces = this.cachedWorkspaces;
    const term = this.search.toLowerCase().trim();
    const searched = term
      ? allWorkspaces.filter(
          (item) =>
            item.name.toLowerCase().includes(term) ||
            item.key.toLowerCase().includes(term) ||
            (item.description ?? '').toLowerCase().includes(term),
        )
      : allWorkspaces;

    const activeRows = this.workspaceFilterService
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
        const colName = row.column.name as keyof Workspace;
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

  editEntity(entity: Workspace): void {
    void this.router.navigate([entity.id], { relativeTo: this.activatedRoute });
  }

  async setAsDefault(entity: Workspace): Promise<void> {
    if (!entity.id) {
      return;
    }
    await firstValueFrom(
      this.workspaceService.update(entity.id, {
        ...entity,
        default: true,
      }),
    );
    this.cachedWorkspaces = [];
    await this.loadList();
    this.context.loadWorkspaces();
    this.messageService.showSuccess(
      `O workspace "${entity.name}" foi definido como padrão!`,
    );
  }

  deleteEntity(entity: Workspace): void {
    if (entity.system) {
      this.messageService.showWarn(
        'O workspace padrão do sistema não pode ser excluído.',
        'Operação Bloqueada',
      );
      return;
    }
    this.messageService.confirmDelete(
      entity.name,
      async () => {
        if (entity.id) {
          await firstValueFrom(this.workspaceService.delete(entity.id));
        }
        this.cachedWorkspaces = [];
        await this.loadList();
        this.context.loadWorkspaces();
        setTimeout(() => {
          this.messageService.showSuccess(
            `O workspace "${entity.name}" foi excluído com sucesso!`,
          );
        }, 150);
      },
      {
        doubleCheck: true,
      },
    );
  }

  openFilter(): void {
    this.workspaceFilterService.openFilter();
  }

  async onFilter(): Promise<void> {
    await this.loadList(this.workspaceFilterService.filter());
  }

  async onFilterClear(): Promise<void> {
    this.search = '';
    this.workspaceFilterService.clearFilter();
    await this.loadList();
  }

  onFilterClose(): void {
    this.workspaceFilterService.closeFilter();
  }
}
