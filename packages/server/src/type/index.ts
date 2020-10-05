import { AuthType, KeyType, Signature } from '@0auth/message';

export type SecretKey = {
  type: KeyType;
  key: string;
};

export type PublicKey = {
  type: KeyType;
  key: string;
};

export type Supplier<T, U> = (value: T) => U;

export type Predicate<T> = Supplier<T, boolean>;

export type KeySupplier<K, T, U> = (v1: K, v2: T) => U;

export type RegisterInfo = {
  validate: KeySupplier<string, Predicate<string>, RegisterInfo>;
  sign: KeySupplier<SecretKey, AuthType, Signature | null>;
};

export type SubmitInfo<T> = {
  validate: KeySupplier<string, Predicate<string>, SubmitInfo<T>>;
  confirm: Supplier<T, T | null>;
  supply: Supplier<() => T, T | null>;
};
