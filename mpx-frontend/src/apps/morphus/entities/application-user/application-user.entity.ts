import { User } from '@security/entities/user';
import { MpxApplication } from '../application';
import { ApplicationUserReflected } from './application-user.reflected';

export interface ApplicationUser extends ApplicationUserReflected {
  application?: MpxApplication;
  user?: User;
}
