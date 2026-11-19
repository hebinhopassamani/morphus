import { Corporation } from '../corporation';
import { Module } from '../module';
import { RoleClaim } from '../role-claim';
import { SubModule } from '../sub-module';
import { RoleReflected } from './role.reflected';

export interface Role extends RoleReflected {
  corporation?: Corporation;
  module?: Module;
  subModule?: SubModule;
  roleClaims?: RoleClaim[];
}
