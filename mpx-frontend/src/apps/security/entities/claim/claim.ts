import { Corporation } from '../corporation';
import { Module } from '../module';
import { SubModule } from '../sub-module';
import { IClaimReflected } from './claim.reflected';

export interface Claim extends IClaimReflected {
  module?: Module;
  subModule?: SubModule;
  corporation?: Corporation;
}
