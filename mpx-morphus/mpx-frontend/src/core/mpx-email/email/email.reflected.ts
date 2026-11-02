import { IMorphusEntity } from '@core/mpx-entities';

export interface IEmailReflected extends IMorphusEntity {
  subject?: string;
  htmlBody?: string;
  textBody?: string;
  isHtmlBody: boolean;
  mailSent: boolean;
}
