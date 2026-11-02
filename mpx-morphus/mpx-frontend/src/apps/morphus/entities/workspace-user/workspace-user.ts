import { Workspace } from '../workspace';
import { IWorkspaceUserReflected } from './workspace-user.reflected';

export interface WorkspaceUser extends IWorkspaceUserReflected {
  workspace?: Workspace;
}
