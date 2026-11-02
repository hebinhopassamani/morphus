import { MorphusApplication } from '@morphus/entities/application';
import { Corporation } from '../corporation';
import { SubModule } from '../sub-module';
import { IModuleReflected } from './module.reflected';

export interface Module extends IModuleReflected {
  application?: MorphusApplication;
  corporation?: Corporation;
  subModules?: SubModule[];
}

export type IModule = Module;
