import { Claim } from '@security/entities/Claims';
import { Corporation } from '@security/entities/Corporations';
import { Role } from '@security/entities/Roles';

export interface RoleClaim {
  id: string;
  roleId: string;
  claimId: string;
  corporationId: string;
  system: boolean;
  inactive: boolean;

  role?: Role;
  claim?: Claim;
  corporation?: Corporation;
}

