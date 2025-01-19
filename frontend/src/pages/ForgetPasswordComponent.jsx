import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
        authService.forgetPassword(email).then(res => {
            toast.success(res.message);
        }).catch((er) => {
            console.error(er);
            toast.error(er);
        });
    };

    return (
        <div className='h-full w-full flex flex-row justify-center items-start'>
            <form className='flex flex-col mt-[14%] gap-4 bg-white p-[20px] rounded-[8px] shadow-[0_0px_10px_0px_rgba(0,0,0,0.2)] w-80' >
                <h2 className='font-bold text-xl'>Forget Password</h2>
                <input className='bg-gray-50 font-semibold border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500' type="email" placeholder="Enter your email" onChange={(e) => setEmail(e.target.value)} required />
                <button className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 mt-4' type="submit" onClick={e => handleForgetPassword(e)}>Send Reset Link</button>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Link className='text-blue-600 hover:underline dark:text-blue-500 ml-2' to='/auth/register'>Register</Link>
                    <Link className='text-blue-600 hover:underline dark:text-blue-500 ml-2' to='/auth/login'>Back to Login</Link>
                </div>
            </form>
        </div>
    );
};

export default ForgetPasswordComponent;