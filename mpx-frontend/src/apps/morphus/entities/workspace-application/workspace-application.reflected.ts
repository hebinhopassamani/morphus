import { MpxRelatedEntity } from '@core/morphus';

export interface WorkspaceApplicationReflected extends MpxRelatedEntity {
  workspaceId: string;
  applicationId: string;
  default?: boolean;
  trialStartDate?: string | null;
  trialDays?: number | null;
  trialUsed?: boolean;
  sharedWithWorkspaceId?: string | null;
}
