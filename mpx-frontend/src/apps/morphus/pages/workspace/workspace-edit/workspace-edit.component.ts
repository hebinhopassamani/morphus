import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatError, MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatTooltip } from '@angular/material/tooltip';
import { IMorphusEditComponent, MorphusEditComponent } from '@core/mpx-base';
import { MpxIconSelectorComponent } from '@src/components/morphus/icon-selector';
import { Workspace } from '@morphus/entities/workspace';
import { MorphusContextService } from '@morphus/services/morphus-context.service';
import { WorkspaceService } from '@morphus/services/workspace.service';
import { WorkspaceValidator } from '../validators/workspace.validator';

@Component({
  selector: 'mpx-workspace-edit',
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
    MatSlideToggle,
    MatTooltip,
    MpxIconSelectorComponent,
  ],
  styleUrl: './workspace-edit.component.css',
  templateUrl: './workspace-edit.component.html',
})
export class WorkspaceEditComponent
  extends MorphusEditComponent<Workspace, WorkspaceValidator>
  implements IMorphusEditComponent, OnInit, OnDestroy
{
  private readonly workspaceService = inject(WorkspaceService);
  private readonly context = inject(MorphusContextService);

  constructor() {
    super(WorkspaceValidator);
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
      if (currentId) {
        const loaded = await firstValueFrom(this.workspaceService.getById(currentId));
        this.setEntity({
          ...loaded,
          icon: loaded.icon || 'layout-grid',
          default: Boolean(loaded.default),
        });
      }
      this.editEntity();
    }
  }

  newEntity(): void {
    this.title1.set('Novo Workspace');
    this.title2.set('Informe os dados para cadastrar um novo espaço de trabalho na corporação.');
    this.setEntity({
      name: '',
      key: this.generateKey(),
      icon: 'layout-grid',
      default: false,
      description: '',
    });
  }

  editEntity(): void {
    this.title1.set('Editar Workspace');
    this.title2.set('Atualize os dados e a preferência de espaço de trabalho padrão.');
  }

  async submitForm(): Promise<void> {
    if (this.isNew) {
      await this.create();
    } else {
      await this.update();
    }
  }

  async create(): Promise<void> {
    await firstValueFrom(this.workspaceService.create(this.entity()));
    this.context.loadWorkspaces();
    this.messageService.showSuccess(
      `O workspace "${this.entity().name}" foi criado com sucesso!`,
    );
    this.back();
  }

  async update(): Promise<void> {
    const id = this.entity().id ?? '';
    await firstValueFrom(this.workspaceService.update(id, this.entity()));
    this.context.loadWorkspaces();
    this.messageService.showSuccess(
      `Os dados do workspace "${this.entity().name}" foram atualizados com sucesso!`,
    );
    this.back();
  }

  back(): void {
    void this.router.navigate(['/admin/workspace']);
  }

  async onSave(): Promise<void> {
    await this.submitForm();
  }

  onCancel(): void {
    this.back();
  }
}
