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
import { MorphusApplication } from '@morphus/entities/application';
import { ApplicationService } from '@morphus/services/application.service';
import { MorphusContextService } from '@morphus/services/morphus-context.service';

@Component({
  selector: 'mpx-application-list',
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
  styleUrl: './application-list.component.css',
  templateUrl: './application-list.component.html',
})
export class ApplicationListComponent
  extends MorphusListComponent<MorphusApplication>
  implements IMorphusListComponent, OnInit, OnDestroy
{
  private readonly applicationService = inject(ApplicationService);
  private readonly context = inject(MorphusContextService);
  protected search = '';
  private cachedApplications: MorphusApplication[] = [];

  protected readonly displayedColumns = ['name', 'key', 'description', 'origin', 'actions'];

  ngOnInit(): void {
    this.primaryKeys = ['id'];
    this.title1.set('Aplicações (Applications & My Apps)');
    this.title2.set(
      'Gerencie as aplicações da corporação, suas chaves SDK e os usuários autorizados.',
    );
    void this.loadList();
  }

  ngOnDestroy(): void {
    this.destroySubscriptions();
  }

  async loadList(_filter?: MorphusFilter): Promise<void> {
    if (this.cachedApplications.length === 0) {
      this.cachedApplications = await firstValueFrom(this.applicationService.getList());
    }

    const term = this.search.toLowerCase().trim();
    const searched = term
      ? this.cachedApplications.filter(
          (item) =>
            item.name.toLowerCase().includes(term) ||
            item.key.toLowerCase().includes(term) ||
            (item.description ?? '').toLowerCase().includes(term),
        )
      : this.cachedApplications;

    this.setList(searched);
  }

  newEntity(): void {
    void this.router.navigate(['new'], { relativeTo: this.activatedRoute });
  }

  editEntity(entity: MorphusApplication): void {
    void this.router.navigate([entity.id], { relativeTo: this.activatedRoute });
  }

  openApplicationUsers(entity: MorphusApplication): void {
    void this.router.navigate([entity.id], {
      relativeTo: this.activatedRoute,
      queryParams: { tab: 'users' },
    });
  }

  deleteEntity(entity: MorphusApplication): void {
    if (entity.system) {
      this.messageService.showWarn(
        'As aplicações nativas do ecossistema não podem ser excluídas.',
        'Operação Bloqueada',
      );
      return;
    }
    this.messageService.confirmDelete(
      entity.name,
      async () => {
        if (entity.id) {
          await firstValueFrom(this.applicationService.delete(entity.id));
        }
        this.cachedApplications = [];
        await this.loadList();
        this.context.loadWorkspaces();
        setTimeout(() => {
          this.messageService.showSuccess(
            `A aplicação "${entity.name}" foi excluída com sucesso!`,
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
    await this.loadList();
  }

  onFilterClose(): void {}
}
