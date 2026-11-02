import { IMorphusRelatedEntity } from '@core/mpx-entities';

export interface IWorkspaceApplicationReflected extends IMorphusRelatedEntity {
  workspaceId: string;
  applicationId: string;
}
