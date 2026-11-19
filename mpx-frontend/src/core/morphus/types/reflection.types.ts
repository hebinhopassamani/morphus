import { MpxEntity } from '@core/morphus';

export type MpxFunctionsName<T> = { [K in keyof T]: T[K] extends (...args: unknown[]) => unknown ? K : never }[keyof T];
export type MpxFunctionsOf<T> = Pick<T, MpxFunctionsName<T>>;

export type MpxAttributesName<T> = { [K in keyof T]: T[K] extends (...args: unknown[]) => unknown ? never : K }[keyof T];
export type MpxAttributesOf<T> = Pick<T, MpxAttributesName<T>>;

export type MpxNonListAttribute<T> = { [K in keyof T]: NonNullable<T[K]> extends object[] ? never : K }[keyof T];
export type MpxAttribute<T> = { [K in keyof T]: NonNullable<T[K]> extends MpxEntity ? K : never }[keyof T];
export type MpxAttributeList<T> = { [K in keyof T]: NonNullable<T[K]> extends MpxEntity[] ? K : never }[keyof T];

export type MpxRequiredAttributes<T> = {
  [K in keyof T]: object extends Pick<T, K> ? never : K;
} extends { [_ in keyof T]: infer U }
  ? object extends U
    ? never
    : U
  : never;

export type MpxOptionalAttributes<T> = {
  [K in keyof T]: string extends K ? never : number extends K ? never : object extends Pick<T, K> ? K : never;
} extends { [_ in keyof T]: infer U }
  ? object extends U
    ? never
    : U
  : never;
