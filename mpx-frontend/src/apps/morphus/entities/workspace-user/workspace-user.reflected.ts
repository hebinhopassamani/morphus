import { MpxRelatedEntity } from '@core/morphus';

export interface WorkspaceUserReflected extends MpxRelatedEntity {
  workspaceId: string;
  userId: string;
  isOwner?: boolean;
}
