import { MorphusApplication } from '@morphus/entities/application';
import { Corporation } from '@security/entities/Corporations';
import { SubModule } from '@security/entities/SubModules';

export interface Module {
  id: string;
  name: string;
  key: string;
  system: boolean;
  applicationId?: string;
  corporationId: string;
  description?: string;

  application?: MorphusApplication;
  corporation?: Corporation;
  subModules?: SubModule[];
}
export type IModule = Module;
