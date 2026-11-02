import { Corporation } from '../corporation';
import { RoleClaim } from '../role-claim';
import { IRoleReflected } from './role.reflected';

export interface Role extends IRoleReflected {
  corporation?: Corporation;
  roleClaims?: RoleClaim[];
}
