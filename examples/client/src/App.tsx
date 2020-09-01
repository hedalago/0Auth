import React, { useState } from 'react';
import { Property, Signature } from '@0auth/message';
import './App.css';
import Movies from './component/movies';
import Register from './component/register';
import { objectToProperty } from '@0auth/message/lib';
import { getSignature, storeSignature } from '@0auth/client/lib';
import { StorageType } from '@0auth/client/lib/utils';

function App() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [sign, setSign] = useState<Signature | undefined>(undefined);
  const init = () => {
    if (properties.length === 0) {
      const decrypted = getSignature(StorageType.LocalStorage);
      if (decrypted?.properties !== undefined) setProperties(decrypted.properties);
      if (decrypted?.sign !== undefined) setSign(decrypted.sign)
    }
  }
  const submit = (name: string, phone: string, age: string, address: string) => {
    const object = { name, phone, age, address };
    const properties = objectToProperty(object);
    setProperties(properties);
    const url = 'http://127.0.0.1:3000/register';
    fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({ properties }),
    }).then(res => res.json() as unknown as Signature)
      .then(res => {
        storeSignature(properties, res, StorageType.LocalStorage);
        setSign(res)
      });
  };
  init();

  return (
    <div className="App">
      {
        sign === undefined
          ? (
            <Register submit={submit}/>
          )
          : (
            <Movies properties={properties!} sign={sign}/>
          )
      }
    </div>
  );
}

export default App;
