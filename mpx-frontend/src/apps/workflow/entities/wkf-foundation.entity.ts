import { MpxEntity } from '@core/morphus';

export enum WkfTriggerTypeEnum {
  HtmlAction = 0,
  OnSubWorkflow = 1,
  OnSchedule = 2,
  OnWebhook = 3,
  OnChatMessage = 4,
  OnEmailImap = 5,
  OnError = 6,
  OnMorphusEvent = 7,
  OnSseEvent = 8
}

export enum WkfStationTypeEnum {
  Input = 0,
  Output = 1,
  Screen = 2,
  Process = 3,
  CodeExecution = 4,
  EditFields = 5,
  RemoveDuplicates = 6,
  DateTime = 7,
  DataConversion = 8,
  SplitOut = 9,
  Aggregate = 10,
  Merge = 11,
  Summarize = 12,
  HttpRequest = 13,
  ExecuteCommand = 14,
  Email = 15,
  Redirect = 16,
  Error = 17
}

export interface WkfTriggerType extends MpxEntity {
  corporationId?: string | null;
  code: WkfTriggerTypeEnum;
  name: string;
  label: string;
  requiresRoute: boolean;
  requiresSchedule: boolean;
  icon?: string;
  color?: string;
  order: number;
  description?: string;
}

export interface WkfStationType extends MpxEntity {
  corporationId?: string | null;
  code: WkfStationTypeEnum;
  name: string;
  label: string;
  isInputPort: boolean;
  isOutputPort: boolean;
  isIsolatedErrorCatcher: boolean;
  hasLayout: boolean;
  icon?: string;
  color?: string;
  order: number;
  description?: string;
}
