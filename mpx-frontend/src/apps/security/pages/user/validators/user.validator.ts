import { MorphusValidator } from '@core/mpx-validators';
import { User } from '@security/entities/user';

export class UserValidator extends MorphusValidator<User> {
  public configure(builder: MorphusValidator<User>): void {
    builder.messageForAll().withError('required').showMessage('Este campo é obrigatório');

    builder
      .messageFor('name')
      .withError('minlength')
      .showMessage('O nome deve possuir no mínimo 3 caracteres');

    builder
      .messageFor('email')
      .withError('email')
      .showMessage('Informe um endereço de e-mail válido');
  }
}
