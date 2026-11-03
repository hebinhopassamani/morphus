export type NumberOrString = number | string;
export type MorphusBoolean = boolean | 'true' | 'false';
export type Filter<T, U> = T extends U ? T : never;
