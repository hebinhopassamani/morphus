import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {
  IMorphusEditComponent,
  MorphusEditComponent,
  MorphusEditShared,
  NgForm,
} from '@core/mpx-shared/edit';
import { MorphusValidationEmailShared } from '@core/mpx-shared/validators';
import { User } from '@security/entities/user';
import { UserService } from '@security/services/user.service';
import { UserValidator } from '../validators/user.validator';

@Component({
  selector: 'mpx-user-edit',
  standalone: true,
  imports: [MorphusEditShared, MorphusValidationEmailShared],
  styleUrl: './user-edit.component.css',
  templateUrl: './user-edit.component.html',
})
export class UserEditComponent
  extends MorphusEditComponent<User, UserValidator>
  implements IMorphusEditComponent, OnInit, OnDestroy
{
  private readonly userService = inject(UserService);
  protected readonly password = signal<string>('');

  constructor() {
    super(UserValidator);
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
        const loaded =
          (await firstValueFrom(this.userService.getById(currentId)).catch(() => null)) ??
          ((await firstValueFrom(this.userService.getAll()).catch(() => [])) ?? []).find(
            (u) => u.id === currentId,
          );
        if (loaded) {
          this.setEntity(loaded);
        }
      }
      this.editEntity();
    }
  }

  newEntity(): void {
    this.title1.set('Novo Usuário');
    this.title2.set('Cadastre um novo usuário na corporação.');
    this.setEntity({
      name: '',
      email: '',
      nickName: '',
      phoneNumber: '',
      key: this.generateKey(),
      emailConfirmed: true,
      phoneConfirmed: false,
      termsConfirmed: true,
      onboardingCompleted: true,
      system: false,
      inactive: false,
    });
  }

  editEntity(): void {
    this.title1.set(`Editar Usuário: ${this.entity().name ?? this.entity().email ?? ''}`);
    this.title2.set('Atualize os dados cadastrais do usuário.');
  }

  async submitForm(): Promise<void> {
    if (this.isNew) {
      await this.create();
    } else {
      await this.update();
    }
  }

  async create(): Promise<void> {
    const payload: Partial<User> & { password?: string } = {
      ...this.entity(),
      password: this.password(),
    };
    const created = await firstValueFrom(this.userService.create(payload));
    this.messageService.showSuccess(
      `O usuário "${created.name ?? created.email}" foi criado com sucesso!`,
    );
    this.back();
  }

  async update(): Promise<void> {
    const id = this.entity().id ?? '';
    const payload: Partial<User> & { password?: string } = {
      ...this.entity(),
      ...(this.password() ? { password: this.password() } : {}),
    };
    await firstValueFrom(this.userService.update(id, payload));
    this.messageService.showSuccess(
      `O usuário "${this.entity().name ?? this.entity().email}" foi atualizado com sucesso!`,
    );
    this.back();
  }

  goToRoles(): void {
    const id = this.entity().id;
    if (id) {
      void this.router.navigate(['/security/user', id, 'roles']);
    }
  }

  goToClaims(): void {
    const id = this.entity().id;
    if (id) {
      void this.router.navigate(['/security/user', id, 'claims']);
    }
  }

  back(): void {
    void this.router.navigate(['/security/user']);
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
