import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatError, MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatTooltip } from '@angular/material/tooltip';
import { IMorphusEditComponent, MorphusEditComponent } from '@core/mpx-base';
import { ValidateCnpj, ValidateCpf, ValidateEmail } from '@core/mpx-validators';
import { MpxIconSelectorComponent } from '@src/components/morphus/icon-selector';
import { Corporation } from '@security/entities/corporation';
import { CorporationService } from '@security/services/corporation.service';
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
    MatSelect,
    MatOption,
    MatTooltip,
    MpxIconSelectorComponent,
    ValidateCnpj,
    ValidateCpf,
    ValidateEmail,
  ],
  styleUrl: './corporation-edit.component.css',
  templateUrl: './corporation-edit.component.html',
})
export class CorporationEditComponent
  extends MorphusEditComponent<Corporation, CorporationValidator>
  implements IMorphusEditComponent, OnInit, OnDestroy
{
  private readonly corporationService = inject(CorporationService);

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

  protected isPj(): boolean {
    return (this.entity().personType ?? 'PJ') !== 'PF';
  }

  protected onPersonTypeChange(type: 'PJ' | 'PF'): void {
    this.updateField('personType', type);
    const currentDoc = (this.entity().cpfCnpj ?? '').replace(/\D+/g, '');
    const maxLen = type === 'PF' ? 11 : 14;
    if (currentDoc.length > maxLen) {
      this.updateField('cpfCnpj', currentDoc.substring(0, maxLen));
    }
  }

  protected onCpfCnpjChange(value: string): void {
    const maxLen = this.isPj() ? 14 : 11;
    const digitsOnly = (value ?? '').replace(/\D+/g, '').substring(0, maxLen);
    this.updateField('cpfCnpj', digitsOnly);
  }

  async loadEntity(): Promise<void> {
    if (this.isNew) {
      this.newEntity();
    } else {
      const currentId = this.entity().id;
      if (currentId) {
        const loaded = await firstValueFrom(this.corporationService.getById(currentId));
        this.setEntity({
          ...loaded,
          personType: loaded.personType || 'PJ',
          cpfCnpj: loaded.cpfCnpj || '',
        });
      }
      this.editEntity();
    }
  }

  newEntity(): void {
    this.title1.set('Nova Corporação');
    this.title2.set('Informe os dados para cadastrar uma nova corporação no ecossistema.');
    this.setEntity({
      name: '',
      fullName: '',
      personType: 'PJ',
      cpfCnpj: '',
      key: this.generateKey(),
      email: '',
      icon: 'building-2',
      description: '',
    });
  }

  editEntity(): void {
    this.title1.set('Editar Corporação');
    this.title2.set('Atualize os dados cadastrais e a chave de identificação da corporação.');
  }

  async submitForm(): Promise<void> {
    if (this.isNew) {
      await this.create();
    } else {
      await this.update();
    }
  }

  async create(): Promise<void> {
    await firstValueFrom(this.corporationService.create(this.entity()));
    this.messageService.showSuccess(
      `A corporação "${this.entity().name}" foi criada com sucesso!`,
    );
    this.back();
  }

  async update(): Promise<void> {
    const id = this.entity().id ?? '';
    await firstValueFrom(this.corporationService.update(id, this.entity()));
    this.messageService.showSuccess(
      `Os dados da corporação "${this.entity().name}" foram atualizados com sucesso!`,
    );
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
