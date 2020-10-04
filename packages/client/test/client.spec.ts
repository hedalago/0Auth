import { expect, use } from 'chai';
import chaiHttp from 'chai-http';
import chaiAsPromised from 'chai-as-promised';
import { ec as ECDSA } from 'elliptic';
import { hashProperty, KeyType, Property, PropertyType } from '@0auth/message';
import { authPrivacy, verifyPrivacy } from '@0auth/server';
import { getSignature, hideProperty, storeSignature } from '../src';
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
    getItem: (key: string) =>
      storage[key] !== undefined ? storage[key] : null,
    clear: () => (storage = {}),
  };
}

use(chaiHttp);
use(chaiAsPromised);

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
    expect(
      getData('test', DataType.Key, StorageType.LocalStorage).orUndefined(),
    ).to.be.equal(undefined);
    expect(
      getData('test', DataType.Message, StorageType.LocalStorage).orUndefined(),
    ).to.be.equal(undefined);
    storeData('test', 'stored key', DataType.Key, StorageType.LocalStorage);
    storeData(
      'test',
      'stored message',
      DataType.Message,
      StorageType.LocalStorage,
    );
    expect(
      getData('test', DataType.Key, StorageType.LocalStorage).get(),
    ).to.be.equal('stored key');
    expect(
      getData('test', DataType.Message, StorageType.LocalStorage).get(),
    ).to.be.equal('stored message');
  });
  it('test Encrypt & Decrypt message', () => {
    const encryptedMessage = encryptMessage('Message', '1q2w3e4r');
    const decryptedMessage = decryptMessage(encryptedMessage, '1q2w3e4r');
    expect(decryptedMessage).to.be.equal('Message');
    expect(
      decryptMessage(
        'U2FsdGVkX1/tAtcP+fxui5NTWXrmvtO2dV5Z4obDLP4=',
        '1q2w3e4r',
      ),
    ).to.be.equal('Message');
  });
  it('test Encrypt & Decrypt Long message', () => {
    const message =
      "{'properties':[{'key':'name','type':0,'value':'Kim'},{'key':'age','type':0,'value':'17'},{'key':'address','type':0,'value':'Seoul'}],'sign':{'authType':0,'keyType':1,'value':'304402207282d176a100f0d5feb3faa160bd39843253ec98487cc3342905260ab592b85e02201fdf55464c12bbe4b93868a6e84da59e816e918d52cc599678605f61846426c6'}}\n";
    const encryptedMessage = encryptMessage(message, '1q2w3e4r');
    const decryptedMessage = decryptMessage(encryptedMessage, '1q2w3e4r');
    expect(decryptedMessage).to.be.equal(message);
  });
  it('test Decrypted Message', () => {
    expect(
      getDecryptedMessage(
        'test',
        'encryption key',
        StorageType.LocalStorage,
      ).orNull(),
    ).to.be.null;
    storeData(
      'test',
      encryptMessage('stored message', 'encryption key'),
      DataType.Message,
      StorageType.LocalStorage,
    );
    expect(
      getDecryptedMessage(
        'test',
        'encryption key',
        StorageType.LocalStorage,
      ).get(),
    ).to.be.equal('stored message');
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
    expect(getSignature('test', StorageType.LocalStorage)).to.be.null;
    storeSignature('test', properties, sign, StorageType.LocalStorage);
    const storageData = getSignature('test', StorageType.LocalStorage);
    expect(storageData).to.be.not.null;
    expect(storageData?.properties).to.be.deep.equal(properties);
    expect(storageData?.sign).to.be.deep.equal(sign);
  });
  it('test storing signature in localStorage using password', () => {
    expect(getSignature('test', StorageType.LocalStorage, 'abc')).to.be.null;
    storeSignature('test', properties, sign, StorageType.LocalStorage, 'abc');
    const storageData = getSignature('test', StorageType.LocalStorage, 'abc');
    expect(storageData).to.be.not.null;
    expect(storageData?.properties).to.be.deep.equal(properties);
    expect(storageData?.sign).to.be.deep.equal(sign);
  });
  it('test storing signature in localStorage using different key', () => {
    expect(getSignature('test1', StorageType.LocalStorage), 'abc').to.be.null;
    expect(getSignature('test2', StorageType.LocalStorage)).to.be.null;
    storeSignature('test1', properties, sign, StorageType.LocalStorage, 'abc');
    expect(getSignature('test2', StorageType.LocalStorage)).to.be.null;
  });
  it('test get stored signature in localStorage using different key', () => {
    storeSignature('test1', properties, sign, StorageType.LocalStorage, 'abc');
    storeSignature('test2', properties, sign, StorageType.LocalStorage);

    const storageData1 = getSignature('test1', StorageType.LocalStorage, 'abc');
    expect(storageData1).to.be.not.null;
    expect(storageData1?.properties).to.be.deep.equal(properties);
    expect(storageData1?.sign).to.be.deep.equal(sign);
    const storageData2 = getSignature('test2', StorageType.LocalStorage);
    expect(storageData2).to.be.not.null;
    expect(storageData2?.properties).to.be.deep.equal(properties);
    expect(storageData2?.sign).to.be.deep.equal(sign);
  });
});

describe('test hide property', () => {
  const properties: Property[] = [
    { key: 'name', type: PropertyType.Raw, value: 'Kim' },
    { key: 'age', type: PropertyType.Raw, value: '17' },
    { key: 'address', type: PropertyType.Raw, value: 'Seoul' },
  ];

  it('test hide property value', () => {
    const partiallyHiddenProperties = hideProperty(properties, [
      'name',
      'address',
    ]);
    expect(partiallyHiddenProperties[0].type).to.be.equal(PropertyType.Hash);
    expect(partiallyHiddenProperties[0].key).to.be.equal('name');
    expect(partiallyHiddenProperties[0].value).to.be.equal(
      hashProperty(properties[0]),
    );
    expect(partiallyHiddenProperties[2].type).to.be.equal(PropertyType.Hash);
    expect(partiallyHiddenProperties[2].key).to.be.equal('address');
    expect(partiallyHiddenProperties[2].value).to.be.equal(
      hashProperty(properties[2]),
    );

    expect(partiallyHiddenProperties[1].type).to.be.equal(PropertyType.Raw);
    expect(partiallyHiddenProperties[1].key).to.be.equal('age');
    expect(partiallyHiddenProperties[1].value).to.be.equal(properties[1].value);
  });
  it('test hidden property verification', () => {
    const ecdsa = new ECDSA('secp256k1');
    const key = ecdsa.keyFromPrivate(
      '2ef40452ec154cd38efdc8ffa52e7f513f7d2b2a77e028342bde96c369e4f77a',
    );
    const sign = authPrivacy(properties, {
      key: key.getPrivate('hex'),
      type: KeyType.ECDSA,
    });
    const publicKey = { key: key.getPublic('hex'), type: KeyType.ECDSA };
    const partiallyHiddenProperties = hideProperty(properties, [
      'name',
      'address',
    ]);
    expect(
      verifyPrivacy(partiallyHiddenProperties, sign, publicKey),
    ).to.be.equal(true);
  });
});
