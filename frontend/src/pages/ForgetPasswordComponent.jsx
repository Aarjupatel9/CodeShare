import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import authApi from '../services/api/authApi';

const ForgetPasswordComponent = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const handleForgetPassword = (e) => {
        e.preventDefault();
        if (!email) {
            toast.error("Please enter a valid email");
            return;
        }
        
        setLoading(true);
        authApi.generateResetPasswordLink(email)
            .then(res => {
                setEmailSent(true);
            })
            .catch((er) => {
                console.error(er);
                const errorMessage = er instanceof Error ? er.message : (er || "Failed to send reset link. Please try again.");
                toast.error(errorMessage);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    return (
        <div className='w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8'>
            <div className='max-w-md w-full'>
                {/* Card */}
                <div className='bg-white rounded-2xl shadow-xl p-8 md:p-10'>
                    
                    {/* Logo/Icon */}
                    <div className='text-center mb-8'>
                        <div className='inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full mb-4'>
                            <svg className='w-8 h-8 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z'></path>
                            </svg>
                        </div>
                        <h2 className='text-3xl font-bold text-gray-900'>Reset Password</h2>
                        <p className='text-gray-600 mt-2'>
                            {emailSent 
                                ? "Check your email for the reset link" 
                                : "Enter your email to receive a reset link"}
                        </p>
                    </div>

                    {emailSent ? (
                        /* Success State */
                        <div className='text-center space-y-6'>
                            <div className='bg-green-50 border-2 border-green-200 rounded-xl p-6'>
                                <div className='text-5xl mb-3'>✉️</div>
                                <h3 className='text-lg font-semibold text-green-900 mb-2'>Email Sent!</h3>
                                <p className='text-sm text-green-700'>
                                    We've sent a password reset link to <strong>{email}</strong>
                                </p>
                                <p className='text-xs text-green-600 mt-3'>
                                    Please check your inbox and spam folder.
                                </p>
                            </div>

                            {/* Actions */}
                            <div className='space-y-3'>
                                <button
                                    onClick={() => {
                                        setEmailSent(false);
                                        setEmail('');
                                    }}
                                    className='w-full py-3 px-4 border-2 border-blue-600 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition'
                                >
                                    Send to Different Email
                                </button>
                                
                                <Link 
                                    to='/auth/login'
                                    className='block w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition shadow-lg text-center'
                                >
                                    Back to Login
                                </Link>
                            </div>
                        </div>
                    ) : (
                        /* Form State */
                        <form onSubmit={handleForgetPassword} className='space-y-6'>
                            {/* Email Input */}
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-2 text-left'>
                                    Email address
                                </label>
                                <div className='relative'>
                                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                                        <svg className='h-5 w-5 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207'></path>
                                        </svg>
                                    </div>
                                    <input
                                        type='email'
                                        className='block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition'
                                        placeholder='you@example.com'
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type='submit'
                                disabled={loading}
                                className='w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                            >
                                {loading ? (
                                    <>
                                        <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                                        <span>Sending...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'></path>
                                        </svg>
                                        <span>Send Reset Link</span>
                                    </>
                                )}
                            </button>

                            {/* Links */}
                            <div className='flex items-center justify-between text-sm pt-4 border-t border-gray-200'>
                                <Link 
                                    to='/auth/register' 
                                    className='text-blue-600 hover:text-blue-700 font-medium hover:underline'
                                >
                                    Create account
                                </Link>
                                <Link 
                                    to='/auth/login' 
                                    className='text-blue-600 hover:text-blue-700 font-medium hover:underline'
                                >
                                    Back to login
                                </Link>
                            </div>
                        </form>
                    )}

                    {/* Footer Note */}
                    <div className='mt-6 pt-6 border-t border-gray-100'>
                        <p className='text-xs text-gray-500 text-center'>
                            Need help? Contact support at{' '}
                            <a href='mailto:developer.codeshare@gmail.com' className='text-blue-600 hover:underline'>
                                developer.codeshare@gmail.com
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgetPasswordComponent;