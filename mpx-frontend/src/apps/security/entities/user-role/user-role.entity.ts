import { Corporation } from '../corporation';
import { Role } from '../role';
import { User } from '../user';
import { UserRoleReflected } from './user-role.reflected';

export interface UserRole extends UserRoleReflected {
  user?: User;
  role?: Role;
  corporation?: Corporation;
}
