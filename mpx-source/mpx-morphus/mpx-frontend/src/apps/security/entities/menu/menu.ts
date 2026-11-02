import { MorphusApplication } from '@morphus/entities/application';
import { Corporation } from '../corporation';
import { Module } from '../module';
import { SubModule } from '../sub-module';
import { IMenuReflected } from './menu.reflected';

export interface Menu extends IMenuReflected {
  application?: MorphusApplication;
  module?: Module;
  subModule?: SubModule;
  corporation?: Corporation;
  parentMenu?: Menu;
  subMenus?: Menu[];
}
