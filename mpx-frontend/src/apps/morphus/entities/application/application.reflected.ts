import { MpxEntity } from '@core/morphus';

export interface MpxApplicationReflected extends MpxEntity {
  name: string;
  prefix?: string | null;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  layoutKey?: string | null;
  customLayoutHtml?: string | null;
  domainMode?: string | null;
  subdomain?: string | null;
  corporationDomainId?: string | null;
  fullDomain?: string | null;
  default?: boolean;
  availableForTrial?: boolean;
  categoryId?: string | null;
  applicationStatusId?: string | null;
  workspaceId?: string;
  workspaceIds?: string[];
  corporationId?: string;
}
