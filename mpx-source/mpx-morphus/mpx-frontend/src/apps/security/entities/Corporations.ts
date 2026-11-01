import { Menu } from '@security/entities/Menu';
import { Module } from '@security/entities/Modules';
import { SubModule } from '@security/entities/SubModules';
import { User } from '@security/entities/Users';
import { UserStatus } from '@security/entities/UserStatus';

export interface Corporation {
  id: string;
  name: string;
  key: string;
  email: string;
  system: boolean;
  fullName?: string;
  icon?: string;
  description?: string;
  corporationId?: string;

  parentCorporation?: Corporation;
  users?: User[];
  userStatus?: UserStatus[];
  modules?: Module[];
  subModules?: SubModule[];
  menus?: Menu[];
  corporations?: Corporation[];
}
