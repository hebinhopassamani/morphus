import { MpxValidator } from '@core/morphus';
import { Role } from '@security/entities/role';

export class RoleValidator extends MpxValidator<Role> {
  public configure(builder: MpxValidator<Role>): void {
    builder.messageForAll().withError('required').showMessage('Este campo é obrigatório');

    builder
      .messageFor('name')
      .withError('minlength')
      .showMessage('O nome do perfil deve possuir no mínimo 3 caracteres');
  }
}
