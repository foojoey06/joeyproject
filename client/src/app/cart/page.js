"use client"
import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);
  const [shippingFees, setShippingFees] = useState(0);

  useEffect(() => {
    const username = Cookies.get('username');
    const token = Cookies.get('token');
    const userid = Cookies.get('id');

    if (!username || !token || !userid) {
      setLoading(false);
      setErrorMessage('Please login first');
      return;
    }

    fetchCart(username, token, userid);
  }, []);

  useEffect(() => {
    let total = 0;
    cartItems.forEach(item => {
      total += item.productprice * item.quantity;
    });
    setTotalAmount(total);
    if (total <= 20) {
      setShippingFees(20);
    } else {
      setShippingFees(0);
    }
  }, [cartItems]);

  const fetchCart = (username, token, userid) => {
    axios.get(`http://localhost:8000/cart/${username}/${userid}/${token}`)
      .then(response => {
        if (response.data.error) {
          setErrorMessage(response.data.error);
          setLoading(false);
        } else {
          setCartItems(response.data.allCart);
          setLoading(false);
        }
      })
      .catch(error => {
        console.error('Error fetching cart:', error);
        setErrorMessage('Having Problem for Token/Username/Id,please login again');
        setLoading(false);
      });
  };

  const removeFromCart = (productId, productname) => {
    const username = Cookies.get('username');
    const userid = Cookies.get('id');
    const token = Cookies.get('token');

    axios.post('http://localhost:8000/removefromcart', { productid: productId, userid, productname })
      .then(response => {
        toast.success(response.data.message);
        fetchCart(username, token, userid);
      })
      .catch(error => {
        console.error('Error removing from cart:', error);
        setErrorMessage('Error removing from cart');
      });
  };

  const increaseQuantity = (productId) => {
    const username = Cookies.get('username');
    const userid = Cookies.get('id');
    const token = Cookies.get('token');

    axios.post('http://localhost:8000/cartaddquantity', { productid: productId, userid })
      .then(response => {
        toast.success(response.data.message);
        fetchCart(username, token, userid);
      })
      .catch(error => {
        console.error('Error increasing quantity:', error);
        setErrorMessage('Error increasing quantity');
      });
  };

  const decreaseQuantity = (productId) => {
    const username = Cookies.get('username');
    const userid = Cookies.get('id');
    const token = Cookies.get('token');

    axios.post('http://localhost:8000/cartdecresequantity', { productid: productId, userid })
      .then(response => {
        toast.success(response.data.message);
        fetchCart(username, token, userid);
      })
      .catch(error => {
        console.error('Error decreasing quantity:', error);
        setErrorMessage('Error decreasing quantity');
      });
  };

  return (
    <div>
      {errorMessage ? (
        <p>{errorMessage}</p>
      ) : (
        <div>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div>
              <h1>Cart</h1>
              {cartItems.length > 0 ? (
                <div>
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Product</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Description</th>
                        <th>Image</th>
                        <th>Total</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cartItems.map(item => (
                        <tr key={item.productid}>
                          <td>{item.productid}</td>
                          <td>{item.productname}</td>
                          <td>{item.productprice}</td>
                          <td>
                            <button onClick={() => increaseQuantity(item.productid)}>+</button>
                            {item.quantity}
                            <button onClick={() => decreaseQuantity(item.productid)}>-</button>
                          </td>
                          <td>{item.productdes}</td>
                          <td><img src={item.productimg} alt={item.productname} width={100} height={100} /></td>
                          <td>{(item.productprice * item.quantity).toFixed(2)}</td>
                          <td>
                            <button onClick={() => removeFromCart(item.productid, item.productname)}>Remove</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p>Total Amount: RM {totalAmount.toFixed(2)}</p>
                  <p>Shipping Fees: RM {shippingFees.toFixed(2)}</p>
                  <p>Total: RM {(totalAmount + shippingFees).toFixed(2)}</p>
                </div>
              ) : (
                <p>Your cart is empty</p>
              )}
            </div>
          )}
          <ToastContainer />
        </div>
      )}
    </div>
  );
};
