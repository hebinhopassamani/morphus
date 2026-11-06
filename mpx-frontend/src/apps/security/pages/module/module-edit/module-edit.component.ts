import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import {
  DefaultApplication,
  IMorphusEditComponent,
  MorphusEditComponent,
  MorphusEditShared,
  NgForm,
} from '@core/mpx-shared/edit';
import { MorphusApplication } from '@morphus/entities/application';
import { ApplicationService } from '@morphus/services/application.service';
import { MorphusContextService } from '@morphus/services/morphus-context.service';
import { IModule } from '@security/entities/module';
import { SubModule } from '@security/entities/sub-module';
import { ModuleService } from '@security/services/module.service';
import { SubModuleService } from '@security/services/sub-module.service';
import { ModuleValidator } from '../validators/module.validator';

@Component({
  selector: 'mpx-module-edit',
  standalone: true,
  imports: [MorphusEditShared, MatTableModule],
  styleUrl: './module-edit.component.css',
  templateUrl: './module-edit.component.html',
})
export class ModuleEditComponent
  extends MorphusEditComponent<IModule, ModuleValidator>
  implements IMorphusEditComponent, OnInit, OnDestroy
{
  protected readonly context = inject(MorphusContextService);
  private readonly moduleService = inject(ModuleService);
  private readonly subModuleService = inject(SubModuleService);
  private readonly applicationService = inject(ApplicationService);

  protected readonly applications = signal<MorphusApplication[]>([{ ...DefaultApplication }]);
  protected readonly selectedTabIndex = signal<number>(0);

  // Estado da aba 1:N de Submódulos (exclusivos deste Módulo)
  protected readonly subModules = signal<SubModule[]>([]);
  protected readonly subModuleFormOpen = signal<boolean>(false);
  protected readonly editingSubModule = signal<Partial<SubModule>>({
    name: '',
    key: '',
    description: '',
  });
  protected readonly subModuleColumns = ['name', 'description', 'origin', 'actions'];

  constructor() {
    super(ModuleValidator);
  }

  ngOnInit(): void {
    this.loadPrimaryKey();
    const tabParam = this.activatedRoute.snapshot.queryParamMap.get('tab');
    if (tabParam === 'submodules') {
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
    try {
      const apps = await firstValueFrom(this.applicationService.getList());
      this.applications.set([{ ...DefaultApplication }, ...(apps ?? [])]);
    } catch {
      this.applications.set([{ ...DefaultApplication }, ...this.context.availableApplications()]);
    }

    if (this.isNew) {
      this.newEntity();
    } else {
      const currentId = this.entity().id;
      if (currentId) {
        const loaded =
          (await firstValueFrom(this.moduleService.getById(currentId)).catch(() => null)) ??
          ((await firstValueFrom(this.moduleService.getModules()).catch(() => [])) ?? []).find(
            (m) => m.id === currentId,
          );
        if (loaded) {
          this.setEntity(loaded);
        }
        await this.loadSubModules(currentId);
      }
      this.editEntity();
    }
  }

  async loadSubModules(moduleId?: string): Promise<void> {
    const id = moduleId ?? this.entity().id;
    if (!id) {
      return;
    }
    const list = await firstValueFrom(this.moduleService.getSubModules(id));
    this.subModules.set(list ?? []);
  }

  newEntity(): void {
    this.title1.set('Novo Módulo');
    this.title2.set('Cadastre um novo módulo vinculado a uma aplicação da corporação.');
    this.setEntity({
      name: '',
      key: this.generateKey(),
      description: '',
      applicationId: undefined,
      system: false,
    });
  }

  editEntity(): void {
    this.title1.set(`Editar Módulo: ${this.entity().name ?? ''}`);
    this.title2.set(
      'Atualize os dados do módulo ou gerencie seus submódulos na aba ao lado.',
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
    const created = await firstValueFrom(this.moduleService.create(this.entity()));
    this.messageService.showSuccess(
      `O módulo "${created.name}" foi criado com sucesso!`,
    );
    this.back();
  }

  async update(): Promise<void> {
    const id = this.entity().id ?? '';
    await firstValueFrom(this.moduleService.update(id, this.entity()));
    this.messageService.showSuccess(
      `O módulo "${this.entity().name}" foi atualizado com sucesso!`,
    );
    this.back();
  }

  // =========================================================================
  // Gestão 1:N de Submódulos dentro do próprio Módulo (ModuleId imutável)
  // =========================================================================
  openNewSubModuleForm(): void {
    this.editingSubModule.set({
      name: '',
      key: this.generateKey(),
      description: '',
      moduleId: this.entity().id,
      system: false,
    });
    this.subModuleFormOpen.set(true);
  }

  openEditSubModuleForm(subModule: SubModule): void {
    this.editingSubModule.set({
      ...subModule,
      moduleId: this.entity().id,
    });
    this.subModuleFormOpen.set(true);
  }

  cancelSubModuleForm(): void {
    this.subModuleFormOpen.set(false);
    this.editingSubModule.set({ name: '', key: '', description: '' });
  }

  updateSubModuleField<K extends keyof SubModule>(field: K, value: SubModule[K]): void {
    this.editingSubModule.update((curr) => ({
      ...curr,
      [field]: value,
    }));
  }

  async saveSubModule(): Promise<void> {
    const moduleId = this.entity().id;
    const sub = this.editingSubModule();
    if (!moduleId || !sub.name || sub.name.trim().length < 2) {
      return;
    }

    const payload: Partial<SubModule> = {
      ...sub,
      name: sub.name.trim(),
      moduleId,
      key: sub.key || this.generateKey(),
    };

    if (sub.id) {
      await firstValueFrom(this.subModuleService.update(sub.id, payload));
      this.messageService.showSuccess(`O submódulo "${payload.name}" foi atualizado!`);
    } else {
      await firstValueFrom(this.subModuleService.create(payload));
      this.messageService.showSuccess(`O submódulo "${payload.name}" foi adicionado ao módulo!`);
    }

    this.cancelSubModuleForm();
    await this.loadSubModules(moduleId);
  }

  async deleteSubModule(subModule: SubModule): Promise<void> {
    if (subModule.system) {
      this.messageService.showWarn(
        'Submódulos nativos do sistema não podem ser excluídos.',
        'Operação Bloqueada',
      );
      return;
    }
    if (!subModule.id) {
      return;
    }

    const displayName = subModule.name?.trim() || '(Submódulo sem nome)';
    const deps = await firstValueFrom(this.subModuleService.getDependencies(subModule.id)).catch(
      () => ({ hasDependencies: false, subModules: [], roles: [], claims: [] }),
    );

    if (deps.hasDependencies) {
      const lines: string[] = [
        `O submódulo "${displayName}" possui registros vinculados que também serão excluídos permanentemente:`,
        '',
      ];
      if (deps.roles.length > 0) {
        lines.push(`• Perfis de acesso (${deps.roles.length}): ${deps.roles.join(', ')}`);
      }
      if (deps.claims.length > 0) {
        lines.push(`• Permissões (${deps.claims.length}): ${deps.claims.join(', ')}`);
      }
      lines.push('', 'Esta ação removerá o submódulo e todos os vínculos listados acima.');

      this.messageService.confirmDelete(
        displayName,
        async () => {
          await firstValueFrom(this.subModuleService.delete(subModule.id!, true));
          await this.loadSubModules();
          setTimeout(() => {
            this.messageService.showSuccess(
              `O submódulo "${displayName}" e todos os seus vínculos foram excluídos com sucesso!`,
            );
          }, 150);
        },
        {
          title: 'Exclusão de Submódulo e Vínculos',
          detail: lines.join('\n'),
          doubleCheck: false,
          doubleCheckText: 'EXCLUIR',
        },
      );
      return;
    }

    this.messageService.confirmDelete(
      displayName,
      async () => {
        await firstValueFrom(this.subModuleService.delete(subModule.id!));
        await this.loadSubModules();
        this.messageService.showSuccess(
          `O submódulo "${displayName}" foi excluído com sucesso!`,
        );
      },
      { doubleCheck: true },
    );
  }

  back(): void {
    void this.router.navigate(['/security/module']);
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
