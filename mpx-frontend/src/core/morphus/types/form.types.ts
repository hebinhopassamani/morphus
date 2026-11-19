import { FormControl, FormGroup } from '@angular/forms';

export type MpxModelFormGroup<T> = FormGroup<{
  [K in keyof T]: FormControl<T[K] | null>;
}>;
