import { Corporation } from '../corporation';
import { Module } from '../module';
import { SubModule } from '../sub-module';
import { ClaimReflected } from './claim.reflected';

export interface Claim extends ClaimReflected {
  module?: Module;
  subModule?: SubModule;
  corporation?: Corporation;
}
