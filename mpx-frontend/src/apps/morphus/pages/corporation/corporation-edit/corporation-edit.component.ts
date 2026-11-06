import { computed, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {
  IMorphusEditComponent,
  MorphusEditComponent,
  MorphusEditShared,
  NgForm,
} from '@core/mpx-shared/edit';
import {
  MorphusValidationCpfCnpjShared,
  MorphusValidationEmailShared,
} from '@core/mpx-shared/validators';
import { MpxIconSelectorComponent } from '@src/components/morphus/icon-selector';
import { Corporation } from '@security/entities/corporation';
import { CorporationUser } from '@security/entities/corporation-user';
import { User } from '@security/entities/user';
import { CorporationUserService } from '@security/services/corporation-user.service';
import { CorporationService } from '@security/services/corporation.service';
import { CorporationValidator } from '../validators/corporation.validator';

@Component({
  selector: 'mpx-corporation-edit',
  standalone: true,
  imports: [
    MorphusEditShared,
    MorphusValidationCpfCnpjShared,
    MorphusValidationEmailShared,
    MpxIconSelectorComponent,
  ],
  styleUrl: './corporation-edit.component.css',
  templateUrl: './corporation-edit.component.html',
})
export class CorporationEditComponent
  extends MorphusEditComponent<Corporation, CorporationValidator>
  implements IMorphusEditComponent, OnInit, OnDestroy
{
  private readonly corporationService = inject(CorporationService);
  private readonly corporationUserService = inject(CorporationUserService);

  protected readonly selectedTabIndex = signal<number>(0);

  // Estado N:N de Usuários da Corporação com Multi-Seleção
  protected readonly usersToRelate = signal<User[]>([]);
  protected readonly relatedUsers = signal<CorporationUser[]>([]);
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
    super(CorporationValidator);
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

  protected isPj(): boolean {
    return (this.entity().personType ?? 'PJ') !== 'PF';
  }

  protected onPersonTypeChange(type: 'PJ' | 'PF'): void {
    this.updateField('personType', type);
    const currentDoc = (this.entity().cpfCnpj ?? '').replace(/\D+/g, '');
    const maxLen = type === 'PF' ? 11 : 14;
    if (currentDoc.length > maxLen) {
      this.updateField('cpfCnpj', currentDoc.substring(0, maxLen));
    }
  }

  protected onCpfCnpjChange(value: string): void {
    const maxLen = this.isPj() ? 14 : 11;
    const digitsOnly = (value ?? '').replace(/\D+/g, '').substring(0, maxLen);
    this.updateField('cpfCnpj', digitsOnly);
  }

  async loadEntity(): Promise<void> {
    if (this.isNew) {
      this.newEntity();
    } else {
      const currentId = this.entity().id;
      if (currentId) {
        const loaded = await firstValueFrom(this.corporationService.getById(currentId));
        this.setEntity({
          ...loaded,
          personType: loaded.personType || 'PJ',
          cpfCnpj: loaded.cpfCnpj || '',
        });
        await this.loadCorporationUsers(currentId);
      }
      this.editEntity();
    }
  }

  async loadCorporationUsers(corporationId?: string): Promise<void> {
    const corpId = corporationId ?? this.entity().id;
    if (!corpId) {
      return;
    }
    const [toRelate, related] = await Promise.all([
      firstValueFrom(this.corporationUserService.getEntitiesToRelate({ corporationId: corpId })),
      firstValueFrom(this.corporationUserService.getRelatedEntities({ corporationId: corpId })),
    ]);
    const relatedIds = new Set((related ?? []).map((r) => r.userId));
    this.usersToRelate.set((toRelate ?? []).filter((u) => !!u.id && !relatedIds.has(u.id)));
    this.relatedUsers.set(related ?? []);
    this.selectedToRelateIds.set(new Set());
    this.selectedRelatedIds.set(new Set());
  }

  // Multi-seleção na lista à esquerda
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

  // Multi-seleção na lista à direita
  canRemoveUser(rel: CorporationUser): boolean {
    return !rel.system && !rel.isOwner;
  }

  isRelatedSelected(userId?: string): boolean {
    return !!userId && this.selectedRelatedIds().has(userId);
  }

  toggleRelated(rel: CorporationUser): void {
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
    const corporationId = this.entity().id;
    if (!corporationId || !user.id) {
      return;
    }
    await firstValueFrom(
      this.corporationUserService.addRelationship({
        corporationId,
        userId: user.id,
        isOwner: false,
      }),
    );
    await this.loadCorporationUsers(corporationId);
  }

  async addSelectedUsers(): Promise<void> {
    const corporationId = this.entity().id;
    const ids = Array.from(this.selectedToRelateIds());
    if (!corporationId || !ids.length) {
      return;
    }
    const payload = ids.map((userId) => ({
      corporationId,
      userId,
      isOwner: false,
    }));
    await firstValueFrom(this.corporationUserService.addRelationships(payload));
    await this.loadCorporationUsers(corporationId);
  }

  async removeSingleUser(rel: CorporationUser): Promise<void> {
    if (!this.canRemoveUser(rel)) {
      return;
    }
    await firstValueFrom(
      this.corporationUserService.removeRelationship({
        corporationId: rel.corporationId,
        userId: rel.userId,
      }),
    );
    await this.loadCorporationUsers(rel.corporationId);
  }

  async removeSelectedUsers(): Promise<void> {
    const corporationId = this.entity().id;
    const ids = Array.from(this.selectedRelatedIds());
    if (!corporationId || !ids.length) {
      return;
    }
    const payload = ids.map((userId) => ({
      corporationId,
      userId,
    }));
    await firstValueFrom(this.corporationUserService.removeRelationships(payload));
    await this.loadCorporationUsers(corporationId);
  }

  async toggleUserActive(rel: CorporationUser): Promise<void> {
    if (rel.inactive) {
      await firstValueFrom(
        this.corporationUserService.activate({
          corporationId: rel.corporationId,
          userId: rel.userId,
        }),
      );
    } else {
      await firstValueFrom(
        this.corporationUserService.deactivate({
          corporationId: rel.corporationId,
          userId: rel.userId,
        }),
      );
    }
    await this.loadCorporationUsers(rel.corporationId);
  }

  async toggleUserOwner(rel: CorporationUser): Promise<void> {
    if (rel.isOwner) {
      await firstValueFrom(
        this.corporationUserService.removeOwner({
          corporationId: rel.corporationId,
          userId: rel.userId,
        }),
      );
    } else {
      await firstValueFrom(
        this.corporationUserService.setOwner({
          corporationId: rel.corporationId,
          userId: rel.userId,
        }),
      );
    }
    await this.loadCorporationUsers(rel.corporationId);
  }

  newEntity(): void {
    this.title1.set('Nova Corporação');
    this.title2.set('Informe os dados para cadastrar uma nova corporação no ecossistema.');
    this.setEntity({
      name: '',
      fullName: '',
      personType: 'PJ',
      cpfCnpj: '',
      key: this.generateKey(),
      email: '',
      icon: 'building-2',
      description: '',
    });
  }

  editEntity(): void {
    this.title1.set(`Editar Corporação: ${this.entity().name ?? ''}`);
    this.title2.set(
      'Atualize os dados cadastrais ou gerencie os usuários vinculados a esta corporação.',
    );
  }

  async submitForm(): Promise<void> {
    if (this.isNew) {
      await this.create();
    } else {
      await this.update();
    }
  }

  async create(): Promise<void> {
    await firstValueFrom(this.corporationService.create(this.entity()));
    this.messageService.showSuccess(
      `A corporação "${this.entity().name}" foi criada com sucesso!`,
    );
    this.back();
  }

  async update(): Promise<void> {
    const id = this.entity().id ?? '';
    await firstValueFrom(this.corporationService.update(id, this.entity()));
    this.messageService.showSuccess(
      `Os dados da corporação "${this.entity().name}" foram atualizados com sucesso!`,
    );
    this.back();
  }

  back(): void {
    void this.router.navigate(['/morphus/corporation']);
  }

  async onSave(form?: NgForm): Promise<void> {
    if (form && form.invalid) {
      form.form.markAllAsTouched();
      return;
    }
    await this.submitForm();
  }

  onCancel(): void {
    this.back();
  }
}
