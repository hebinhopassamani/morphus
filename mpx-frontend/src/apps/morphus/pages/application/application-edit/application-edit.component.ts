import { computed, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatIcon } from '@angular/material/icon';
import { MatError, MatFormField, MatInput, MatLabel, MatPrefix } from '@angular/material/input';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { MatTooltip } from '@angular/material/tooltip';
import { IMorphusEditComponent, MorphusEditComponent } from '@core/mpx-base';
import { MpxIconSelectorComponent } from '@src/components/morphus/icon-selector';
import { MorphusApplication } from '@morphus/entities/application';
import { ApplicationUser } from '@morphus/entities/application-user';
import { ApplicationUserService } from '@morphus/services/application-user.service';
import { ApplicationService } from '@morphus/services/application.service';
import { MorphusContextService } from '@morphus/services/morphus-context.service';
import { User } from '@security/entities/user';
import { ApplicationValidator } from '../validators/application.validator';

@Component({
  selector: 'mpx-application-edit',
  standalone: true,
  imports: [
    FormsModule,
    MatButton,
    MatIconButton,
    MatCheckbox,
    MatIcon,
    MatFormField,
    MatLabel,
    MatInput,
    MatPrefix,
    MatError,
    MatTabGroup,
    MatTab,
    MatTooltip,
    MpxIconSelectorComponent,
  ],
  styleUrl: './application-edit.component.css',
  templateUrl: './application-edit.component.html',
})
export class ApplicationEditComponent
  extends MorphusEditComponent<MorphusApplication, ApplicationValidator>
  implements IMorphusEditComponent, OnInit, OnDestroy
{
  private readonly applicationService = inject(ApplicationService);
  private readonly applicationUserService = inject(ApplicationUserService);
  private readonly context = inject(MorphusContextService);

  protected readonly selectedTabIndex = signal<number>(0);

  // Estado N:N de Usuários da Aplicação (Com Multi-Seleção)
  protected readonly usersToRelate = signal<User[]>([]);
  protected readonly relatedUsers = signal<ApplicationUser[]>([]);
  protected readonly searchToRelate = signal<string>('');
  protected readonly searchRelated = signal<string>('');
  protected readonly selectedToRelateIds = signal<Set<string>>(new Set());
  protected readonly selectedRelatedIds = signal<Set<string>>(new Set());

  protected readonly filteredUsersToRelate = computed(() => {
    const term = this.searchToRelate().toLowerCase().trim();
    const relatedSet = new Set(this.relatedUsers().map((r) => r.userId));
    const list = this.usersToRelate().filter((u) => !!u.id && !relatedSet.has(u.id));
    if (!term) {
      return list;
    }
    return list.filter(
      (u) =>
        (u.name ?? '').toLowerCase().includes(term) ||
        (u.email ?? '').toLowerCase().includes(term),
    );
  });

  protected readonly filteredRelatedUsers = computed(() => {
    const term = this.searchRelated().toLowerCase().trim();
    const list = this.relatedUsers();
    if (!term) {
      return list;
    }
    return list.filter(
      (r) =>
        (r.user?.name ?? '').toLowerCase().includes(term) ||
        (r.user?.email ?? '').toLowerCase().includes(term),
    );
  });

  constructor() {
    super(ApplicationValidator);
  }

  ngOnInit(): void {
    this.loadPrimaryKey();
    const tab = this.activatedRoute.snapshot.queryParamMap.get('tab');
    if (tab === 'users') {
      this.selectedTabIndex.set(1);
    }
    void this.loadEntity();
  }

  ngOnDestroy(): void {
    this.destroySubscriptions();
  }

  override loadPrimaryKey(): void {
    this.addPrimaryKey('id').loadPrimariKey(this.entity);
  }

  async loadEntity(): Promise<void> {
    if (this.isNew) {
      this.newEntity();
    } else {
      const currentId = this.entity().id;
      if (currentId) {
        const loaded = await firstValueFrom(this.applicationService.getById(currentId));
        this.setEntity({
          ...loaded,
          icon: loaded.icon || 'boxes',
        });
        await this.loadApplicationUsers(currentId);
      }
      this.editEntity();
    }
  }

  async loadApplicationUsers(applicationId?: string): Promise<void> {
    const appId = applicationId ?? this.entity().id;
    if (!appId) {
      return;
    }
    const [toRelate, related] = await Promise.all([
      firstValueFrom(this.applicationUserService.getEntitiesToRelate({ applicationId: appId })),
      firstValueFrom(this.applicationUserService.getRelatedEntities({ applicationId: appId })),
    ]);
    const relatedIds = new Set((related ?? []).map((r) => r.userId));
    this.usersToRelate.set((toRelate ?? []).filter((u) => !!u.id && !relatedIds.has(u.id)));
    this.relatedUsers.set(related ?? []);
    this.selectedToRelateIds.set(new Set());
    this.selectedRelatedIds.set(new Set());
  }

  canRemoveUser(rel: ApplicationUser): boolean {
    return !rel.system && !rel.isOwner;
  }

  isToRelateSelected(userId?: string): boolean {
    return !!userId && this.selectedToRelateIds().has(userId);
  }

  toggleToRelate(userId?: string): void {
    if (!userId) {
      return;
    }
    this.selectedToRelateIds.update((curr) => {
      const next = new Set(curr);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  }

  areAllToRelateSelected(): boolean {
    const visible = this.filteredUsersToRelate();
    return visible.length > 0 && visible.every((u) => !!u.id && this.selectedToRelateIds().has(u.id));
  }

  toggleSelectAllToRelate(): void {
    const visible = this.filteredUsersToRelate();
    const allSelected = this.areAllToRelateSelected();
    this.selectedToRelateIds.update((curr) => {
      const next = new Set(curr);
      for (const u of visible) {
        if (!u.id) {
          continue;
        }
        if (allSelected) {
          next.delete(u.id);
        } else {
          next.add(u.id);
        }
      }
      return next;
    });
  }

  isRelatedSelected(userId?: string): boolean {
    return !!userId && this.selectedRelatedIds().has(userId);
  }

  toggleRelated(rel: ApplicationUser): void {
    if (!this.canRemoveUser(rel) || !rel.userId) {
      return;
    }
    this.selectedRelatedIds.update((curr) => {
      const next = new Set(curr);
      if (next.has(rel.userId)) {
        next.delete(rel.userId);
      } else {
        next.add(rel.userId);
      }
      return next;
    });
  }

  areAllRelatedSelected(): boolean {
    const removable = this.filteredRelatedUsers().filter((r) => this.canRemoveUser(r));
    return removable.length > 0 && removable.every((r) => this.selectedRelatedIds().has(r.userId));
  }

  toggleSelectAllRelated(): void {
    const removable = this.filteredRelatedUsers().filter((r) => this.canRemoveUser(r));
    const allSelected = this.areAllRelatedSelected();
    this.selectedRelatedIds.update((curr) => {
      const next = new Set(curr);
      for (const r of removable) {
        if (allSelected) {
          next.delete(r.userId);
        } else {
          next.add(r.userId);
        }
      }
      return next;
    });
  }

  async addSingleUser(user: User): Promise<void> {
    const applicationId = this.entity().id;
    if (!applicationId || !user.id) {
      return;
    }
    await firstValueFrom(
      this.applicationUserService.addRelationship({
        applicationId,
        userId: user.id,
        isOwner: false,
      }),
    );
    await this.loadApplicationUsers(applicationId);
  }

  async addSelectedUsers(): Promise<void> {
    const applicationId = this.entity().id;
    const ids = Array.from(this.selectedToRelateIds());
    if (!applicationId || !ids.length) {
      return;
    }
    await firstValueFrom(
      this.applicationUserService.addRelationships(
        ids.map((userId) => ({ applicationId, userId, isOwner: false })),
      ),
    );
    await this.loadApplicationUsers(applicationId);
  }

  async removeSingleUser(rel: ApplicationUser): Promise<void> {
    if (!this.canRemoveUser(rel)) {
      return;
    }
    await firstValueFrom(
      this.applicationUserService.removeRelationship({
        applicationId: rel.applicationId,
        userId: rel.userId,
      }),
    );
    await this.loadApplicationUsers(rel.applicationId);
  }

  async removeSelectedUsers(): Promise<void> {
    const applicationId = this.entity().id;
    const ids = Array.from(this.selectedRelatedIds());
    if (!applicationId || !ids.length) {
      return;
    }
    await firstValueFrom(
      this.applicationUserService.removeRelationships(
        ids.map((userId) => ({ applicationId, userId })),
      ),
    );
    await this.loadApplicationUsers(applicationId);
  }

  async toggleUserActive(rel: ApplicationUser): Promise<void> {
    if (rel.inactive) {
      await firstValueFrom(
        this.applicationUserService.activate({
          applicationId: rel.applicationId,
          userId: rel.userId,
        }),
      );
    } else {
      await firstValueFrom(
        this.applicationUserService.deactivate({
          applicationId: rel.applicationId,
          userId: rel.userId,
        }),
      );
    }
    await this.loadApplicationUsers(rel.applicationId);
  }

  async toggleUserOwner(rel: ApplicationUser): Promise<void> {
    if (rel.isOwner) {
      await firstValueFrom(
        this.applicationUserService.removeOwner({
          applicationId: rel.applicationId,
          userId: rel.userId,
        }),
      );
    } else {
      await firstValueFrom(
        this.applicationUserService.setOwner({
          applicationId: rel.applicationId,
          userId: rel.userId,
        }),
      );
    }
    await this.loadApplicationUsers(rel.applicationId);
  }

  newEntity(): void {
    this.title1.set('Nova Aplicação');
    this.title2.set('Cadastre uma nova aplicação na corporação.');
    this.setEntity({
      name: '',
      key: this.generateKey(),
      icon: 'boxes',
      description: '',
    });
  }

  editEntity(): void {
    this.title1.set(`Editar Aplicação: ${this.entity().name ?? ''}`);
    this.title2.set('Atualize os dados da aplicação ou gerencie seus usuários autorizados.');
  }

  async submitForm(): Promise<void> {
    if (this.isNew) {
      await this.create();
    } else {
      await this.update();
    }
  }

  async create(): Promise<void> {
    const created = await firstValueFrom(
      this.applicationService.create(this.entity() as MorphusApplication),
    );
    this.context.loadWorkspaces();
    this.messageService.showSuccess(
      `A aplicação "${created.name}" foi criada com sucesso!`,
    );
    this.back();
  }

  async update(): Promise<void> {
    await firstValueFrom(
      this.applicationService.update(this.entity() as MorphusApplication),
    );
    this.context.loadWorkspaces();
    this.messageService.showSuccess(
      `Os dados da aplicação "${this.entity().name}" foram atualizados com sucesso!`,
    );
    this.back();
  }

  back(): void {
    void this.router.navigate(['/morphus/application']);
  }

  async onSave(): Promise<void> {
    await this.submitForm();
  }

  onCancel(): void {
    this.back();
  }
}
