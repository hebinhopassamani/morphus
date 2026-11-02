import { EmailBcc } from '../email-bcc';
import { EmailCc } from '../email-cc';
import { EmailFrom } from '../email-from';
import { EmailTo } from '../email-to';
import { IEmailReflected } from './email.reflected';

export interface Email extends IEmailReflected {
  emailTo?: EmailTo[];
  emailFrom?: EmailFrom[];
  emailCc?: EmailCc[];
  emailBcc?: EmailBcc[];
}
