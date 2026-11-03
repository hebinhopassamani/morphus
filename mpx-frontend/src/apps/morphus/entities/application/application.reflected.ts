import { IMorphusEntity } from '@core/mpx-entities';

export interface IMorphusApplicationReflected extends IMorphusEntity {
  name: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  categoryId?: string | null;
  applicationStatusId?: string | null;
  workspaceId?: string;
  corporationId?: string;
}
