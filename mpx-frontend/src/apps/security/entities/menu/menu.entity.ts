import { MpxApplication } from '@morphus/entities/application';
import { Corporation } from '../corporation';
import { Module } from '../module';
import { SubModule } from '../sub-module';
import { MenuReflected } from './menu.reflected';

export interface Menu extends MenuReflected {
  application?: MpxApplication;
  module?: Module;
  subModule?: SubModule;
  corporation?: Corporation;
  parentMenu?: Menu;
  subMenus?: Menu[];
}
