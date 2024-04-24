"use client"
import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import Cookies from 'js-cookie';
import { title } from 'process';

export default function Navbar() {
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState(null);
    const [token, setToken] = useState(null);
    const [id, setId] = useState(null);

    useEffect(() => {
        const storedUsername = Cookies.get('username');
        const storedToken = Cookies.get('token');
        const storedId = Cookies.get('id');

        if (storedUsername) {
            setUsername(storedUsername);
        }

        if (storedToken) {
            setToken(storedToken);
        }

        if (storedId) {
            setId(storedId);
        }

        setLoading(false);
    }, []);

    const handleLogout = () => {
        const confirmtologout = window.confirm('Are you sure you want to logout?');

        if (confirmtologout) {
            Cookies.remove('token');
            Cookies.remove('username');
            Cookies.remove('id');

            setUsername(null);
            setToken(null);
            setId(null);

            window.location.href = '/';
        }
    };

    const links = [
        {
            title: "Home",
            path: "/",
        },
        {
            title: "Cart",
            path: "/cart",
        },
        {
            title: "Add Product",
            path: "/add",
        },
        {
            title: "Check Product SQL",
            path: "http://localhost:8000/product",
        },
        {
            title: "Check user SQL",
            path: "http://localhost:8000/user",
        },
        {
            title: "Login",
            path: "/login",
            hidden: !!username,
        },
        {
            title: "Logout",
            path: "/#",
            hidden: !username,
            onClick: handleLogout,
        },
        {
            title: "Register",
            path: "/register",
            hidden: !!username,
        },
    ];

    return (
        <div className="links">
            {links.map(link => (
                !link.hidden && (
                    <Link href={link.path} key={link.title}>
                        {link.onClick ? (
                            <span onClick={link.onClick} className='linktext'>{link.title} | </span>
                        ) : (
                            <span className='linktext'>{link.title} | </span>
                        )}
                    </Link>
                )
            ))}
            {loading ? (
                <span>Loading...</span>
            ) : (
                <>
                    {username && token && id ? (
                        <>
                            <span>Hello {username}</span><br />
                        </>
                    ) : (
                        <span>You haven't logged in</span>
                    )}
                </>
            )}
        </div>
    );
}
