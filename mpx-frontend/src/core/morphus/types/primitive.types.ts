export type MpxNumberOrString = number | string;
export type MpxBoolean = boolean | 'true' | 'false';
export type MpxFilterType<T, U> = T extends U ? T : never;
