import React, { useState } from 'react';
import { Button, TextField } from '@material-ui/core';

type UserProps = {
  submit: (name: string, phone: string, age: string, address: string) => void;
}

function Register({ submit }: UserProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [address, setAddress] = useState('');
  const submitInfo = () => submit(name, phone, age, address);

  return (
    <div className="User">
      <h2>Register Info</h2>
      <form noValidate>
        <TextField required id="name" value={name} onChange={e => setName(e.target.value)} label="Name"/><br/>
        <TextField required id="phone" value={phone} onChange={e => setPhone(e.target.value)} label="Phone"/><br/>
        <TextField required id="age" value={age} onChange={e => setAge(e.target.value)} label="Age"/><br/>
        <TextField required id="address" value={address} onChange={e => setAddress(e.target.value)} label="Address"/><br/><br/>
        <Button variant="contained" color="primary" onClick={submitInfo}>
          Submit
        </Button>
      </form>
    </div>
  );
}

export default Register;
