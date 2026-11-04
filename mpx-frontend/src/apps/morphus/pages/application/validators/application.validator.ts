import { MorphusValidator } from '@core/mpx-validators';
import { MorphusApplication } from '@morphus/entities/application';

export class ApplicationValidator extends MorphusValidator<MorphusApplication> {
  public configure(builder: MorphusValidator<MorphusApplication>): void {
    builder.messageForAll().withError('required').showMessage('Este campo é obrigatório');

    builder
      .messageFor('name')
      .withError('minlength')
      .showMessage('O nome da aplicação deve possuir no mínimo 2 caracteres');
  }
}
