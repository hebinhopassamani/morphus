import { IMorphusEntity } from '@core/mpx-entities';

export interface IUserReflected extends IMorphusEntity {
  name: string | null;
  email: string | null;
  emailConfirmed: boolean;
  phoneConfirmed: boolean;
  termsConfirmed: boolean;
  onboardingCompleted: boolean;
  userStatusId?: string | null;
  corporationId?: string | null;
  passwordHash?: string;
  nickName?: string;
  picture?: string;
  phoneNumber?: string;
}
