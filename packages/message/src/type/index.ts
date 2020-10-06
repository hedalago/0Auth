export enum PropertyType {
  Raw = 'RAW',
  Hash = 'HASH',
}

export type Property = {
  type: PropertyType;
  key: string;
  value: string;
};

export enum AuthType {
  Privacy = 'PRIVACY',
  Package = 'PACKAGE',
  Local = 'LOCAL',
}

export enum KeyType {
  EDDSA = 'EDDSA',
  ECDSA = 'ECDSA',
}

export type Signature = {
  authType: AuthType;
  keyType: KeyType;
  value: string;
};
