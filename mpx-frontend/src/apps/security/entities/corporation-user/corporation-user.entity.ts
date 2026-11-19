import { Corporation } from '../corporation';
import { User } from '../user';
import { CorporationUserReflected } from './corporation-user.reflected';

export interface CorporationUser extends CorporationUserReflected {
  corporation?: Corporation;
  user?: User;
}
