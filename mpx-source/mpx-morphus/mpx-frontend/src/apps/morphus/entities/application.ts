import { Workspace } from './workspace';

export interface MorphusApplication {
  id?: string;
  name: string;
  key: string;
  description?: string | null;
  icon?: string | null;
  system?: boolean;
  inactive?: boolean;
  workspaceId: string;
  corporationId?: string;
  workspace?: Workspace;
}

export interface ApplicationUser {
  applicationId: string;
  userId: string;
  corporationId?: string;
  inactive?: boolean;
  system?: boolean;
  isOwner?: boolean;
}
