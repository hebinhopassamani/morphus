import { IMorphusRelatedEntity } from '@core/mpx-entities';

export interface IWorkspaceUserReflected extends IMorphusRelatedEntity {
  workspaceId: string;
  userId: string;
  isOwner?: boolean;
}
