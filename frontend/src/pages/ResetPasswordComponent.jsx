import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import authApi from '../services/api/authApi';

const ResetPasswordComponent = () => {
    const { id, token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [validating, setValidating] = useState(true);
    const [tokenValid, setTokenValid] = useState(false);
    const [email, setEmail] = useState('');
    const [passwordReset, setPasswordReset] = useState(false);

    // Validate token on mount
    useEffect(() => {
        if (id && token) {
            setValidating(true);
            authApi.validateResetToken(id, token)
                .then(res => {
                    setTokenValid(true);
                    setEmail(res.email || '');
                    setValidating(false);
                })
                .catch((error) => {
                    console.error('Token validation error:', error);
                    toast.error(error || "This reset link is invalid or has expired.");
                    setTokenValid(false);
                    setValidating(false);
                });
        } else {
            setValidating(false);
            setTokenValid(false);
            toast.error("Invalid reset link.");
        }
    }, [id, token]);

    const handleResetPassword = (e) => {
        e.preventDefault();
        
        if (!password || !confirmPassword) {
            toast.error("Please fill in all fields");
            return;
        }

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters long");
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        
        setLoading(true);
        authApi.updatePassword(id, token, password, confirmPassword)
            .then(res => {
                toast.success(res.message || "Password reset successfully!");
                setPasswordReset(true);
                // Redirect to login after 2 seconds
                setTimeout(() => {
                    navigate('/auth/login');
                }, 2000);
            })
            .catch((error) => {
                console.error('Password update error:', error);
                toast.error(error || "Failed to reset password. Please try again.");
            })
            .finally(() => {
                setLoading(false);
            });
    };

    if (validating) {
        return (
            <div className='w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8'>
                <div className='max-w-md w-full bg-white rounded-2xl shadow-xl p-8 md:p-10 text-center'>
                    <div className='inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full mb-4'>
                        <div className='w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin'></div>
                    </div>
                    <h2 className='text-2xl font-bold text-gray-900 mb-2'>Validating...</h2>
                    <p className='text-gray-600'>Please wait while we verify your reset link.</p>
                </div>
            </div>
        );
    }

    if (!tokenValid) {
        return (
            <div className='w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8'>
                <div className='max-w-md w-full bg-white rounded-2xl shadow-xl p-8 md:p-10'>
                    <div className='text-center mb-8'>
                        <div className='inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-100 to-pink-100 rounded-full mb-4'>
                            <svg className='w-8 h-8 text-red-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12'></path>
                            </svg>
                        </div>
                        <h2 className='text-3xl font-bold text-gray-900 mb-2'>Invalid Link</h2>
                        <p className='text-gray-600'>
                            This password reset link is invalid or has expired.
                        </p>
                    </div>

                    <div className='space-y-4'>
                        <Link 
                            to='/auth/forgetpassword'
                            className='block w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition shadow-lg text-center'
                        >
                            Request New Reset Link
                        </Link>
                        
                        <Link 
                            to='/auth/login'
                            className='block w-full py-3 px-4 border-2 border-blue-600 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition text-center'
                        >
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (passwordReset) {
        return (
            <div className='w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8'>
                <div className='max-w-md w-full bg-white rounded-2xl shadow-xl p-8 md:p-10'>
                    <div className='text-center mb-8'>
                        <div className='inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full mb-4'>
                            <svg className='w-8 h-8 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M5 13l4 4L19 7'></path>
                            </svg>
                        </div>
                        <h2 className='text-3xl font-bold text-gray-900 mb-2'>Password Reset!</h2>
                        <p className='text-gray-600'>
                            Your password has been successfully reset.
                        </p>
                        <p className='text-sm text-gray-500 mt-2'>
                            Redirecting to login page...
                        </p>
                    </div>

                    <Link 
                        to='/auth/login'
                        className='block w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition shadow-lg text-center'
                    >
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

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
                            {email && `Enter a new password for ${email}`}
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleResetPassword} className='space-y-6'>
                        {/* Password Input */}
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2 text-left'>
                                New Password
                            </label>
                            <div className='relative'>
                                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                                    <svg className='h-5 w-5 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'></path>
                                    </svg>
                                </div>
                                <input
                                    type='password'
                                    className='block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition'
                                    placeholder='Enter new password'
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={loading}
                                    minLength={6}
                                />
                            </div>
                        </div>

                        {/* Confirm Password Input */}
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2 text-left'>
                                Confirm Password
                            </label>
                            <div className='relative'>
                                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                                    <svg className='h-5 w-5 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'></path>
                                    </svg>
                                </div>
                                <input
                                    type='password'
                                    className='block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition'
                                    placeholder='Confirm new password'
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    disabled={loading}
                                    minLength={6}
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
                                    <span>Resetting Password...</span>
                                </>
                            ) : (
                                <>
                                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M5 13l4 4L19 7'></path>
                                    </svg>
                                    <span>Reset Password</span>
                                </>
                            )}
                        </button>

                        {/* Links */}
                        <div className='flex items-center justify-center pt-4 border-t border-gray-200'>
                            <Link 
                                to='/auth/login' 
                                className='text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline'
                            >
                                Back to login
                            </Link>
                        </div>
                    </form>

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

export default ResetPasswordComponent;

