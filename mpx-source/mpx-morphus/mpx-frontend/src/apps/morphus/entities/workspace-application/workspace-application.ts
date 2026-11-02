import { MorphusApplication } from '../application';
import { Workspace } from '../workspace';
import { IWorkspaceApplicationReflected } from './workspace-application.reflected';

export interface WorkspaceApplication extends IWorkspaceApplicationReflected {
  workspace?: Workspace;
  application?: MorphusApplication;
}
