export interface MorphusFilter {
  search?: string;
  page?: number;
  pageSize?: number;
  [key: string]: unknown;
}
