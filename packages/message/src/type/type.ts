export enum PropertyType {
  Raw = 'RAW',
  Hash = 'HASH',
}

export enum PropertyDataType {
  String = 'String',
  Number = 'NUMBER',
  Date = 'DATE',
  Boolean = 'BOOLEAN',
}

export type PropertyData = string | number | Date | boolean;

export type Property = {
  type: PropertyType;
  dataType: PropertyDataType;
  key: string;
  value: PropertyData;
};

export enum AuthType {
  Privacy = 'PRIVACY',
  Package = 'PACKAGE',
  Local = 'LOCAL',
}

export enum KeyType {
  ECDSA = 'ECDSA',
  EDDSA = 'EDDSA',
}

export type Signature = {
  authType: AuthType;
  keyType: KeyType;
  value: string;
};

export type Supplier<T, U> = (value: T) => U;

export type Predicate<T> = Supplier<T, boolean>;
