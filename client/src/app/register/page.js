"use client"
import React, { useState } from "react";
import Link from 'next/link';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from "@/app/form.css";

export default function Register() {
   const [passwordValid, setPasswordValid] = useState({
      lowercase: false,
      uppercase: false,
      number: false,
      special: false,
      length: false
   });

   const handlePasswordChange = (event) => {
      const password = event.target.value;
      const lowerCaseLetters = /[a-z]/g;
      const upperCaseLetters = /[A-Z]/g;
      const numbers = /[0-9]/g;
      const specials = /[^A-Za-z0-9]/g;

      setPasswordValid({
         lowercase: lowerCaseLetters.test(password),
         uppercase: upperCaseLetters.test(password),
         number: numbers.test(password),
         special: specials.test(password),
         length: password.length >= 8
      });
   };

   const handleSubmit = async (event) => {
      event.preventDefault();

      const form = event.target;
      const formData = new FormData(form);

      const username = formData.get("username");
      const email = formData.get("email");
      const password = formData.get("password");

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(email)) {
         toast.error("Please enter a valid email address.");
         return;
      }

      if (!passwordValid.lowercase || !passwordValid.uppercase || !passwordValid.number || !passwordValid.special || !passwordValid.length) {
         toast.error("Password does not meet the requirements.");
         return;
      }

      try {
         const response = await fetch('http://localhost:8000/register', {
            method: 'POST',
            body: formData
         });

         const message = await response.json();

         if (response.ok) {
            alert(message.message);
            window.location.href = '/login';
         } else {
            toast.error(message.error);
         }
      } catch (error) {
         console.error('Error:', error);
         toast.error("Failed to register: " + error.message);
      }
   };

   return (
      <div>
         <div className="wrapper">
            <div className="title">
               REGISTER
            </div>
            <form onSubmit={handleSubmit}>
               <div className="field">
                  <input type="text" name="username" required />
                  <label>username</label>
               </div>
               <div className="field">
                  <input type="text" name="email" required />
                  <label>email</label>
               </div>
               <div className="field">
                  <input type="password" name="password" required onChange={handlePasswordChange} />
                  <label>password</label>
               </div>
               <div className="field">
                  <input type="submit" value="REGISTER" />
               </div>
               <div className="signup-link">
                  Already Have Account?&nbsp;
                  <Link href="/login">
                     Login
                  </Link>
               </div>
               <input type="hidden" name="action" value="register" />
            </form>
            <div id="message">
               <p className={passwordValid.lowercase ? "valid" : "invalid"}>A <b>lowercase</b> letter</p>
               <p className={passwordValid.uppercase ? "valid" : "invalid"}>A <b>capital (uppercase)</b> letter</p>
               <p className={passwordValid.number ? "valid" : "invalid"}>A <b>number</b></p>
               <p className={passwordValid.special ? "valid" : "invalid"}>A <b>special character</b></p> {/* Display special character validation */}
               <p className={passwordValid.length ? "valid" : "invalid"}>Minimum <b>8 characters</b></p>
            </div>
         </div>
         <ToastContainer />
      </div>
   );
}
