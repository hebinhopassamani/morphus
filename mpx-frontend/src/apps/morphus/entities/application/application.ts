import { Workspace } from '../workspace';
import { WorkspaceApplication } from '../workspace-application';
import { IMorphusApplicationReflected } from './application.reflected';

export interface MorphusCategoryRef {
  id: string;
  key: string;
  name: string;
  label: string;
  color?: string | null;
  description?: string | null;
}

export interface MorphusApplicationStatusRef {
  id: string;
  key: string;
  name: string;
  label: string;
  color?: string | null;
  description?: string | null;
}

export interface MorphusApplicationSubModuleRef {
  id: string;
  key: string;
  name: string;
  label: string;
  applicationModuleId?: string | null;
  icon?: string | null;
  color?: string | null;
  order?: number;
  routePattern?: string | null;
  default?: boolean;
  htmlContent?: string | null;
  cssContent?: string | null;
  jsContent?: string | null;
  description?: string | null;
}

export interface MorphusApplicationModuleRef {
  id: string;
  key: string;
  name: string;
  label: string;
  icon?: string | null;
  color?: string | null;
  order?: number;
  description?: string | null;
  applicationSubModules?: MorphusApplicationSubModuleRef[];
}

export interface MorphusApplication extends IMorphusApplicationReflected {
  category?: MorphusCategoryRef | null;
  applicationStatus?: MorphusApplicationStatusRef | null;
  applicationModules?: MorphusApplicationModuleRef[];
  workspace?: Workspace;
  workspaceApplications?: WorkspaceApplication[];
  trialStartDate?: string | null;
  trialDays?: number | null;
  trialUsed?: boolean;
  sharedWithWorkspaceId?: string | null;
}
