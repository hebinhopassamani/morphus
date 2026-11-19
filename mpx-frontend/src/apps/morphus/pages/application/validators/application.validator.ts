import { MpxValidator } from '@core/morphus';
import { MpxApplication } from '@morphus/entities/application';

export class ApplicationValidator extends MpxValidator<MpxApplication> {
  public configure(builder: MpxValidator<MpxApplication>): void {
    builder.messageForAll().withError('required').showMessage('Este campo é obrigatório');

    builder
      .messageFor('name')
      .withError('minlength')
      .showMessage('O nome da aplicação deve possuir no mínimo 2 caracteres');

    builder
      .messageFor('prefix')
      .withError('minlength')
      .showMessage('A sigla deve possuir exatamente 3 caracteres');
  }
}
