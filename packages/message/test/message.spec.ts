import { expect } from 'chai';
import {
  PropertyDataType,
  hash,
  hashProperty,
  objectToProperty,
  Property,
  PropertyType,
  stringToDataType,
  typeOfProperty,
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
      dataType: PropertyDataType.String,
      type: PropertyType.Raw,
      value: 'c',
    };
    const property2: Property = {
      key: 'a',
      dataType: PropertyDataType.String,
      type: PropertyType.Raw,
      value: 'b,c',
    };
    const property3: Property = {
      key: '',
      dataType: PropertyDataType.String,
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
        dataType: PropertyDataType.String,
        value: 'Hyeock-Jin',
      },
      {
        key: 'age',
        type: 'RAW',
        dataType: PropertyDataType.String,
        value: '25',
      },
      {
        key: 'address',
        type: 'RAW',
        dataType: PropertyDataType.String,
        value: 'Daejeon',
      },
    ]);
  });
});

describe('test data type', () => {
  const stringProperty: Property = {
    key: 'name',
    dataType: PropertyDataType.String,
    type: PropertyType.Raw,
    value: 'Kim',
  };
  const numberProperty: Property = {
    key: 'age',
    dataType: PropertyDataType.Number,
    type: PropertyType.Raw,
    value: 25,
  };
  const dateProperty: Property = {
    key: 'birth',
    dataType: PropertyDataType.Date,
    type: PropertyType.Raw,
    value: new Date('1996-12-28'),
  };
  const booleanProperty: Property = {
    key: 'isAdult',
    dataType: PropertyDataType.Boolean,
    type: PropertyType.Raw,
    value: true,
  };

  it('test stringToDataType of string type', () => {
    const stringValue = stringProperty.value;
    expect(stringToDataType(stringValue, PropertyDataType.String)).to.be.equal(
      stringValue,
    );
  });
  it('test stringToDataType of number type', () => {
    const numberValue = JSON.stringify(numberProperty.value);
    expect(stringToDataType(numberValue, PropertyDataType.Number)).to.be.equal(
      numberProperty.value,
    );
  });
  it('test stringToDataType of date type', () => {
    const dateValue = dateProperty.value;
    expect(stringToDataType(dateValue, PropertyDataType.Date)).to.be.deep.equal(
      dateProperty.value,
    );
  });
  it('test stringToDataType of date type when it is string', () => {
    const dateValue = JSON.stringify(dateProperty.value);
    expect(stringToDataType(dateValue, PropertyDataType.Date)).to.be.deep.equal(
      dateProperty.value,
    );
  });
  it('test stringToDataType of boolean type', () => {
    const booleanValue = booleanProperty.value;
    expect(
      stringToDataType(booleanValue, PropertyDataType.Boolean),
    ).to.be.equal(booleanProperty.value);
  });
  it('test stringToDataType of boolean type when it is string', () => {
    const booleanValue = JSON.stringify(booleanProperty.value);
    expect(
      stringToDataType(booleanValue, PropertyDataType.Boolean),
    ).to.be.equal(booleanProperty.value);
  });
  it('test typeOfProperty of string type', () => {
    const stringValue = stringProperty.value;
    expect(typeOfProperty(stringValue)).to.be.equal(stringProperty.dataType);
  });
  it('test typeOfProperty of number type', () => {
    const numberValue = numberProperty.value;
    expect(typeOfProperty(numberValue)).to.be.equal(numberProperty.dataType);
  });
  it('test typeOfProperty of date type', () => {
    const dateValue = dateProperty.value;
    expect(typeOfProperty(dateValue)).to.be.equal(dateProperty.dataType);
  });
  it('test typeOfProperty of boolean type', () => {
    const booleanValue = booleanProperty.value;
    expect(typeOfProperty(booleanValue)).to.be.equal(booleanProperty.dataType);
  });
});
