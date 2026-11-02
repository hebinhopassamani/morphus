import { Corporation } from '../corporation';
import { User } from '../user';
import { ICorporationUserReflected } from './corporation-user.reflected';

export interface CorporationUser extends ICorporationUserReflected {
  corporation?: Corporation;
  user?: User;
}
