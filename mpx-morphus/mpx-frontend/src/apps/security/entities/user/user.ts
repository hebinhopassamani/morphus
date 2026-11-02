import { Corporation } from '../corporation';
import { UserStatus } from '../user-status';
import { IUserReflected } from './user.reflected';

export interface User extends IUserReflected {
  corporation?: Corporation;
  userStatus?: UserStatus;
}
