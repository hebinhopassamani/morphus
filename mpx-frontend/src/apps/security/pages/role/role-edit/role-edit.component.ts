import { computed, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {
  DefaultApplication,
  DefaultModule,
  DefaultSubModule,
  IMorphusEditComponent,
  MorphusEditComponent,
  MorphusEditShared,
  NgForm,
} from '@core/mpx-shared/edit';
import { MorphusApplication } from '@morphus/entities/application';
import { ApplicationService } from '@morphus/services/application.service';
import { Module } from '@security/entities/module';
import { Role } from '@security/entities/role';
import { SubModule } from '@security/entities/sub-module';
import { ModuleService } from '@security/services/module.service';
import { RoleService } from '@security/services/role.service';
import { SubModuleService } from '@security/services/sub-module.service';
import { RoleValidator } from '../validators/role.validator';

@Component({
  selector: 'mpx-role-edit',
  standalone: true,
  imports: [MorphusEditShared],
  styleUrl: './role-edit.component.css',
  templateUrl: './role-edit.component.html',
})
export class RoleEditComponent
  extends MorphusEditComponent<Role, RoleValidator>
  implements IMorphusEditComponent, OnInit, OnDestroy
{
  private readonly roleService = inject(RoleService);
  private readonly applicationService = inject(ApplicationService);
  private readonly moduleService = inject(ModuleService);
  private readonly subModuleService = inject(SubModuleService);

  protected readonly applications = signal<MorphusApplication[]>([{ ...DefaultApplication }]);
  protected readonly allModules = signal<Module[]>([]);
  protected readonly allSubModules = signal<SubModule[]>([]);
  protected readonly selectedApplicationId = signal<string | undefined>(undefined);

  protected readonly availableModules = computed<Module[]>(() => {
    const appId = this.selectedApplicationId();
    const list = appId ? this.allModules().filter((m) => m.applicationId === appId) : [];
    return [{ ...DefaultModule }, ...list];
  });

  protected readonly availableSubModules = computed<SubModule[]>(() => {
    const modId = this.entity().moduleId;
    const list = modId ? this.allSubModules().filter((s) => s.moduleId === modId) : [];
    return [{ ...DefaultSubModule }, ...list];
  });

  constructor() {
    super(RoleValidator);
  }

  ngOnInit(): void {
    this.loadPrimaryKey();
    void this.loadEntity();
  }

  ngOnDestroy(): void {
    this.destroySubscriptions();
  }

  override loadPrimaryKey(): void {
    this.addPrimaryKey('id').loadPrimariKey(this.entity);
  }

  async loadEntity(): Promise<void> {
    const [apps, mods, subMods] = await Promise.all([
      firstValueFrom(this.applicationService.getList()),
      firstValueFrom(this.moduleService.getAll()),
      firstValueFrom(this.subModuleService.getAll()),
    ]);

    this.applications.set([{ ...DefaultApplication }, ...(apps ?? [])]);
    this.allModules.set(mods ?? []);
    this.allSubModules.set(subMods ?? []);

    if (this.isNew) {
      this.newEntity();
    } else {
      const currentId = this.entity().id;
      if (currentId) {
        const loaded = await firstValueFrom(this.roleService.getById(currentId));
        this.setEntity(loaded);
        const mod = (mods ?? []).find((m) => m.id === loaded.moduleId);
        if (mod?.applicationId) {
          this.selectedApplicationId.set(mod.applicationId);
        }
      }
      this.editEntity();
    }
  }

  newEntity(): void {
    this.title1.set('Novo Perfil (Role)');
    this.title2.set('Cadastre um novo perfil de acesso vinculado a um módulo e submódulo.');
    this.selectedApplicationId.set(undefined);

    this.setEntity({
      name: '',
      key: this.generateKey(),
      description: '',
      moduleId: undefined,
      subModuleId: undefined,
      system: false,
      inactive: false,
    });
  }

  editEntity(): void {
    this.title1.set(`Editar Perfil: ${this.entity().name ?? ''}`);
    this.title2.set('Atualize os dados do perfil ou configure suas permissões.');
  }

  onApplicationChange(appId: string | undefined): void {
    this.selectedApplicationId.set(appId);
    this.updateField('moduleId', undefined);
    this.updateField('subModuleId', undefined);
  }

  onModuleChange(modId: string | undefined): void {
    this.updateField('moduleId', modId);
    this.updateField('subModuleId', undefined);
  }

  async submitForm(): Promise<void> {
    if (this.isNew) {
      await this.create();
    } else {
      await this.update();
    }
  }

  async create(): Promise<void> {
    const created = await firstValueFrom(this.roleService.create(this.entity()));
    this.messageService.showSuccess(
      `O perfil "${created.name}" foi criado com sucesso!`,
    );
    this.back();
  }

  async update(): Promise<void> {
    const id = this.entity().id ?? '';
    await firstValueFrom(this.roleService.update(id, this.entity()));
    this.messageService.showSuccess(`O perfil "${this.entity().name}" foi atualizado!`);
    this.back();
  }

  goToClaims(): void {
    const id = this.entity().id;
    if (id) {
      void this.router.navigate(['/security/role', id, 'claims']);
    }
  }

  back(): void {
    void this.router.navigate(['/security/role']);
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
