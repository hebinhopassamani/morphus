import { Workspace } from '../workspace';
import { WorkspaceApplication } from '../workspace-application';
import { IMorphusApplicationReflected } from './application.reflected';

export interface MorphusCategoryRef {
  id: string;
  key: string;
  name: string;
  label: string;
  color?: string | null;
  description?: string | null;
}

export interface MorphusApplicationStatusRef {
  id: string;
  key: string;
  name: string;
  label: string;
  color?: string | null;
  description?: string | null;
}

export interface MorphusApplicationSubModuleRef {
  id: string;
  key: string;
  name: string;
  label: string;
  applicationModuleId?: string | null;
  icon?: string | null;
  color?: string | null;
  order?: number;
  routePattern?: string | null;
  default?: boolean;
  htmlContent?: string | null;
  customHtmlContent?: string | null;
  cssContent?: string | null;
  tsContent?: string | null;
  jsContent?: string | null;
  isCustomHtml?: boolean;
  description?: string | null;
}

export interface MorphusApplicationModuleRef {
  id: string;
  key: string;
  name: string;
  label: string;
  icon?: string | null;
  color?: string | null;
  order?: number;
  description?: string | null;
  applicationSubModules?: MorphusApplicationSubModuleRef[];
}

export interface MorphusCorporationDomainRef {
  id?: string;
  key?: string;
  corporationId?: string;
  domainName: string;
  originType?: 'MorphusShared' | 'CustomerOwned' | 'PurchasedWithMorphus' | string;
  verificationStatus?: 'PendingVerification' | 'Verified' | string;
  verificationToken?: string | null;
  isPrimary?: boolean;
  description?: string | null;
}

export interface MorphusApplicationSettingRef {
  id?: string;
  key?: string;
  corporationId?: string;
  applicationId?: string;
  settingKey: string;
  label: string;
  valueType: 'string' | 'boolean' | 'number' | 'currency' | 'endpoint' | string;
  value: string;
  endpointUrl?: string | null;
  refreshPolicy?: 'manual' | 'realtime' | 'daily' | string;
  isLockedSystem?: boolean;
  order?: number;
  description?: string | null;
}

export interface DomainCandidateItem {
  subdomain: string;
  fullDomain: string;
  available: boolean;
}

export interface ApplicationDomainPreviewRequest {
  name?: string;
  prefix?: string;
  domainMode?: string;
  customSubdomain?: string;
  corporationDomainId?: string | null;
  excludeApplicationId?: string | null;
}

export interface ApplicationDomainPreviewResponse {
  resolvedPrefix: string;
  nameAndPrefixConflict: boolean;
  firstAttemptSubdomain: string;
  firstAttemptDomain: string;
  firstAttemptAvailable: boolean;
  suggestedAvailableSubdomain?: string | null;
  suggestedAvailableDomain?: string | null;
  progressiveCandidates: DomainCandidateItem[];
  customAttemptSubdomain?: string | null;
  customAttemptDomain?: string | null;
  customAttemptAvailable?: boolean | null;
}

export interface UpdateApplicationBasicSettingsRequest {
  name?: string;
  domainMode?: string;
  subdomain?: string;
  corporationDomainId?: string | null;
}

export interface MorphusApplication extends IMorphusApplicationReflected {
  corporation?: { id: string; name: string; key?: string; icon?: string; color?: string } | null;
  corporationDomain?: MorphusCorporationDomainRef | null;
  category?: MorphusCategoryRef | null;
  applicationStatus?: MorphusApplicationStatusRef | null;
  applicationModules?: MorphusApplicationModuleRef[];
  applicationSettings?: MorphusApplicationSettingRef[];
  workspace?: Workspace;
  workspaceApplications?: WorkspaceApplication[];
  trialStartDate?: string | null;
  trialDays?: number | null;
  trialUsed?: boolean;
  sharedWithWorkspaceId?: string | null;
}
