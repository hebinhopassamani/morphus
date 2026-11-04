import { MorphusValidator } from '@core/mpx-validators';
import { Role } from '@security/entities/role';

export class RoleValidator extends MorphusValidator<Role> {
  public configure(builder: MorphusValidator<Role>): void {
    builder.messageForAll().withError('required').showMessage('Este campo é obrigatório');

    builder
      .messageFor('name')
      .withError('minlength')
      .showMessage('O nome do perfil deve possuir no mínimo 3 caracteres');
  }
}
