export interface MpxEntity {
  id: string;
  key: string;
  system?: boolean;
  inactive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  concurrencyStamp?: string;
}
