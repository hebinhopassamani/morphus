import { Corporation } from '@security/entities/Corporations';
import { SubModule } from '@security/entities/SubModules';

export interface Claim {
  id: string;
  name: string;
  key: string;
  claimType: string;
  claimValue: string;
  description?: string;
  system: boolean;
  inactive: boolean;
  subModuleId: string;
  corporationId: string;

  subModule?: SubModule;
  corporation?: Corporation;
}

