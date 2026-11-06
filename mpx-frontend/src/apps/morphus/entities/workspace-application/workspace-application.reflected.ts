import { IMorphusRelatedEntity } from '@core/mpx-entities';

export interface IWorkspaceApplicationReflected extends IMorphusRelatedEntity {
  workspaceId: string;
  applicationId: string;
  default?: boolean;
  trialStartDate?: string | null;
  trialDays?: number | null;
  trialUsed?: boolean;
  sharedWithWorkspaceId?: string | null;
}
