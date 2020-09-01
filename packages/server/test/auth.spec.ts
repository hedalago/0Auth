import { expect } from 'chai';
import { AuthType, hashProperty, KeyType, Property, PropertyType } from '@0auth/message';
import { ec as ECDSA, eddsa as EdDSA } from 'elliptic';
import {
  authPackage,
  authPrivacy,
  authProperty,
  issueProperty,
  publicKeyFromSecret,
  verifyPackage,
  verifyPrivacy,
  verifyProperty,
} from '../src';
import { getMerkleRoot, objectToProperty, publicKeyFromKeyString, signByKeyType, verifyByKeyType } from '../src/utils';
import { hideProperty } from '../../client/src';

describe('test server utils', () => {
  it('test merkle root', () => {
    const properties = Array.from(Array(100).keys())
      .map((index) => ({ type: PropertyType.Raw, key: `key${index}`, value: `value${index}` }))
      .map((property) => hashProperty(property));
    expect(getMerkleRoot(properties)).to.be.equal('5f51373a384a121a2d47a4c94c5e3e07ebb994a2f1db99190c2329d5b8e0a1b1');
  });
  it('test public key from key string in ECDSA', () => {
    const secretKeyString = '2ef40452ec154cd38efdc8ffa52e7f513f7d2b2a77e028342bde96c369e4f77a';
    const publicKey = publicKeyFromKeyString(secretKeyString, KeyType.ECDSA);
    expect(publicKey).to.be.equal('048da7b63430eb4db203177baf2e8699a25116561624e67a31c2bf288d54216ce3f6f9c7b81fdbb5732342475a6ee5ccab883277ddbb38fdb79ab5424d401b844a');
  });
  it('test public key from key string in EDDSA', () => {
    const secretKeyString = '2ef40452ec154cd38efdc8ffa52e7f513f7d2b2a77e028342bde96c369e4f77a';
    const publicKey = publicKeyFromKeyString(secretKeyString, KeyType.EDDSA);
    expect(publicKey).to.be.equal('cb7da1efe0ca47d03ff12d1b8f01160debf62c0a2cb2517251f3019d61e0c5f3');
  });
  it('test object to property', () => {
    const object = { name: 'Hyeock-Jin', age: '25', address: 'Daejeon' };
    const properties = objectToProperty(object);

    expect(properties).to.be.deep.equal([
      {
        key: 'name',
        type: 'RAW',
        value: 'Hyeock-Jin',
      },
      {
        key: 'age',
        type: 'RAW',
        value: '25',
      },
      {
        key: 'address',
        type: 'RAW',
        value: 'Daejeon',
      },
    ]);
  });
});

describe('test privacy mode authentication', () => {
  const properties: Property[] = [
    { key: 'name', type: PropertyType.Raw, value: 'Kim' },
    { key: 'age', type: PropertyType.Raw, value: '17' },
    { key: 'address', type: PropertyType.Raw, value: 'Seoul' },
  ];
  it('test ECDSA authentication', () => {
    const ecdsa = new ECDSA('secp256k1');
    const key1 = ecdsa.keyFromPrivate('2ef40452ec154cd38efdc8ffa52e7f513f7d2b2a77e028342bde96c369e4f77a');
    const key2 = ecdsa.keyFromPrivate('f351840fba553b777dcdd76b410b37924ffc0a1f2876be5b52440397b15ab6ab');
    const hashes = properties.map((property) => hashProperty(property));
    const merkleRoot = getMerkleRoot(hashes);
    const secret1 = { key: key1.getPrivate('hex'), type: KeyType.ECDSA };
    const sign = authPrivacy(properties, secret1);

    expect(key1.verify(merkleRoot, sign.value)).to.be.equal(true);
    expect(key2.verify(merkleRoot, sign.value)).to.be.equal(false);
    expect(verifyByKeyType(merkleRoot, sign.value, key1.getPublic('hex'), KeyType.ECDSA)).to.be.equal(true);
    expect(verifyByKeyType(merkleRoot, sign.value, key2.getPublic('hex'), KeyType.ECDSA)).to.be.equal(false);
    expect(verifyPrivacy(properties, sign, publicKeyFromSecret(secret1))).to.be.equal(true);
    expect(verifyPrivacy(properties, sign, { key: key2.getPublic('hex'), type: KeyType.ECDSA })).to.be.equal(false);
  });
  it('test EdDSA authentication', () => {
    const eddsa = new EdDSA('ed25519');
    const key1 = eddsa.keyFromSecret('2ef40452ec154cd38efdc8ffa52e7f513f7d2b2a77e028342bde96c369e4f77a');
    const key2 = eddsa.keyFromSecret('f351840fba553b777dcdd76b410b37924ffc0a1f2876be5b52440397b15ab6ab');
    const hashes = properties.map((property) => hashProperty(property));
    const merkleRoot = getMerkleRoot(hashes);
    const secret = { key: key1.getSecret('hex'), type: KeyType.EDDSA };
    const secret2 = { key: key2.getSecret('hex'), type: KeyType.EDDSA };
    const sign = authPrivacy(properties, secret);

    expect(key1.verify(merkleRoot, sign.value)).to.be.equal(true);
    expect(key2.verify(merkleRoot, sign.value)).to.be.equal(false);
    expect(verifyByKeyType(merkleRoot, sign.value, key1.getPublic('hex'), KeyType.EDDSA)).to.be.equal(true);
    expect(verifyByKeyType(merkleRoot, sign.value, key2.getPublic('hex'), KeyType.EDDSA)).to.be.equal(false);
    expect(verifyPrivacy(properties, sign, publicKeyFromSecret(secret))).to.be.equal(true);
    expect(verifyPrivacy(properties, sign, publicKeyFromSecret(secret2))).to.be.equal(false);
  });
  it('test when the key type of signature and public key is different', () => {
    const ecdsa = new ECDSA('secp256k1');
    const eddsa = new EdDSA('ed25519');
    const key1 = ecdsa.keyFromPrivate('2ef40452ec154cd38efdc8ffa52e7f513f7d2b2a77e028342bde96c369e4f77a');
    const key2 = eddsa.keyFromSecret('2ef40452ec154cd38efdc8ffa52e7f513f7d2b2a77e028342bde96c369e4f77a');
    const hashes = properties.map((property) => hashProperty(property));
    const merkleRoot = getMerkleRoot(hashes);
    const sign = authPrivacy(properties, { key: key1.getPrivate('hex'), type: KeyType.ECDSA });

    expect(() => key2.verify(merkleRoot, sign.value)).to.throw('Assertion failed');
    expect(() => verifyByKeyType(merkleRoot, sign.value, key2.getPublic('hex'), KeyType.EDDSA)).to.throw('Assertion failed');
    expect(verifyPrivacy(properties, sign, { key: key2.getPublic('hex'), type: KeyType.EDDSA })).to.be.equal(false);
  });
  it('test if properties are different', () => {
    const properties1: Property[] = [
      { key: 'a', type: PropertyType.Raw, value: 'b,c' },
      { key: 'name', type: PropertyType.Raw, value: 'Kim' },
      { key: 'age', type: PropertyType.Raw, value: '17' },
      { key: 'address', type: PropertyType.Raw, value: 'Seoul' },
    ];
    const properties2: Property[] = [
      { key: 'a,b', type: PropertyType.Raw, value: 'c' },
      { key: 'name', type: PropertyType.Raw, value: 'Kim' },
      { key: 'age', type: PropertyType.Raw, value: '17' },
      { key: 'address', type: PropertyType.Raw, value: 'Seoul' },
    ];
    const ecdsa = new ECDSA('secp256k1');
    const key = ecdsa.keyFromPrivate('2ef40452ec154cd38efdc8ffa52e7f513f7d2b2a77e028342bde96c369e4f77a');
    const sign1 = authPrivacy(properties1, { key: key.getPrivate('hex'), type: KeyType.ECDSA });
    const sign2 = authPrivacy(properties2, { key: key.getPrivate('hex'), type: KeyType.ECDSA });

    expect(sign1).to.be.not.equal(sign2);
  });
  it('should Korean property', () => {
    const properties2: Property[] = [
      { key: '이름', type: PropertyType.Raw, value: '김' },
      { key: '나이', type: PropertyType.Raw, value: '25' },
      { key: '주소', type: PropertyType.Raw, value: '서울' },
    ];
    const ecdsa = new ECDSA('secp256k1');
    const key = ecdsa.keyFromPrivate('2ef40452ec154cd38efdc8ffa52e7f513f7d2b2a77e028342bde96c369e4f77a');
    const secret = { key: key.getPrivate('hex'), type: KeyType.ECDSA };
    const sign = authPrivacy(properties2, secret);

    expect(verifyPrivacy(properties2, sign, publicKeyFromSecret(secret))).to.be.equal(true);
  });
  it('test Signature verification without some value', () => {
    const properties2 = [
      { key: 'name', type: PropertyType.Hash, value: hashProperty(properties[0]) },
      { key: 'age', type: PropertyType.Raw, value: '17' },
      { key: 'address', type: PropertyType.Hash, value: hashProperty(properties[2]) },
    ];
    const ecdsa = new ECDSA('secp256k1');
    const key = ecdsa.keyFromPrivate('2ef40452ec154cd38efdc8ffa52e7f513f7d2b2a77e028342bde96c369e4f77a');
    const secret = { key: key.getPrivate('hex'), type: KeyType.ECDSA };
    const sign = authPrivacy(properties, secret);

    expect(verifyPrivacy(properties, sign, publicKeyFromSecret(secret))).to.be.equal(true);
    expect(verifyPrivacy(properties2, sign, publicKeyFromSecret(secret))).to.be.equal(true);
  });
});

describe('test package mode authentication', () => {
  const properties: Property[] = [
    { key: 'email', type: PropertyType.Raw, value: 'abc@github.com' },
    { key: 'phone', type: PropertyType.Raw, value: '010-1234-5678' },
    { key: 'address', type: PropertyType.Raw, value: 'Seoul' },
  ];
  it('test ECDSA authentication & verification using package mode', () => {
    const ecdsa = new ECDSA('secp256k1');
    const key = ecdsa.keyFromPrivate('2ef40452ec154cd38efdc8ffa52e7f513f7d2b2a77e028342bde96c369e4f77a');
    const secret = { key: key.getPrivate('hex'), type: KeyType.ECDSA };
    const sign = authPackage(properties, secret);

    expect(verifyPackage(properties, sign, publicKeyFromSecret(secret))).to.be.equal(true);
  });
  it('test EdDSA authentication & verification using package mode', () => {
    const eddsa = new EdDSA('ed25519');
    const key = eddsa.keyFromSecret('2ef40452ec154cd38efdc8ffa52e7f513f7d2b2a77e028342bde96c369e4f77a');
    const secret = { key: key.getSecret('hex'), type: KeyType.EDDSA };
    const sign = authPackage(properties, secret);

    expect(verifyPackage(properties, sign, publicKeyFromSecret(secret))).to.be.equal(true);
  });
});

describe('test signing register info', () => {
  const properties: Property[] = [
    { key: 'name', type: PropertyType.Raw, value: 'Kim' },
    { key: 'age', type: PropertyType.Raw, value: '17' },
    { key: 'address', type: PropertyType.Raw, value: 'Seoul' },
  ];
  it('test the successful case of registration of EdDSA', () => {
    const eddsa = new EdDSA('ed25519');
    const key = eddsa.keyFromSecret('2ef40452ec154cd38efdc8ffa52e7f513f7d2b2a77e028342bde96c369e4f77a');
    const authKey = { key: key.getSecret('hex'), type: KeyType.EDDSA };
    const verifyingKey = publicKeyFromSecret(authKey);

    const sign = authProperty(properties)
      .validate('name', (p) => p.length >= 2)
      .validate('address', (p) => p.length >= 3)
      .sign(authKey, AuthType.Privacy);

    expect(verifyPrivacy(properties, sign, verifyingKey)).to.be.equal(true);
  });
  it('test the successful case of registration of ECDSA', () => {
    const ecdsa = new ECDSA('secp256k1');
    const key = ecdsa.keyFromPrivate('2ef40452ec154cd38efdc8ffa52e7f513f7d2b2a77e028342bde96c369e4f77a');
    const authKey = { key: key.getPrivate('hex'), type: KeyType.ECDSA };
    const verifyingKey = publicKeyFromSecret(authKey);

    const sign = authProperty(properties)
      .validate('name', (p) => p.length >= 2)
      .validate('address', (p) => p.length >= 3)
      .sign(authKey, AuthType.Privacy);

    expect(verifyPrivacy(properties, sign, verifyingKey)).to.be.equal(true);
  });
  it('test the failure case of registration of EdDSA', () => {
    const eddsa = new EdDSA('ed25519');
    const key = eddsa.keyFromSecret('2ef40452ec154cd38efdc8ffa52e7f513f7d2b2a77e028342bde96c369e4f77a');
    const authKey = { key: key.getSecret('hex'), type: KeyType.EDDSA };
    expect(
      authProperty(properties)
        .validate('age', (v) => Number(v) >= 19)
        .sign(authKey, AuthType.Privacy),
    ).to.be.equal(null);
  });
  it('test the failure case of registration of ECDSA', () => {
    const ecdsa = new ECDSA('secp256k1');
    const key = ecdsa.keyFromPrivate('2ef40452ec154cd38efdc8ffa52e7f513f7d2b2a77e028342bde96c369e4f77a');
    const authKey = { key: key.getPrivate('hex'), type: KeyType.ECDSA };

    expect(
      authProperty(properties)
        .validate('age', (v) => Number(v) >= 19)
        .sign(authKey, AuthType.Privacy),
    ).to.be.equal(null);
  });
});

describe('test receive info', () => {
  const properties: Property[] = [
    { key: 'name', type: PropertyType.Raw, value: 'Kim' },
    { key: 'age', type: PropertyType.Raw, value: '17' },
    { key: 'address', type: PropertyType.Raw, value: 'Seoul' },
  ];
  const eddsa = new EdDSA('ed25519');
  const key = eddsa.keyFromSecret('2ef40452ec154cd38efdc8ffa52e7f513f7d2b2a77e028342bde96c369e4f77a');
  const secretKey = { key: key.getSecret('hex'), type: KeyType.EDDSA };
  const publicKey = publicKeyFromSecret(secretKey);

  it('test receive property with Privacy mode', () => {
    const sign = authProperty(properties).sign(secretKey, AuthType.Privacy);
    // eslint-disable-next-line no-unused-expressions
    expect(sign).to.be.not.null;
    expect(verifyProperty(properties, sign, publicKey, AuthType.Privacy).confirm(true)).to.be.equal(true);
  });
  it('test validation with Privacy mode', () => {
    const sign = authProperty(properties).sign(secretKey, AuthType.Privacy);
    const res = verifyProperty(properties, sign, publicKey, AuthType.Privacy)
      .validate('age', (age) => Number(age) >= 15)
      .confirm({ token: true });
    expect(res).to.be.deep.equal({ token: true });
  });
  it('test the failure case with Privacy mode', () => {
    const sign = authProperty(properties).sign(secretKey, AuthType.Privacy);
    const res = verifyProperty(properties, sign, publicKey, AuthType.Privacy)
      .validate('address', (address) => address === 'Daejeon')
      .confirm({ token: true });
    expect(res).to.be.null;
  });
  it('test receive property with Package mode', () => {
    const sign = authProperty(properties).sign(secretKey, AuthType.Package);
    // eslint-disable-next-line no-unused-expressions
    expect(sign).to.be.not.null;
    expect(verifyProperty(properties, sign, publicKey, AuthType.Package).confirm(true)).to.be.equal(true);
  });
  it('test validation with Package mode', () => {
    const sign = authProperty(properties).sign(secretKey, AuthType.Package);
    const res = verifyProperty(properties, sign, publicKey, AuthType.Package)
      .validate('age', (age) => Number(age) >= 15)
      .confirm({ token: true });
    expect(res).to.be.deep.equal({ token: true });
  });
  it('test the failure case with Package mode', () => {
    const sign = authProperty(properties).sign(secretKey, AuthType.Package);
    const res = verifyProperty(properties, sign, publicKey, AuthType.Package)
      .validate('address', (address) => address === 'Daejeon')
      .confirm({ token: true });
    expect(res).to.be.null;
  });
  it('test validation with Privacy mode when using hash', () => {
    const sign = authProperty(properties).sign(secretKey, AuthType.Privacy);
    const propertiesWithHash = hideProperty(properties, ['age', 'address']);
    const res = verifyProperty(propertiesWithHash, sign, publicKey, AuthType.Privacy)
      .validate('age', (age) => Number(age) >= 15)
      .confirm({ token: true });
    expect(res).to.be.null;
  });
});

describe('get public key', () => {
  it('test verification using public key from secret key in ECDSA', () => {
    const secretKeyString = '2ef40452ec154cd38efdc8ffa52e7f513f7d2b2a77e028342bde96c369e4f77a';
    const secret = {
      key: secretKeyString,
      type: KeyType.ECDSA,
    };
    const value = '0Auth library';
    const sign = signByKeyType(value, secret.key, KeyType.ECDSA);
    const publicKey = publicKeyFromSecret(secret);
    expect(verifyByKeyType(value, sign, publicKey.key, publicKey.type)).to.be.true;
  });
  it('test verification using public key from secret key in EDDSA', () => {
    const secretKeyString = '2ef40452ec154cd38efdc8ffa52e7f513f7d2b2a77e028342bde96c369e4f77a';
    const secret = {
      key: secretKeyString,
      type: KeyType.EDDSA,
    };
    const value = '0Auth library';
    const sign = signByKeyType(value, secret.key, KeyType.EDDSA);
    const publicKey = publicKeyFromSecret(secret);
    expect(verifyByKeyType(value, sign, publicKey.key, publicKey.type)).to.be.true;
  });
});

describe('issue properties test', () => {
  const object = { name: 'Hyeock-Jin', age: '25', address: 'Daejeon' };
  const properties = objectToProperty(object);
  it('test issuance in ECDSA using Privacy mode', () => {
    const secretKeyString = '2ef40452ec154cd38efdc8ffa52e7f513f7d2b2a77e028342bde96c369e4f77a';
    const secret = {
      key: secretKeyString,
      type: KeyType.ECDSA,
    };
    const publicKey = publicKeyFromSecret(secret);
    const sign = issueProperty(object, secret, AuthType.Privacy);
    expect(verifyPrivacy(properties, sign, publicKey)).to.be.true;
  });
  it('test issuance in EdDSA using Privacy mode', () => {
    const secretKeyString = '2ef40452ec154cd38efdc8ffa52e7f513f7d2b2a77e028342bde96c369e4f77a';
    const secret = {
      key: secretKeyString,
      type: KeyType.EDDSA,
    };
    const publicKey = publicKeyFromSecret(secret);
    const sign = issueProperty(object, secret, AuthType.Privacy);
    expect(verifyPrivacy(properties, sign, publicKey)).to.be.true;
  });
  it('test issuance in ECDSA using Package mode', () => {
    const secretKeyString = '2ef40452ec154cd38efdc8ffa52e7f513f7d2b2a77e028342bde96c369e4f77a';
    const secret = {
      key: secretKeyString,
      type: KeyType.ECDSA,
    };
    const publicKey = publicKeyFromSecret(secret);
    const sign = issueProperty(object, secret, AuthType.Package);
    expect(verifyPackage(properties, sign, publicKey)).to.be.true;
  });
  it('test issuance in EdDSA using Package mode', () => {
    const secretKeyString = '2ef40452ec154cd38efdc8ffa52e7f513f7d2b2a77e028342bde96c369e4f77a';
    const secret = {
      key: secretKeyString,
      type: KeyType.EDDSA,
    };
    const publicKey = publicKeyFromSecret(secret);
    const sign = issueProperty(object, secret, AuthType.Package);
    expect(verifyPackage(properties, sign, publicKey)).to.be.true;
  });
});
