import { signal } from '@angular/core';
import { MpxFilterAndOr } from '../filter/filter-operator.model';

export const MpxDefaultFilterAndOr: MpxFilterAndOr = {
  value: undefined,
  label: '...',
};

export const MpxAndOrOptions = signal<MpxFilterAndOr[]>([
  { label: '...', value: undefined },
  { label: 'And', value: 'And' },
  { label: 'Or', value: 'Or' },
]);
