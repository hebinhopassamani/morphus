import { MpxFilterParameter } from './filter-parameter.model';

export interface MpxFilter {
  whereClause?: string;
  parameters?: MpxFilterParameter[];
  search?: string;
  page?: number;
  pageSize?: number;
  [key: string]: unknown;
}
