import { MpxEntity } from '@core/morphus';

export interface EmailReflected extends MpxEntity {
  subject?: string;
  htmlBody?: string;
  textBody?: string;
  isHtmlBody: boolean;
  mailSent: boolean;
}
