import { Corporation } from '@security/entities/Corporations';
import { Module } from '@security/entities/Modules';
import { SubModule } from '@security/entities/SubModules';
import { MorphusApplication } from '@morphus/entities/application';

export interface Menu {
  id?: string;
  label: string;
  applicationId: string;
  moduleId?: string | null;
  subModuleId?: string | null;
  menuId?: string | null;
  corporationId?: string;
  url?: string | null;
  icon?: string | null;
  description?: string | null;
  order: number;
  system?: boolean;

  application?: MorphusApplication;
  module?: Module;
  subModule?: SubModule;
  corporation?: Corporation;
  parentMenu?: Menu;
  subMenus?: Menu[];
}
