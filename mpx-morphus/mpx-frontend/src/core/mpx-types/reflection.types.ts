import { IMorphusEntity } from '@core/mpx-entities';

export type FunctionsName<T> = { [K in keyof T]: T[K] extends (...args: unknown[]) => unknown ? K : never }[keyof T];
export type FunctionsOf<T> = Pick<T, FunctionsName<T>>;

export type AttributesName<T> = { [K in keyof T]: T[K] extends (...args: unknown[]) => unknown ? never : K }[keyof T];
export type AttributesOf<T> = Pick<T, AttributesName<T>>;

export type NomListAttribute<T> = { [K in keyof T]: NonNullable<T[K]> extends object[] ? never : K }[keyof T];
export type MorphusAttribute<T> = { [K in keyof T]: NonNullable<T[K]> extends IMorphusEntity ? K : never }[keyof T];
export type MorphusAttributeList<T> = { [K in keyof T]: NonNullable<T[K]> extends IMorphusEntity[] ? K : never }[keyof T];

export type RequiredAttributes<T> = {
  [K in keyof T]: object extends Pick<T, K> ? never : K;
} extends { [_ in keyof T]: infer U }
  ? object extends U
    ? never
    : U
  : never;

export type OptionalAttributes<T> = {
  [K in keyof T]: string extends K ? never : number extends K ? never : object extends Pick<T, K> ? K : never;
} extends { [_ in keyof T]: infer U }
  ? object extends U
    ? never
    : U
  : never;
