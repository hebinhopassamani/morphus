namespace Mpx.Domain.Enums;

/// <summary>
/// Régua hierárquica em cascata (0..5) vinculada à tabela 1:N MpxParameterScope (mpx_parameter_scopes.code).
/// 0 (SystemDefault) e 1 (Corporation) são soberanos e NUNCA saem no JSON portátil exportado pelo usuário para o Jarbass.
/// </summary>
public enum MpxParameterScopeEnum : short
{
  SystemDefault = 0,
  Corporation = 1,
  Workspace = 2,
  Application = 3,
  User = 4,
  Machine = 5
}

/// <summary>
/// Código numérico vinculado à tabela 1:N MpxComponentType (mpx_component_types.code).
/// Representa as peças inteligentes auto-encaixáveis do Morphus Studio (MpxDraggable, MpxDroppable, MpxButton, etc.).
/// </summary>
public enum MpxComponentTypeEnum : short
{
  MpxDraggable = 0,
  MpxDroppable = 1,
  MpxButton = 2,
  MpxInput = 3,
  MpxSelect = 4,
  MpxCard = 5,
  MpxForm = 6,
  MpxGrid = 7,
  MpxTable = 8
}
