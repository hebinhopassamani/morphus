import { IMorphusMessageLink } from './message-link.interface';
import { MorphusMessageSeverity } from './message-severity.enum';

export interface IMorphusMessage {
  id?: string;
  severity?: MorphusMessageSeverity;
  title?: string;
  detail?: string;
  icon?: string;
  titleLink?: IMorphusMessageLink;
  detailLink?: IMorphusMessageLink;
  isConfirmation?: boolean;
  confirmButtonText?: string;
  confirmButtonIcon?: string;
  cancelButtonText?: string;
  cancelButtonIcon?: string;
  showCancelButton?: boolean;
  closable?: boolean;
  disableClose?: boolean;
  doubleCheck?: boolean;
  doubleCheckLabel?: string;
  doubleCheckText?: string;
  doubleCheckPlaceholder?: string;
  error?: unknown;
  data?: unknown;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
}
