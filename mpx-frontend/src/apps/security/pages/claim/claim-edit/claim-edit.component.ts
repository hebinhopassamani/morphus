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
import { Claim } from '@security/entities/claim';
import { Module } from '@security/entities/module';
import { SubModule } from '@security/entities/sub-module';
import { ClaimService } from '@security/services/claim.service';
import { ModuleService } from '@security/services/module.service';
import { SubModuleService } from '@security/services/sub-module.service';
import { ClaimValidator } from '../validators/claim.validator';

@Component({
  selector: 'mpx-claim-edit',
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
  styleUrl: './claim-edit.component.css',
  templateUrl: './claim-edit.component.html',
})
export class ClaimEditComponent
  extends MorphusEditComponent<Claim, ClaimValidator>
  implements IMorphusEditComponent, OnInit, OnDestroy
{
  private readonly claimService = inject(ClaimService);
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
    super(ClaimValidator);
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
        const loaded = await firstValueFrom(this.claimService.getById(currentId));
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
    this.title1.set('Nova Permissão (Claim)');
    this.title2.set('Cadastre uma nova permissão vinculada a um módulo e submódulo.');
    const defaultMod = this.allModules()[0];
    const defaultSub = defaultMod
      ? this.allSubModules().find((s) => s.moduleId === defaultMod.id)
      : undefined;

    if (defaultMod?.applicationId) {
      this.selectedApplicationId.set(defaultMod.applicationId);
    }

    this.setEntity({
      claimType: '',
      claimValue: '',
      key: this.generateKey(),
      description: '',
      moduleId: defaultMod?.id ?? '',
      subModuleId: defaultSub?.id ?? '',
      system: false,
      inactive: false,
    });
  }

  editEntity(): void {
    this.title1.set(
      `Editar Permissão: ${this.entity().claimType ?? ''}:${this.entity().claimValue ?? ''}`,
    );
    this.title2.set('Atualize os dados da permissão.');
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
    const created = await firstValueFrom(this.claimService.create(this.entity()));
    this.messageService.showSuccess(
      `A permissão "${created.claimType}:${created.claimValue}" foi criada com sucesso!`,
    );
    this.back();
  }

  async update(): Promise<void> {
    const id = this.entity().id ?? '';
    await firstValueFrom(this.claimService.update(id, this.entity()));
    this.messageService.showSuccess(
      `A permissão "${this.entity().claimType}:${this.entity().claimValue}" foi atualizada!`,
    );
    this.back();
  }

  back(): void {
    void this.router.navigate(['/security/claim']);
  }

  async onSave(): Promise<void> {
    await this.submitForm();
  }

  onCancel(): void {
    this.back();
  }
}
