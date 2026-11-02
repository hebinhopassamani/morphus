import { MorphusValidator } from '@core/mpx-validators';
import { Corporation } from '@security/entities/corporation';

export class CorporationValidator extends MorphusValidator<Corporation> {
  public configure(builder: MorphusValidator<Corporation>): void {
    builder.messageForAll().withError('required').showMessage('Este campo é obrigatório');
  }
}
