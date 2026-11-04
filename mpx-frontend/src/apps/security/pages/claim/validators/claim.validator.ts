import { MorphusValidator } from '@core/mpx-validators';
import { Claim } from '@security/entities/claim';

export class ClaimValidator extends MorphusValidator<Claim> {
  public configure(builder: MorphusValidator<Claim>): void {
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
