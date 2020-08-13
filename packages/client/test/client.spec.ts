import { expect } from 'chai';
import { ec as ECDSA } from 'elliptic';
import { KeyType, Property, PropertyType } from '@0auth/message';
import { authPrivacy } from '@0auth/server';
import { getSignature, storeSignature } from '../src';
import {
  DataType,
  decryptMessage,
  encryptMessage,
  getData,
  getDecryptedMessage,
  StorageType,
  storeData,
} from '../src/utils';

function mockStorage() {
  let storage: { [key: string]: string } = {};
  return {
    setItem: (key: string, value: string) => (storage[key] = value),
    removeItem: (key: string) => delete storage[key],
    getItem: (key: string) => (storage[key] !== undefined ? storage[key] : null),
    clear: () => (storage = {}),
  };
}

describe('test utils', () => {
  if (global.localStorage === undefined) {
    Object.defineProperty(global, 'localStorage', {
      value: mockStorage(),
    });
  }
  beforeEach(() => {
    localStorage.clear();
  });
  it('test LocalStorage Mock', () => {
    storeData('stored key', DataType.Key, StorageType.LocalStorage);
    storeData('stored message', DataType.Message, StorageType.LocalStorage);
    expect(getData(DataType.Key, StorageType.LocalStorage)).to.be.equal('stored key');
    expect(getData(DataType.Message, StorageType.LocalStorage)).to.be.equal('stored message');
  });
  it('test Encrypt & Decrypt message', () => {
    const encryptedMessage = encryptMessage('Message', '1q2w3e4r');
    const decryptedMessage = decryptMessage(encryptedMessage, '1q2w3e4r');
    expect(decryptedMessage).to.be.equal('Message');
    expect(
      decryptMessage('U2FsdGVkX1/tAtcP+fxui5NTWXrmvtO2dV5Z4obDLP4=', '1q2w3e4r'),
    ).to.be.equal('Message');
  });
  it('test Encrypt & Decrypt Long message', () => {
    const message = "{'properties':[{'key':'name','type':0,'value':'Kim'},{'key':'age','type':0,'value':'17'},{'key':'address','type':0,'value':'Seoul'}],'sign':{'authType':0,'keyType':1,'value':'304402207282d176a100f0d5feb3faa160bd39843253ec98487cc3342905260ab592b85e02201fdf55464c12bbe4b93868a6e84da59e816e918d52cc599678605f61846426c6'}}\n";
    const encryptedMessage = encryptMessage(message, '1q2w3e4r');
    const decryptedMessage = decryptMessage(encryptedMessage, '1q2w3e4r');
    expect(decryptedMessage).to.be.equal(message);
  });
  it('test Decrypted Message', () => {
    expect(getDecryptedMessage('encryption key', StorageType.LocalStorage)).to.be.null;
    storeData(encryptMessage('stored message', 'encryption key'), DataType.Message, StorageType.LocalStorage);
    expect(getDecryptedMessage('encryption key', StorageType.LocalStorage)).to.be.equal(
      'stored message',
    );
  });
});

describe('test store localStorage', () => {
  const properties: Property[] = [
    { key: 'name', type: PropertyType.Raw, value: 'Kim' },
    { key: 'age', type: PropertyType.Raw, value: '17' },
    { key: 'address', type: PropertyType.Raw, value: 'Seoul' },
  ];
  const ecdsa = new ECDSA('secp256k1');
  const secret = ecdsa.keyFromPrivate(
    '2ef40452ec154cd38efdc8ffa52e7f513f7d2b2a77e028342bde96c369e4f77a',
  );
  const sign = authPrivacy(properties, {
    key: secret.getPrivate('hex'),
    type: KeyType.ECDSA,
  });
  if (global.localStorage === undefined) {
    Object.defineProperty(global, 'localStorage', {
      value: mockStorage(),
    });
  }
  beforeEach(() => {
    localStorage.clear();
  });
  it('test storing signature in localStorage not using password', () => {
    expect(getSignature(StorageType.LocalStorage, 'abc')).to.be.null;
    storeSignature(properties, sign, StorageType.LocalStorage);
    const storageData = getSignature(StorageType.LocalStorage);
    expect(storageData).to.be.not.null;
    expect(storageData.properties).to.be.deep.equal(properties);
    expect(storageData.sign).to.be.deep.equal(sign);
  });
  it('test storing signature in localStorage using password', () => {
    expect(getSignature(StorageType.LocalStorage, 'abc')).to.be.null;
    storeSignature(properties, sign, StorageType.LocalStorage, 'abc');
    const storageData = getSignature(StorageType.LocalStorage, 'abc');
    expect(storageData).to.be.not.null;
    expect(storageData.properties).to.be.deep.equal(properties);
    expect(storageData.sign).to.be.deep.equal(sign);
  });
});
