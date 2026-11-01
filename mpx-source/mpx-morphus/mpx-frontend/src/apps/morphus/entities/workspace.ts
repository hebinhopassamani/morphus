import { MorphusApplication } from './application';

export interface WorkspaceApplication {
  workspaceId: string;
  applicationId: string;
  corporationId?: string;
  inactive?: boolean;
  system?: boolean;
  workspace?: Workspace;
  application?: MorphusApplication;
}

export interface Workspace {
  id?: string;
  name: string;
  key: string;
  description?: string | null;
  icon?: string | null;
  system?: boolean;
  inactive?: boolean;
  corporationId?: string;
  applications?: MorphusApplication[];
  workspaceApplications?: WorkspaceApplication[];
}

export interface WorkspaceUser {
  workspaceId: string;
  userId: string;
  corporationId?: string;
  inactive?: boolean;
  system?: boolean;
  isOwner?: boolean;
}
