import { Claim } from '../claim';
import { Corporation } from '../corporation';
import { Role } from '../role';
import { RoleClaimReflected } from './role-claim.reflected';

export interface RoleClaim extends RoleClaimReflected {
  role?: Role;
  claim?: Claim;
  corporation?: Corporation;
}
