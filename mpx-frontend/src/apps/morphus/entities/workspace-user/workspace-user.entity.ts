import { User } from '@security/entities/user';
import { Workspace } from '../workspace';
import { WorkspaceUserReflected } from './workspace-user.reflected';

export interface WorkspaceUser extends WorkspaceUserReflected {
  workspace?: Workspace;
  user?: User;
}
