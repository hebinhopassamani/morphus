import { EmailBcc } from '../email-bcc/email-bcc.entity';
import { EmailCc } from '../email-cc/email-cc.entity';
import { EmailFrom } from '../email-from/email-from.entity';
import { EmailTo } from '../email-to/email-to.entity';
import { EmailReflected } from './email.reflected';

export interface Email extends EmailReflected {
  emailTo?: EmailTo[];
  emailFrom?: EmailFrom[];
  emailCc?: EmailCc[];
  emailBcc?: EmailBcc[];
}
