import { User } from '@security/entities/user';
import { MorphusApplication } from '../application';
import { IApplicationUserReflected } from './application-user.reflected';

export interface ApplicationUser extends IApplicationUserReflected {
  application?: MorphusApplication;
  user?: User;
}
