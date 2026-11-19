export interface MpxEntity {
  id: string;
  key: string;
  system?: boolean;
  inactive?: boolean;
  concurrencyStamp?: string;
}
