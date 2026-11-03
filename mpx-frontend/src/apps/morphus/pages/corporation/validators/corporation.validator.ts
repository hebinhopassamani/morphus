import { MorphusValidator } from '@core/mpx-validators';
import { Corporation } from '@security/entities/corporation';

export class CorporationValidator extends MorphusValidator<Corporation> {
  public configure(builder: MorphusValidator<Corporation>): void {
    builder.messageForAll().withError('required').showMessage('Este campo é obrigatório');

    builder
      .messageFor('name')
      .withError('minlength')
      .showMessage('O nome deve possuir no mínimo 3 caracteres');

    builder
      .messageFor('cpfCnpj')
      .withError('invalid_cnpj')
      .showMessage('O CNPJ informado é inválido')
      .withError('invalid_cpf')
      .showMessage('O CPF informado é inválido');

    builder
      .messageFor('email')
      .withError('email')
      .showMessage('Informe um endereço de e-mail válido')
      .withError('invalid_email')
      .showMessage('Informe um endereço de e-mail válido');
  }
}
