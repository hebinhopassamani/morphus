import { MpxEntity } from '@core/morphus';

export enum MpxErrorSeverityEnum {
  Low = 0,
  Medium = 1,
  High = 2,
  WorkspaceLevel = 3,
  CorporationLevel = 4
}

export enum MpxErrorStateEnum {
  Open = 0,
  InAnalysis = 1,
  RetryScheduled = 2,
  Escalated = 3,
  Resolved = 4,
  Ignored = 5
}

export interface MpxRoute extends MpxEntity {
  corporationId?: string | null;
  workspaceId?: string | null;
  applicationId?: string | null;
  moduleId?: string | null;
  subModuleId?: string | null;
  name: string;
  label: string;
  path: string;
  isPublic: boolean;
  icon?: string;
  color?: string;
  order: number;
  description?: string;
}

export interface MpxErrorSeverity extends MpxEntity {
  corporationId?: string | null;
  code: MpxErrorSeverityEnum;
  label: string;
  involvesEntireWorkspace: boolean;
  involvesEntireCorporation: boolean;
  icon?: string;
  color?: string;
  order: number;
  description?: string;
}

export interface MpxErrorState extends MpxEntity {
  corporationId?: string | null;
  code: MpxErrorStateEnum;
  label: string;
  isTerminal: boolean;
  icon?: string;
  color?: string;
  order: number;
  description?: string;
}

export interface MpxErrorCode extends MpxEntity {
  code: string;
  name: string;
  corporationId: string;
  workspaceId?: string | null;
  applicationId?: string | null;
  friendlyMessage: string;
  sla: number;
  severityId: string;
  icon?: string;
  color?: string;
  description?: string;
  severity?: MpxErrorSeverity;
}

export interface MpxError extends MpxEntity {
  errorCodeId: string;
  errorStateId: string;
  corporationId: string;
  workspaceId?: string | null;
  applicationId?: string | null;
  workflowTypeId?: string | null;
  workflowId?: string | null;
  workflowTaskId?: string | null;
  originConfigId?: string | null;
  userId?: string | null;
  message: string;
  userMessage: string;
  method: string;
  userSnapshot?: string | null;
  contextSnapshot?: string | null;
  resolvedByUserId?: string | null;
  resolvedAt?: string | null;
  resolutionNotes?: string | null;
  errorCode?: MpxErrorCode;
  errorState?: MpxErrorState;
}
