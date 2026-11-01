import { Corporation } from '@security/entities/Corporations';
import { RoleClaim } from '@security/entities/RoleClaims';

export interface Role {
  id: string;
  name: string;
  key: string;
  description?: string;
  system: boolean;
  inactive: boolean;
  corporationId: string;

  corporation?: Corporation;
  roleClaims?: RoleClaim[];
}

