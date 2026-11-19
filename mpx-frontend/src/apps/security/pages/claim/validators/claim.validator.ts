import { MpxValidator } from '@core/morphus';
import { Claim } from '@security/entities/claim';

export class ClaimValidator extends MpxValidator<Claim> {
  public configure(builder: MpxValidator<Claim>): void {
    builder.messageForAll().withError('required').showMessage('Este campo é obrigatório');

    builder
      .messageFor('claimType')
      .withError('minlength')
      .showMessage('O tipo da permissão deve possuir no mínimo 2 caracteres');

    builder
      .messageFor('claimValue')
      .withError('minlength')
      .showMessage('O valor/ação da permissão deve possuir no mínimo 2 caracteres');
  }
}
