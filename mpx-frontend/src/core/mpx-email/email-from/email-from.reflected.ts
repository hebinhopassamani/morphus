import { IMorphusEntity } from '@core/mpx-entities';

export interface IEmailFromReflected extends IMorphusEntity {
  mail: string;
  name?: string;
  emailId: string;
}
