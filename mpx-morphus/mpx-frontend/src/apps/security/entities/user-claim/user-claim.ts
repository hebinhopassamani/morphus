import { Claim } from '../claim';
import { Corporation } from '../corporation';
import { User } from '../user';
import { IUserClaimReflected } from './user-claim.reflected';

export interface UserClaim extends IUserClaimReflected {
  user?: User;
  claim?: Claim;
  corporation?: Corporation;
}
