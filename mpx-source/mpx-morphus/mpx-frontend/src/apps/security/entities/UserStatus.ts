import { Corporation } from '@security/entities/Corporations';
import { User } from '@security/entities/Users';

export interface UserStatus {
  id: string;
  name: string;
  key: string;
  system: boolean;
  corporationId: string;
  description?: string;

  corporation?: Corporation;
  users?: User[];
}
