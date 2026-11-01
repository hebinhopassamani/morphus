import { Claim } from '@security/entities/Claims';
import { Corporation } from '@security/entities/Corporations';
import { User } from '@security/entities/Users';

export interface UserClaim {
  id: string;
  userId: string;
  claimId: string;
  corporationId: string;
  system: boolean;
  inactive: boolean;

  user?: User;
  claim?: Claim;
  corporation?: Corporation;
}

