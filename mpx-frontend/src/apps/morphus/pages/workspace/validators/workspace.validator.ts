import { MpxValidator } from '@core/morphus';
import { Workspace } from '@morphus/entities/workspace';

export class WorkspaceValidator extends MpxValidator<Workspace> {
  public configure(builder: MpxValidator<Workspace>): void {
    builder.messageForAll().withError('required').showMessage('Este campo é obrigatório');

    builder
      .messageFor('name')
      .withError('minlength')
      .showMessage('O nome deve possuir no mínimo 2 caracteres');
  }
}
