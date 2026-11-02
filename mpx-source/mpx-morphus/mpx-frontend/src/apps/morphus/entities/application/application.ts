import { Workspace } from '../workspace';
import { WorkspaceApplication } from '../workspace-application';
import { IMorphusApplicationReflected } from './application.reflected';

export interface MorphusApplication extends IMorphusApplicationReflected {
  workspace?: Workspace;
  workspaceApplications?: WorkspaceApplication[];
}
