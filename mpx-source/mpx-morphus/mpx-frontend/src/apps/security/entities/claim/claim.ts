import { Corporation } from '../corporation';
import { SubModule } from '../sub-module';
import { IClaimReflected } from './claim.reflected';

export interface Claim extends IClaimReflected {
  subModule?: SubModule;
  corporation?: Corporation;
}
