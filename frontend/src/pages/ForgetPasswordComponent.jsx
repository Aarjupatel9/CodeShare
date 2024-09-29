import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Auth.css';
// import axios from 'axios';
import toast from 'react-hot-toast';

const ForgetPasswordComponent = () => {
    const [email, setEmail] = useState('');

    const handleForgetPassword = (e) => {
        e.preventDefault();

        // Add your logic for password reset here
        if (!email) {
            toast.error("Please enter a valid email");
            return;
        }
        console.log(email);
        // axios.post('http://localhost:3001/u/forgetpassword',{email})
        // .then(res=>{
        //     console.log(res.data.message);
        // })
        // .catch(e=>{
        //     console.log(e);
        // })
        
        toast.success('A password reset link is sent in the registered email.');
    };

    return (
        <div className='auth-container'>
            <form className='auth-form' >
                <h2>Forget Password</h2>

                <input type="email" placeholder="Enter your email" onChange={(e) => setEmail(e.target.value)} required />

                <button type="submit" onClick={e=> handleForgetPassword(e)}>Send Reset Link</button>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Link to='/register'>Register</Link>
                    <Link to='/login'>Back to Login</Link>
                </div>
            </form>
        </div>
    );
};

export default ForgetPasswordComponent;