export interface IMorphusEntity {
  id: string;
  key: string;
  system?: boolean;
  inactive?: boolean;
  concurrencyStamp?: string;
}
