"use client"
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import Cookies from 'js-cookie';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Home() {
    const [products, setProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userInfo, setUserInfo] = useState({});

    useEffect(() => {
        const storedUsername = Cookies.get('username');
        const storedId = Cookies.get('id');
        const storedToken = Cookies.get('token');

        if (storedUsername && storedId && storedToken) {
            setUserInfo({ username: storedUsername, id: storedId, token: storedToken });
        }

        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await axios.get('http://localhost:8000/product');
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, name) => {
        try {
            const confirmation = window.confirm(`Are you sure you want to delete this Product: ${name}?`);
            if (confirmation) {
                await axios.post('http://localhost:8000/deleteproduct', { id });
                alert(`Product ${name} deleted successfully!`);
                window.location.reload();
            }
        } catch (error) {
            alert('Error deleting product. Please try again.');
        }
    };

    const handleEdit = (product) => {
        localStorage.setItem('product', JSON.stringify(product));
        window.location.href = '/edit';
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleAddToCart = (id, name) => {
        const { username, id: userId, token } = userInfo;

        if (!username || !userId || !token) {
            toast.error("Please log in first before you want to add an item into the cart.");
            return;
        }

        const data = {
            productid: id,
            productname: name,
            userid: userId,
        };

        axios.post('http://localhost:8000/addtocart', data, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => {
                toast.success(response.data.message);
            })
            .catch(error => {
                toast.error('Failed to add item to cart. Please try again later.');
            });
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <div>Loading...</div>;
    if (error) return <div>There was an error connecting. Please try again later.</div>;
    if (products.length === 0) return <div><h1>Products</h1><p>There are no products.</p><button><Link href="/add">Add</Link></button></div>;
    if (filteredProducts.length === 0) return <div><h1>Products</h1><input type="text" placeholder="Search by name..." value={searchQuery} onChange={handleSearchChange} /><p>No products found.</p></div>;

    return (
        <div>
            <ToastContainer />
            <h1>Products</h1>
            <input type="text" placeholder="Search by name..." value={searchQuery} onChange={handleSearchChange} />
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Price</th>
                        <th>Description</th>
                        <th>Image</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredProducts.map(product => (
                        <tr>
                            <td>{product.id}</td>
                            <td>{product.name}</td>
                            <td>{parseInt(product.price).toFixed(2)}</td>
                            <td>{product.des}</td>
                            <td><img src={product.img} alt={product.name} height={100} width={100} /></td>
                            <td>
                                <button onClick={() => handleDelete(product.id, product.name)}>Delete</button>
                                <button onClick={() => handleEdit(product)}>Edit</button>
                                <button onClick={() => handleAddToCart(product.id, product.name)}>Add to Cart</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <Link href="/add"><button>Add Product</button></Link>
        </div>
    );
};
