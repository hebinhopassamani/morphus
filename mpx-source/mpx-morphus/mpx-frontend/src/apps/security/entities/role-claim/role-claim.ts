import { Claim } from '../claim';
import { Corporation } from '../corporation';
import { Role } from '../role';
import { IRoleClaimReflected } from './role-claim.reflected';

export interface RoleClaim extends IRoleClaimReflected {
  role?: Role;
  claim?: Claim;
  corporation?: Corporation;
}
