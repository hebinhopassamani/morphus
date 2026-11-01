import { Corporation } from '@security/entities/Corporations';
import { Role } from '@security/entities/Roles';
import { User } from '@security/entities/Users';

export interface UserRole {
  id: string;
  userId: string;
  roleId: string;
  corporationId: string;
  system: boolean;
  inactive: boolean;

  user?: User;
  role?: Role;
  corporation?: Corporation;
}

