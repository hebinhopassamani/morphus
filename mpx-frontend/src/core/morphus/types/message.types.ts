export type MpxMessageSeverity =
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

export type MpxResultType = 'CONFIRM' | 'CLOSE';
export type MpxMessageResult = 'confirm' | 'close' | MpxResultType;

export type MpxMessageType =
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
