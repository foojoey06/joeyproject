"use client";
import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Add() {
  const [file, setFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const maxSize = 60 * 1024;

    if (selectedFile && allowedTypes.includes(selectedFile.type) && selectedFile.size <= maxSize) {
      setFile(selectedFile);
      setErrorMessage('');
    } else {
      setFile(null);
      setErrorMessage('Please select a valid image file (JPEG / PNG / JPG) less than 60KB.');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (file) {
      try {
        const formData = new FormData();
        formData.append('name', event.target.name.value);
        formData.append('price', event.target.price.value);
        formData.append('des', event.target.des.value);
        formData.append('img', file);

        const response = await fetch('http://localhost:8000/addproduct', {
          method: 'POST',
          body: formData
        });

        const message = await response.json();

        if (response.ok) {
          alert(message.message);
          window.location.href = '/';
        } else {
          toast.error(message.error);
        }
      } catch (error) {
        toast.error('Error adding product. Please try again.');
      }
    } else {
      setErrorMessage('Please select a valid image file (JPEG or PNG or JPG) less than 60KB.');
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        Name: <input type="text" id="name" name="name" maxLength={100} required /><br />
        Price: <input type="number" step={0.01} min={1.00} max={1000.00} id="price" name="price" required /><br />
        Description: <input type="text" id="des" name="des" required /><br />
        Image: <input type="file" id="img" name="img" onChange={handleFileChange} required /><br />
        {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
        <button type="submit">Submit</button>
      </form>
      <ToastContainer />
    </div>
  );
};
