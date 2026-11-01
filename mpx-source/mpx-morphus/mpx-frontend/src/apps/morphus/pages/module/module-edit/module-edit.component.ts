import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatError, MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { IMorphusEditComponent, MorphusEditComponent } from '@core/mpx-base';
import { MorphusContextService } from '@morphus/services/morphus-context.service';
import { IModule } from '@security/entities/Modules';
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
    this.primaryKeys = ['id'];

    const id = this.activatedRoute.snapshot.paramMap.get('id');
    if (id) {
      this.title1.set('Editar Módulo');
      this.title2.set('Atualize os dados e a chave de identificação do módulo.');
      void this.loadEntity();
    } else {
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
  }

  ngOnDestroy(): void {
    this.destroySubscriptions();
  }

  async loadEntity(): Promise<void> {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    if (!id) {
      return;
    }

    // Exemplo visual de preenchimento ao editar
    this.setEntity({
      id,
      name: 'Usuários',
      key: 'USER',
      description: 'Gestão de contas de usuários, papéis e permissões',
      applicationId: this.context.activeApplication()?.id ?? '',
      system: true,
    });
  }

  async onSave(): Promise<void> {
    void this.router.navigate(['/admin/module']);
  }

  onCancel(): void {
    void this.router.navigate(['/admin/module']);
  }
}
