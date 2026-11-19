import { MpxApplication } from '../application';
import { Workspace } from '../workspace';
import { WorkspaceApplicationReflected } from './workspace-application.reflected';

export interface WorkspaceApplication extends WorkspaceApplicationReflected {
  workspace?: Workspace;
  application?: MpxApplication;
}
