import { MorphusValidator } from '@core/mpx-validators';
import { Workspace } from '@morphus/entities/workspace';

export class WorkspaceValidator extends MorphusValidator<Workspace> {
  public configure(builder: MorphusValidator<Workspace>): void {
    builder.messageForAll().withError('required').showMessage('Este campo é obrigatório');

    builder
      .messageFor('name')
      .withError('minlength')
      .showMessage('O nome deve possuir no mínimo 2 caracteres');
  }
}
