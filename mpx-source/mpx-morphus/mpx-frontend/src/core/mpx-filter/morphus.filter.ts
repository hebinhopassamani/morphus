import { FilterParameter } from './filter-parameter.interface';

export interface MorphusFilter {
  whereClause?: string;
  parameters?: FilterParameter[];
  search?: string;
  page?: number;
  pageSize?: number;
  [key: string]: unknown;
}
