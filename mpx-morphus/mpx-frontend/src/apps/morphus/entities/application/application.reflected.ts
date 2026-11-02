import { IMorphusEntity } from '@core/mpx-entities';

export interface IMorphusApplicationReflected extends IMorphusEntity {
  name: string;
  key: string;
  description?: string | null;
  icon?: string | null;
  workspaceId?: string;
  corporationId?: string;
}
