import { IMorphusEntity } from '@core/mpx-entities';

export interface IEmailBccReflected extends IMorphusEntity {
  mail: string;
  name?: string;
  emailId: string;
}
