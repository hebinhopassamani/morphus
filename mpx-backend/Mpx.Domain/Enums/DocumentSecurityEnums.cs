namespace Mpx.Domain.Enums;

/// <summary>
/// Código numérico vinculado à tabela 1:N JarbassSecurityScope (jrb_security_scopes.code).
/// Usado para tomada de decisão (switch/case) no C#, enquanto a tabela armazena o Label para exibição e App Builder.
/// </summary>
public enum JarbassSecurityScopeEnum : short
{
  ByDocumentType = 0,
  ByDocumentInstance = 1
}

/// <summary>
/// Código numérico vinculado à tabela 1:N JarbassSecurityLevel (jrb_security_levels.code).
/// Usado para tomada de decisão (switch/case) no C#, enquanto a tabela armazena o Label para exibição e App Builder.
/// </summary>
public enum JarbassSecurityLevelEnum : short
{
  Unrestricted = 0,
  TrackedOffline = 1,
  ProtectedOffline = 2,
  AuditedOffline = 3,
  OnlineRevalidation = 4,
  StrictOnline = 5
}

/// <summary>
/// Código numérico vinculado à tabela 1:N JarbassPermissionLevel (jrb_permission_levels.code).
/// Usado para tomada de decisão (switch/case) no C#, enquanto a tabela armazena o Label para exibição e App Builder.
/// </summary>
public enum JarbassPermissionLevelEnum : short
{
  None = 0,
  ReadOnly = 1,
  ReadWrite = 2,
  FullControl = 3
}

/// <summary>
/// Código numérico vinculado à tabela 1:N JarbassEncryptionState (jrb_encryption_states.code).
/// Usado para tomada de decisão (switch/case) no C#, enquanto a tabela armazena o Label para exibição e App Builder.
/// </summary>
public enum JarbassEncryptionStateEnum : short
{
  Plaintext = 0,
  EncryptedAtRest = 1,
  DecryptedInHand = 2,
  LockedOnTamper = 3
}
