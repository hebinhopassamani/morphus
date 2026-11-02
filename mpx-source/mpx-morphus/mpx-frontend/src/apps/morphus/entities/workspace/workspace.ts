import { MorphusApplication } from '../application';
import { WorkspaceApplication } from '../workspace-application';
import { IWorkspaceReflected } from './workspace.reflected';

export interface Workspace extends IWorkspaceReflected {
  applications?: MorphusApplication[];
  workspaceApplications?: WorkspaceApplication[];
}
