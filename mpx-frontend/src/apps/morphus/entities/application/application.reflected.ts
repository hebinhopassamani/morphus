import { IMorphusEntity } from '@core/mpx-entities';

export interface IMorphusApplicationReflected extends IMorphusEntity {
  name: string;
  prefix?: string | null;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  layoutKey?: string | null;
  customLayoutHtml?: string | null;
  default?: boolean;
  availableForTrial?: boolean;
  categoryId?: string | null;
  applicationStatusId?: string | null;
  workspaceId?: string;
  corporationId?: string;
}
