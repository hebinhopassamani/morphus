import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatError, MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { IMorphusEditComponent, MorphusEditComponent } from '@core/mpx-base';
import { Corporation } from '@security/entities/corporation';
import { CorporationValidator } from '../validators/corporation.validator';

@Component({
  selector: 'mpx-corporation-edit',
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
  ],
  styleUrl: './corporation-edit.component.css',
  templateUrl: './corporation-edit.component.html',
})
export class CorporationEditComponent
  extends MorphusEditComponent<Corporation, CorporationValidator>
  implements IMorphusEditComponent, OnInit, OnDestroy
{
  constructor() {
    super(CorporationValidator);
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
      this.editEntity();
    }
  }

  newEntity(): void {
    this.title1.set('Nova Corporação');
    this.title2.set('Informe os dados para cadastrar a corporação.');
  }

  editEntity(): void {
    this.title1.set('Editar Corporação');
    this.title2.set('Atualize os dados da corporação.');
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
    void this.router.navigate(['/admin/corporation']);
  }

  async onSave(): Promise<void> {
    await this.submitForm();
  }

  onCancel(): void {
    this.back();
  }
}
