import { KeyType, Property, Signature } from '@0auth/message';

type SecretKey = {
  type: KeyType;
  key: string;
};

type PublicKey = {
  type: KeyType;
  key: string;
};

// TODO: @ts-ignore should be removed, when below function is implemented.
// @ts-ignore
export function authPrivacy(
  properties: Property[],
  secret: SecretKey
): Signature {
  // TODO: Not implemented yet.
}

// TODO: @ts-ignore should be removed, when below function is implemented.
// @ts-ignore
export function authPackage(
  properties: Property[],
  secret: SecretKey
): Signature {
  // TODO: Not implemented yet.
}

// TODO: @ts-ignore should be removed, when below function is implemented.
// @ts-ignore
export function verifyPrivacy(
  properties: Property[],
  sign: Signature,
  publicKey: PublicKey
): boolean {
  // TODO: Not implemented yet.
}

// TODO: @ts-ignore should be removed, when below function is implemented.
// @ts-ignore
export function verifyPackage(
  properties: Property[],
  sign: Signature,
  publicKey: PublicKey
): boolean {
  // TODO: Not implemented yet.
}
