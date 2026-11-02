import { IMorphusEntity } from '@core/mpx-entities';

export interface IEmailToReflected extends IMorphusEntity {
  mail: string;
  name?: string;
  emailId: string;
}
