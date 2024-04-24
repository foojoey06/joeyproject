"use client"
import { useState } from 'react';
import Link from "next/link";
import styles from "@/app/form.css";
import cookie from 'cookie';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Login() {
    const handleSubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);

        try {
            const response = await fetch('http://localhost:8000/login', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const { token, username, id, message } = await response.json();

                document.cookie = cookie.serialize('username', username, {
                    maxAge: 3600,
                    path: '/',
                });

                document.cookie = cookie.serialize('token', token, {
                    maxAge: 3600,
                    path: '/',
                });

                document.cookie = cookie.serialize('id', id, {
                    maxAge: 3600,
                    path: '/',
                });

                alert(message);
                window.location.href = '/';
            } else {
                const { error } = await response.json();
                toast.error(error);
            }
        } catch (error) {
            console.error('Failed to connect to the server:', error);
            toast.error('Failed to connect to the server. Please try again later.');
        }
    };

    return (
        <div>
            <div className="wrapper">
                <div className="title">
                    LOGIN
                </div>
                <form onSubmit={handleSubmit} encType="multipart/form-data">
                    <div className="field">
                        <input type="text" name="username" required />
                        <label>Username</label>
                    </div>
                    <div className="field">
                        <input type="password" name="password" required />
                        <label>Password</label>
                    </div>
                    <div className="content">
                        <div className="checkbox">
                            <input type="checkbox" id="remember-me" />
                            <label htmlFor="remember-me">Remember me</label>
                        </div>
                    </div>
                    <div className="field">
                        <input type="submit" value="LOGIN" />
                    </div>
                    <div className="signup-link">
                        Want to Register?&nbsp;
                        <Link href="/register">
                            Register
                        </Link>
                    </div>
                    <input type="hidden" name="action" value="login" />
                </form>

            </div>
            <ToastContainer />
        </div>
    )
}
