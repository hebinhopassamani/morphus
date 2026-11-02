import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatError, MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { IMorphusEditComponent, MorphusEditComponent } from '@core/mpx-base';
import { MorphusContextService } from '@morphus/services/morphus-context.service';
import { IModule } from '@security/entities/module';
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
  ],
  styleUrl: './module-edit.component.css',
  templateUrl: './module-edit.component.html',
})
export class ModuleEditComponent
  extends MorphusEditComponent<IModule, ModuleValidator>
  implements IMorphusEditComponent, OnInit, OnDestroy
{
  protected readonly context = inject(MorphusContextService);

  constructor() {
    super(ModuleValidator);
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
    if (this.isNew) {
      this.newEntity();
    } else {
      const currentId = this.entity().id;
      this.setEntity({
        id: currentId,
        name: 'Usuários',
        key: 'USER',
        description: 'Gestão de contas de usuários, papéis e permissões',
        applicationId: this.context.activeApplication()?.id ?? '',
        system: true,
      });
      this.editEntity();
    }
  }

  newEntity(): void {
    this.title1.set('Novo Módulo');
    this.title2.set('Cadastre um novo módulo vinculado a uma aplicação do Workspace.');
    this.setEntity({
      name: '',
      key: '',
      description: '',
      applicationId: this.context.activeApplication()?.id ?? '',
      system: false,
    });
  }

  editEntity(): void {
    this.title1.set('Editar Módulo');
    this.title2.set('Atualize os dados e a chave de identificação do módulo.');
  }

  async submitForm(): Promise<void> {
    if (this.isNew) {
      await this.create();
    } else {
      await this.update();
    }
  }

  async create(): Promise<void> {
    this.back();
  }

  async update(): Promise<void> {
    this.back();
  }

  back(): void {
    void this.router.navigate(['/admin/module']);
  }

  async onSave(): Promise<void> {
    await this.submitForm();
  }

  onCancel(): void {
    this.back();
  }
}
