import { MpxEntity } from '@core/morphus';

export enum MpxParameterScopeEnum {
  SystemDefault = 0,
  Corporation = 1,
  Workspace = 2,
  Application = 3,
  User = 4,
  Machine = 5,
}

export enum MpxComponentTypeEnum {
  MpxDraggable = 0,
  MpxDroppable = 1,
  MpxButton = 2,
  MpxInput = 3,
  MpxSelect = 4,
  MpxCard = 5,
  MpxForm = 6,
  MpxGrid = 7,
  MpxTable = 8,
}

export interface MpxParameterScope extends MpxEntity {
  corporationId?: string | null;
  code: MpxParameterScopeEnum;
  name: string;
  label: string;
  isSystemSovereign: boolean;
  isExportableToJarbass: boolean;
  icon?: string;
  color?: string;
  order: number;
  description?: string;
}

export interface MpxParameter extends MpxEntity {
  corporationId?: string | null;
  scopeId: string;
  scopeCode: MpxParameterScopeEnum;
  workspaceId?: string | null;
  applicationId?: string | null;
  userId?: string | null;
  machineKey?: string | null;
  namespace: string;
  name: string;
  settingsJson: string;
  isLockedBySovereign: boolean;
  isExportable: boolean;
  description?: string;
  scope?: MpxParameterScope;
}

export interface MpxComponentType extends MpxEntity {
  corporationId?: string | null;
  code: MpxComponentTypeEnum;
  tagName: string;
  name: string;
  label: string;
  isContainerWrapper: boolean;
  supportsWorkflowAction: boolean;
  supportsReflectedField: boolean;
  defaultParametersJson: string;
  icon?: string;
  color?: string;
  order: number;
  description?: string;
}

export interface MpxScreenComponent extends MpxEntity {
  corporationId: string;
  componentTypeId: string;
  routeId?: string | null;
  workflowTypeId?: string | null;
  stationId?: string | null;
  workflowConfigId?: string | null;
  workflowActionId?: string | null;
  entityPropertyId?: string | null;
  parentComponentId?: string | null;
  componentCode: string;
  label: string;
  triggerEvent: string;
  embeddedConfigJson: string;
  order: number;
  description?: string;
  componentType?: MpxComponentType;
}
