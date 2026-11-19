import { MpxEntity } from '@core/morphus';

export interface WorkspaceReflected extends MpxEntity {
  name: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  default?: boolean;
  corporationId?: string;
}
