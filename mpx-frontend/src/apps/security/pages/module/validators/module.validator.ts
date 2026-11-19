import { MpxValidator } from '@core/morphus';
import { Module } from '@security/entities/module';

export class ModuleValidator extends MpxValidator<Module> {
  public configure(builder: MpxValidator<Module>): void {
    builder.messageForAll().withError('required').showMessage('Este campo é obrigatório');

    builder
      .messageFor('key')
      .withError('pattern')
      .showMessage('A chave deve conter apenas letras maiúsculas, números e underline (ex: USER_MANAGEMENT)')
      .withCustomError('exists_key')
      .showMessage('Esta chave de módulo já está cadastrada');

    builder
      .messageFor('name')
      .withError('minlength')
      .showMessage('O nome do módulo deve possuir no mínimo 3 caracteres');
  }
}
