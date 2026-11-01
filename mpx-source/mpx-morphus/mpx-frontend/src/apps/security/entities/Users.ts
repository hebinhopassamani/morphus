import { Corporation } from '@security/entities/Corporations';
import { UserStatus } from '@security/entities/UserStatus';

export interface User {
  id: string;
  name: string | null;
  email: string | null;
  emailConfirmed: boolean;
  phoneConfirmed: boolean;
  termsConfirmed: boolean;
  onboardingCompleted: boolean;
  system: boolean;
  userStatusId?: string | null;
  corporationId?: string | null;
  passwordHash?: string;
  nickName?: string;
  picture?: string;
  phoneNumber?: string;

  corporation?: Corporation;
  userStatus?: UserStatus;
}
