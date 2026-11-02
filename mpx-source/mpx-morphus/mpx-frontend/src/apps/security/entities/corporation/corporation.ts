import { Menu } from '../menu';
import { Module } from '../module';
import { SubModule } from '../sub-module';
import { User } from '../user';
import { UserStatus } from '../user-status';
import { ICorporationReflected } from './corporation.reflected';

export interface Corporation extends ICorporationReflected {
  parentCorporation?: Corporation;
  users?: User[];
  userStatus?: UserStatus[];
  modules?: Module[];
  subModules?: SubModule[];
  menus?: Menu[];
  corporations?: Corporation[];
}
