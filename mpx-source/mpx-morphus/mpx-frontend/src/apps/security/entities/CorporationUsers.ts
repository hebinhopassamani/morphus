import { Corporation } from '@security/entities/Corporations';
import { User } from '@security/entities/Users';

export interface CorporationUser {
  id: string;
  corporationId: string;
  userId: string;
  isOwner: boolean;
  system: boolean;
  inactive: boolean;

  corporation?: Corporation;
  user?: User;
}

