namespace Mpx.Domain.Enums;

/// <summary>
/// Código numérico vinculado à tabela 1:N WkfTriggerType (wkf_trigger_types.code).
/// Define o único gatilho inicial ("Play" no centro da tela) de cada WkfType.
/// </summary>
public enum WkfTriggerTypeEnum : short
{
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

/// <summary>
/// Código numérico vinculado à tabela 1:N WkfStationType (wkf_station_types.code - Wkf333).
/// Define os 18 tipos de estação simplificados para tomada de decisão (switch/case) e exibição no Canvas / App Builder.
/// </summary>
public enum WkfStationTypeEnum : short
{
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
