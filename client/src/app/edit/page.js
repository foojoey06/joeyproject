"use client"
import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Edit() {
  const editproduct = localStorage.getItem('product');

  if (!editproduct) {
    return <div>This page is not available for now since you haven't chosen a product to edit</div>;
  }

  let product;

  try {
    product = JSON.parse(editproduct);
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return <div>Error parsing product data</div>;
  }

  const id = product.id;
  const defaultName = product.name;
  const defaultPrice = product.price;
  const defaultDes = product.des;

  const [name, setName] = useState(defaultName);
  const [price, setPrice] = useState(defaultPrice);
  const [des, setDes] = useState(defaultDes);
  const [img, setImg] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const maxSize = 60 * 1024;

    if (selectedFile && allowedTypes.includes(selectedFile.type) && selectedFile.size <= maxSize) {
      setImg(selectedFile);
      setErrorMessage('');
    } else {
      setImg(null);
      setErrorMessage('Please select a valid image file (JPEG / PNG / JPG) less than 60KB.Else it cannot update.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('id', id);
    formData.append('name', name);
    formData.append('price', price);
    formData.append('des', des);
    if (img) {
      formData.append('img', img);
    }

    try {
      const response = await fetch('http://localhost:8000/editproduct', {
        method: 'POST',
        body: formData
      });
      const message = await response.json();
      if (response.ok) {
        localStorage.removeItem('product');
        alert(message.message);
        window.location.href = '/';
      } else {
        toast.error(message.error);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to update product. Please try again later.');
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} encType='multipart/form-data'>
        ID: {id}<br />
        Name: <input type="text" id="name" name="name" value={name} maxLength={100} onChange={(e) => setName(e.target.value)} required /><br />
        Price: <input type="number" id="price" name="price" value={price} onChange={(e) => setPrice(e.target.value)} step={0.01} min={1} max={1000} required /><br />
        Description: <input type="text" id="des" name="des" value={des} onChange={(e) => setDes(e.target.value)} required /><br />
        Image: <input type="file" id="img" name="img" onChange={handleFileChange} /><br />
        {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
        <button type="submit">Submit</button>
      </form>
      <ToastContainer />
    </>
  );
};
