import { MorphusValidator } from '@core/mpx-validators';
import { IModule } from '@security/entities/Modules';

export class ModuleValidator extends MorphusValidator<IModule> {
  public configure(builder: MorphusValidator<IModule>): void {
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
