import { MpxApplication } from '../application';
import { WorkspaceApplication } from '../workspace-application';
import { WorkspaceReflected } from './workspace.reflected';

export interface Workspace extends WorkspaceReflected {
  applications?: MpxApplication[];
  workspaceApplications?: WorkspaceApplication[];
}
