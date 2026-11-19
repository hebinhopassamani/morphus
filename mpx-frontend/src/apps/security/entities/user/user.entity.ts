import { Corporation } from '../corporation';
import { UserStatus } from '../user-status';
import { UserReflected } from './user.reflected';

export interface User extends UserReflected {
  corporation?: Corporation;
  userStatus?: UserStatus;
}
