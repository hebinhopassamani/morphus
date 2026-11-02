import { Corporation } from '../corporation';
import { Role } from '../role';
import { User } from '../user';
import { IUserRoleReflected } from './user-role.reflected';

export interface UserRole extends IUserRoleReflected {
  user?: User;
  role?: Role;
  corporation?: Corporation;
}
