import { IMorphusEntity } from '@core/mpx-entities';

export interface IEmailCcReflected extends IMorphusEntity {
  mail: string;
  name?: string;
  emailId: string;
}
