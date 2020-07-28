export enum PropertyType {
  Raw,
  Hash,
}

export type Property = {
  type: PropertyType;
  value: string;
}

export enum AuthType {
  Privacy,
  Package,
  Local,
}

export enum KeyType {
  EDDSA,
  ECDSA,
}

export type Signature = {
  authType: AuthType;
  keyType: KeyType;
  value: string;
}
