import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatError, MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatTooltip } from '@angular/material/tooltip';
import { IMorphusEditComponent, MorphusEditComponent } from '@core/mpx-base';
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
  imports: [
    FormsModule,
    MatButton,
    MatIconButton,
    MatIcon,
    MatFormField,
    MatLabel,
    MatInput,
    MatError,
    MatSelect,
    MatOption,
    MatTabGroup,
    MatTab,
    MatTableModule,
    MatTooltip,
  ],
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

  protected readonly applications = signal<MorphusApplication[]>([]);
  protected readonly selectedTabIndex = signal<number>(0);

  // Estado da aba 1:N de Submódulos (exclusivos deste Módulo)
  protected readonly subModules = signal<SubModule[]>([]);
  protected readonly subModuleFormOpen = signal<boolean>(false);
  protected readonly editingSubModule = signal<Partial<SubModule>>({
    name: '',
    key: '',
    description: '',
  });
  protected readonly subModuleColumns = ['name', 'key', 'description', 'origin', 'actions'];

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
      this.applications.set(apps ?? []);
    } catch {
      this.applications.set(this.context.availableApplications());
    }

    if (this.isNew) {
      this.newEntity();
    } else {
      const currentId = this.entity().id;
      if (currentId) {
        const loaded = await firstValueFrom(this.moduleService.getById(currentId));
        this.setEntity(loaded);
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
      applicationId:
        this.context.activeApplication()?.id ?? this.applications()[0]?.id ?? '',
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
      `O módulo "${created.name}" foi criado! Agora você pode cadastrar os submódulos dele.`,
    );
    void this.router.navigate(['/security/module', created.id], {
      queryParams: { tab: 'submodules' },
    });
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

  deleteSubModule(subModule: SubModule): void {
    if (subModule.system) {
      this.messageService.showWarn(
        'Submódulos nativos do sistema não podem ser excluídos.',
        'Operação Bloqueada',
      );
      return;
    }
    this.messageService.confirmDelete(
      subModule.name,
      async () => {
        if (subModule.id) {
          await firstValueFrom(this.subModuleService.delete(subModule.id));
        }
        await this.loadSubModules();
        this.messageService.showSuccess(
          `O submódulo "${subModule.name}" foi excluído com sucesso!`,
        );
      },
      { doubleCheck: true },
    );
  }

  back(): void {
    void this.router.navigate(['/security/module']);
  }

  async onSave(): Promise<void> {
    await this.submitForm();
  }

  onCancel(): void {
    this.back();
  }
}
