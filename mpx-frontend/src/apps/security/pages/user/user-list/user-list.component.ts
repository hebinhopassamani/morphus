import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {
  IMorphusListComponent,
  MorphusFilter,
  MorphusListComponent,
  MorphusListShared,
} from '@core/mpx-shared/list';
import { User } from '@security/entities/user';
import { UserService } from '@security/services/user.service';

@Component({
  selector: 'mpx-user-list',
  standalone: true,
  imports: [MorphusListShared],
  styleUrl: './user-list.component.css',
  templateUrl: './user-list.component.html',
})
export class UserListComponent
  extends MorphusListComponent<User>
  implements IMorphusListComponent, OnInit, OnDestroy
{
  private readonly userService = inject(UserService);

  protected search = '';
  private cachedUsers: User[] = [];

  protected readonly displayedColumns = [
    'name',
    'email',
    'shortcuts',
    'key',
    'status',
    'origin',
    'actions',
  ];

  ngOnInit(): void {
    this.primaryKeys = ['id'];
    this.title1.set('Usuários da Corporação');
    this.title2.set(
      'Gerencie os usuários e acesse as opções de cada linha para configurar seus Perfis (Roles) ou Permissões (Claims).',
    );
    void this.loadList();
  }

  ngOnDestroy(): void {
    this.destroySubscriptions();
  }

  async loadList(_filter?: MorphusFilter): Promise<void> {
    if (this.cachedUsers.length === 0) {
      this.cachedUsers = (await firstValueFrom(this.userService.getAll())) ?? [];
    }

    const term = this.search.toLowerCase().trim();
    const filtered = term
      ? this.cachedUsers.filter(
          (item) =>
            (item.name ?? '').toLowerCase().includes(term) ||
            (item.email ?? '').toLowerCase().includes(term) ||
            (item.key ?? '').toLowerCase().includes(term) ||
            (item.nickName ?? '').toLowerCase().includes(term),
        )
      : this.cachedUsers;

    this.setList(filtered);
  }

  newEntity(): void {
    void this.router.navigate(['new'], { relativeTo: this.activatedRoute });
  }

  editEntity(entity: User): void {
    void this.router.navigate([entity.id], { relativeTo: this.activatedRoute });
  }

  configureRoles(entity: User): void {
    void this.router.navigate([entity.id, 'roles'], { relativeTo: this.activatedRoute });
  }

  configureClaims(entity: User): void {
    void this.router.navigate([entity.id, 'claims'], { relativeTo: this.activatedRoute });
  }

  deleteEntity(entity: User): void {
    if (entity.system) {
      this.messageService.showWarn(
        'Usuários nativos do sistema não podem ser excluídos.',
        'Operação Bloqueada',
      );
      return;
    }

    this.messageService.confirmDelete(
      entity.name ?? entity.email ?? '',
      async () => {
        if (entity.id) {
          await firstValueFrom(this.userService.delete(entity.id));
        }
        this.cachedUsers = this.cachedUsers.filter((u) => u.id !== entity.id);
        this.setList(this.list().filter((u) => u.id !== entity.id));
        setTimeout(() => {
          this.messageService.showSuccess(
            `O usuário "${entity.name ?? entity.email}" foi excluído com sucesso!`,
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
