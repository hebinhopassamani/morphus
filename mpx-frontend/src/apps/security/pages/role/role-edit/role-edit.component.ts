import { computed, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatError, MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatTooltip } from '@angular/material/tooltip';
import { IMorphusEditComponent, MorphusEditComponent } from '@core/mpx-base';
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
    MatTooltip,
  ],
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

  protected readonly applications = signal<MorphusApplication[]>([]);
  protected readonly allModules = signal<Module[]>([]);
  protected readonly allSubModules = signal<SubModule[]>([]);
  protected readonly selectedApplicationId = signal<string>('');

  protected readonly availableModules = computed(() => {
    const appId = this.selectedApplicationId();
    const list = this.allModules();
    return appId ? list.filter((m) => m.applicationId === appId) : list;
  });

  protected readonly availableSubModules = computed(() => {
    const modId = this.entity().moduleId;
    const list = this.allSubModules();
    return modId ? list.filter((s) => s.moduleId === modId) : [];
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

    this.applications.set(apps ?? []);
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
    const defaultMod = this.allModules()[0];
    const defaultSub = defaultMod
      ? this.allSubModules().find((s) => s.moduleId === defaultMod.id)
      : undefined;

    if (defaultMod?.applicationId) {
      this.selectedApplicationId.set(defaultMod.applicationId);
    }

    this.setEntity({
      name: '',
      key: this.generateKey(),
      description: '',
      moduleId: defaultMod?.id ?? '',
      subModuleId: defaultSub?.id ?? '',
      system: false,
      inactive: false,
    });
  }

  editEntity(): void {
    this.title1.set(`Editar Perfil: ${this.entity().name ?? ''}`);
    this.title2.set('Atualize os dados do perfil ou configure suas permissões.');
  }

  onApplicationChange(appId: string): void {
    this.selectedApplicationId.set(appId);
    const firstMod = this.allModules().find((m) => !appId || m.applicationId === appId);
    const firstSub = firstMod
      ? this.allSubModules().find((s) => s.moduleId === firstMod.id)
      : undefined;
    this.updateField('moduleId', firstMod?.id ?? '');
    this.updateField('subModuleId', firstSub?.id ?? '');
  }

  onModuleChange(modId: string): void {
    this.updateField('moduleId', modId);
    const firstSub = this.allSubModules().find((s) => s.moduleId === modId);
    this.updateField('subModuleId', firstSub?.id ?? '');
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
      `O perfil "${created.name}" foi criado! Agora configure as permissões dele.`,
    );
    void this.router.navigate(['/security/role', created.id, 'claims']);
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

  async onSave(): Promise<void> {
    await this.submitForm();
  }

  onCancel(): void {
    this.back();
  }
}
