import { MpxApplication } from '@morphus/entities/application';
import { Corporation } from '../corporation';
import { SubModule } from '../sub-module';
import { ModuleReflected } from './module.reflected';

export interface Module extends ModuleReflected {
  application?: MpxApplication;
  corporation?: Corporation;
  subModules?: SubModule[];
}

