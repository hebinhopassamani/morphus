import { MpxValidator } from '@core/morphus';
import { User } from '@security/entities/user';

export class UserValidator extends MpxValidator<User & { password?: string }> {
  public configure(builder: MpxValidator<User & { password?: string }>): void {
    builder.messageForAll().withError('required').showMessage('Este campo é obrigatório');

    builder
      .messageFor('name')
      .withError('minlength')
      .showMessage('O nome deve possuir no mínimo 3 caracteres');

    builder
      .messageFor('email')
      .withError('email')
      .showMessage('Informe um endereço de e-mail válido')
      .withCustomError('invalid_email')
      .showMessage('Informe um endereço de e-mail válido');

    builder
      .messageFor('password')
      .withError('minlength')
      .showMessage('A senha deve possuir no mínimo 6 caracteres');
  }
}
