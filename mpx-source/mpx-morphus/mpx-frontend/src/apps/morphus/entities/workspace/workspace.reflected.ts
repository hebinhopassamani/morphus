import { IMorphusEntity } from '@core/mpx-entities';

export interface IWorkspaceReflected extends IMorphusEntity {
  name: string;
  key: string;
  description?: string | null;
  icon?: string | null;
  corporationId?: string;
}
