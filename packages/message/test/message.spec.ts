import { expect } from 'chai';
import {
  hash,
  hashProperty,
  objectToProperty,
  Property,
  PropertyType,
  utf8ToBase64,
} from '../src';

describe('test message utils', () => {
  it('test utf8 to base64', () => {
    expect(utf8ToBase64('ABC')).to.be.equal('QUJD');
    expect(utf8ToBase64('서울')).to.be.equal('JUVDJTg0JTlDJUVDJTlBJUI4');
  });
  it('test hash property', () => {
    const property1: Property = {
      key: 'a,b',
      type: PropertyType.Raw,
      value: 'c',
    };
    const property2: Property = {
      key: 'a',
      type: PropertyType.Raw,
      value: 'b,c',
    };
    const property3: Property = {
      key: '',
      type: PropertyType.Hash,
      value: 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    };

    expect(hashProperty(property1)).to.be.equal(
      '2e832436ce5b19a381949a13547469604758fd5e0001206f8a6cf0ed7974145a',
    );
    expect(hashProperty(property1)).to.be.not.equal(hashProperty(property2));
    expect(hashProperty(property3)).to.be.equal(hashProperty(property3));
  });
  it('test hash', () => {
    expect(hash('abc')).to.be.equal(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    );
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
