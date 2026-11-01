import { Corporation } from '@security/entities/Corporations';
import { UserStatus } from '@security/entities/UserStatus';

export interface User {
  id: string;
  name: string | null; // Mapeia o 'string?' obrigatório do C#
  email: string | null;
  emailConfirmed: boolean;
  phoneConfirmed: boolean;
  termsConfirmed: boolean;
  system: boolean;
  userStatusId: string;
  corporationId: string;
  passwordHash?: string;
  nickName?: string;
  picture?: string;
  phoneNumber?: string;

  corporation?: Corporation;
  userStatus?: UserStatus;
}
