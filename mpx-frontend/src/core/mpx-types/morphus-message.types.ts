export type MorphusMessageSeverity =
  | 'warn'
  | 'info'
  | 'success'
  | 'alert'
  | 'error'
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'surface'
  | 'help'
  | 'contrast';

export type Severity = MorphusMessageSeverity;
export type MessageSeverity = MorphusMessageSeverity;

export type ResultType = 'CONFIRM' | 'CLOSE';
export type MessageResult = 'confirm' | 'close' | ResultType;

export type MorphusMessageType =
  | 'NORMAL'
  | 'SESSION_EXPIRED'
  | 'LOGIN'
  | 'LOGOUT'
  | 'normal'
  | 'none'
  | 'login'
  | 'new_acount'
  | 'register'
  | 'expired_session'
  | 'expired'
  | 'refresh_login';

export type MessageType = MorphusMessageType;
