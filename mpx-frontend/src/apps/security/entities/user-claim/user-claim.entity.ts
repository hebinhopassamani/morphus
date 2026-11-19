import { Claim } from '../claim';
import { Corporation } from '../corporation';
import { User } from '../user';
import { UserClaimReflected } from './user-claim.reflected';

export interface UserClaim extends UserClaimReflected {
  user?: User;
  claim?: Claim;
  corporation?: Corporation;
}
