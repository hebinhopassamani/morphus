import { Corporation } from '../corporation';
import { User } from '../user';
import { IUserStatusReflected } from './user-status.reflected';

export interface UserStatus extends IUserStatusReflected {
  corporation?: Corporation;
  users?: User[];
}
