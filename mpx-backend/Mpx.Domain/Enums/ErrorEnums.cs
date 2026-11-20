namespace Mpx.Domain.Enums;

/// <summary>
/// Código numérico vinculado à tabela 1:N MpxErrorSeverity (mpx_error_severities.code).
/// Usado para tomada de decisão (switch/case) no C#, enquanto a tabela armazena o Label para exibição e App Builder.
/// </summary>
public enum MpxErrorSeverityEnum : short
{
  Low = 0,
  Medium = 1,
  High = 2,
  WorkspaceLevel = 3,
  CorporationLevel = 4
}

/// <summary>
/// Código numérico vinculado à tabela 1:N MpxErrorState (mpx_error_states.code).
/// Usado para tomada de decisão (switch/case) no C#, enquanto a tabela armazena o Label para exibição e App Builder.
/// </summary>
public enum MpxErrorStateEnum : short
{
  Open = 0,
  InAnalysis = 1,
  RetryScheduled = 2,
  Escalated = 3,
  Resolved = 4,
  Ignored = 5
}
