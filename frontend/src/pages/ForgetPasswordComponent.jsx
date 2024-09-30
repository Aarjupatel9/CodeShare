import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Auth.css';
import toast from 'react-hot-toast';
import authService from '../services/authService';


const ForgetPasswordComponent = () => {
    const [email, setEmail] = useState('');


    const handleForgetPassword = (e) => {
        e.preventDefault();
        if (!email) {
            toast.error("Please enter a valid email");
            return;
        }
        console.log(email);
        authService.forgetPassword(email).then(res => {
            console.log("REsponse:" + res);
            toast.success(res.message);
        })
            .catch((er) => {
                console.log(er);
                toast.error(er);
            });
    };


    return (
        <div className='auth-container'>
            <form className='auth-form' >
                <h2>Forget Password</h2>


                <input type="email" placeholder="Enter your email" onChange={(e) => setEmail(e.target.value)} required />


                <button type="submit" onClick={e => handleForgetPassword(e)}>Send Reset Link</button>


                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Link to='/register'>Register</Link>
                    <Link to='/login'>Back to Login</Link>
                </div>
            </form>
        </div>
    );
};


export default ForgetPasswordComponent;