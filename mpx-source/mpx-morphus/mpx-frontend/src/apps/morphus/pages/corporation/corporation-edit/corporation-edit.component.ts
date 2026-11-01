import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatError, MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { IMorphusEditComponent, MorphusEditComponent } from '@core/mpx-base';
import { Corporation } from '@security/entities/Corporations';
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
    this.primaryKeys = ['id'];
    this.title1.set('Cadastro de Corporação');
    this.title2.set('Informe os dados da corporação.');
  }

  ngOnDestroy(): void {
    this.destroySubscriptions();
  }

  async loadEntity(): Promise<void> {}

  async onSave(): Promise<void> {
    void this.router.navigate(['/admin/corporation']);
  }

  onCancel(): void {
    void this.router.navigate(['/admin/corporation']);
  }
}
