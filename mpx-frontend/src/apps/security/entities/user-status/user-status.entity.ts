import { Corporation } from '../corporation';
import { User } from '../user';
import { UserStatusReflected } from './user-status.reflected';

export interface UserStatus extends UserStatusReflected {
  corporation?: Corporation;
  users?: User[];
}
