import { expect } from 'chai';
import {
  hashProperty, KeyType, Property, PropertyType, AuthType,
} from '@0auth/message';
import { ec as ECDSA, eddsa as EdDSA } from 'elliptic';
import {
  authPackage, authPrivacy, verifyPackage, verifyPrivacy, signRegister,
} from '../src';
import {
  getMerkleRoot, verifyByKeyType,
} from '../src/utils';

describe('test server utils', () => {
  it('test merkle root', () => {
    const properties = Array.from(Array(100).keys())
      .map((index) => ({ type: PropertyType.Raw, key: `key${index}`, value: `value${index}` }))
      .map((property) => hashProperty(property));
    expect(getMerkleRoot(properties)).to.be.equal('5f51373a384a121a2d47a4c94c5e3e07ebb994a2f1db99190c2329d5b8e0a1b1');
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
    const sign = authPrivacy(properties, { key: key1.getPrivate('hex'), type: KeyType.ECDSA });

    expect(key1.verify(merkleRoot, sign.value)).to.be.equal(true);
    expect(key2.verify(merkleRoot, sign.value)).to.be.equal(false);
    expect(verifyByKeyType(merkleRoot, sign.value, key1.getPublic('hex'), KeyType.ECDSA)).to.be.equal(true);
    expect(verifyByKeyType(merkleRoot, sign.value, key2.getPublic('hex'), KeyType.ECDSA)).to.be.equal(false);
    expect(verifyPrivacy(properties, sign, { key: key1.getPublic('hex'), type: KeyType.ECDSA })).to.be.equal(true);
    expect(verifyPrivacy(properties, sign, { key: key2.getPublic('hex'), type: KeyType.ECDSA })).to.be.equal(false);
  });
  it('test EdDSA authentication', () => {
    const eddsa = new EdDSA('ed25519');
    const key1 = eddsa.keyFromSecret('2ef40452ec154cd38efdc8ffa52e7f513f7d2b2a77e028342bde96c369e4f77a');
    const key2 = eddsa.keyFromSecret('f351840fba553b777dcdd76b410b37924ffc0a1f2876be5b52440397b15ab6ab');
    const hashes = properties.map((property) => hashProperty(property));
    const merkleRoot = getMerkleRoot(hashes);
    const sign = authPrivacy(properties, { key: key1.getSecret('hex'), type: KeyType.EDDSA });

    expect(key1.verify(merkleRoot, sign.value)).to.be.equal(true);
    expect(key2.verify(merkleRoot, sign.value)).to.be.equal(false);
    expect(verifyByKeyType(merkleRoot, sign.value, key1.getPublic('hex'), KeyType.EDDSA)).to.be.equal(true);
    expect(verifyByKeyType(merkleRoot, sign.value, key2.getPublic('hex'), KeyType.EDDSA)).to.be.equal(false);
    expect(verifyPrivacy(properties, sign, { key: key1.getPublic('hex'), type: KeyType.EDDSA })).to.be.equal(true);
    expect(verifyPrivacy(properties, sign, { key: key2.getPublic('hex'), type: KeyType.EDDSA })).to.be.equal(false);
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
    const sign = authPrivacy(properties2, { key: key.getPrivate('hex'), type: KeyType.ECDSA });

    expect(verifyPrivacy(properties2, sign, { key: key.getPublic('hex'), type: KeyType.ECDSA })).to.be.equal(true);
  });
  it('test Signature verification without some value', () => {
    const properties2 = [
      { key: 'name', type: PropertyType.Hash, value: hashProperty(properties[0]) },
      { key: 'age', type: PropertyType.Raw, value: '17' },
      { key: 'address', type: PropertyType.Hash, value: hashProperty(properties[2]) },
    ];
    const ecdsa = new ECDSA('secp256k1');
    const key = ecdsa.keyFromPrivate('2ef40452ec154cd38efdc8ffa52e7f513f7d2b2a77e028342bde96c369e4f77a');
    const sign = authPrivacy(properties, { key: key.getPrivate('hex'), type: KeyType.ECDSA });

    expect(verifyPrivacy(properties, sign, { key: key.getPublic('hex'), type: KeyType.ECDSA })).to.be.equal(true);
    expect(verifyPrivacy(properties2, sign, { key: key.getPublic('hex'), type: KeyType.ECDSA })).to.be.equal(true);
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
    const sign = authPackage(properties, { key: key.getPrivate('hex'), type: KeyType.ECDSA });

    expect(verifyPackage(properties, sign, { key: key.getPublic('hex'), type: KeyType.ECDSA })).to.be.equal(true);
  });
  it('test EdDSA authentication & verification using package mode', () => {
    const eddsa = new EdDSA('ed25519');
    const key = eddsa.keyFromSecret('2ef40452ec154cd38efdc8ffa52e7f513f7d2b2a77e028342bde96c369e4f77a');
    const sign = authPackage(properties, { key: key.getSecret('hex'), type: KeyType.EDDSA });

    expect(verifyPackage(properties, sign, { key: key.getPublic('hex'), type: KeyType.EDDSA })).to.be.equal(true);
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
    const verifyingKey = { key: key.getPublic('hex'), type: KeyType.EDDSA };

    const sign = signRegister(properties)
      .validate('name', (p) => p.length >= 2)
      .validate('address', (p) => p.length >= 3)
      .sign(authKey, AuthType.Privacy);

    expect(verifyPrivacy(properties, sign, verifyingKey)).to.be.equal(true);
  });
  it('test the successful case of registration of ECDSA', () => {
    const ecdsa = new ECDSA('secp256k1');
    const key = ecdsa.keyFromPrivate('2ef40452ec154cd38efdc8ffa52e7f513f7d2b2a77e028342bde96c369e4f77a');
    const authKey = { key: key.getPrivate('hex'), type: KeyType.ECDSA };
    const verifyingKey = { key: key.getPublic('hex'), type: KeyType.ECDSA };

    const sign = signRegister(properties)
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
      signRegister(properties)
        .validate('age', (v) => Number(v) >= 19)
        .sign(authKey, AuthType.Privacy),
    ).to.be.equal(null);
  });
  it('test the failure case of registration of ECDSA', () => {
    const ecdsa = new ECDSA('secp256k1');
    const key = ecdsa.keyFromPrivate('2ef40452ec154cd38efdc8ffa52e7f513f7d2b2a77e028342bde96c369e4f77a');
    const authKey = { key: key.getPrivate('hex'), type: KeyType.ECDSA };

    expect(
      signRegister(properties)
        .validate('age', (v) => Number(v) >= 19)
        .sign(authKey, AuthType.Privacy),
    ).to.be.equal(null);
  });
});
