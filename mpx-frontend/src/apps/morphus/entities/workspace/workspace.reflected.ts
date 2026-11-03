import { IMorphusEntity } from '@core/mpx-entities';

export interface IWorkspaceReflected extends IMorphusEntity {
  name: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  default?: boolean;
  corporationId?: string;
}
