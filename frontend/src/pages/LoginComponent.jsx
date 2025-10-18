import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { UserContext } from '../context/UserContext';
import toast from 'react-hot-toast';

const LoginComponent = () => {
    const { setCurrUser } = useContext(UserContext);
    const navigate = useNavigate();
    const [loginUser, setLoginUser] = useState({
        userEmail: '',
        userPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = (e) => {
        e.preventDefault();
        if (loginUser.userEmail && loginUser.userPassword) {
            setLoading(true);
            const newLoginUser = {
                email: loginUser.userEmail,
                password: loginUser.userPassword,
            };

            authService.login(newLoginUser)
                .then(res => {
                    if (res.success) {
                        toast.success(res.message);
                        setCurrUser(res.user);
                        localStorage.setItem('currUser', JSON.stringify(res.user));
                        navigate('/p/' + res.user.username + '/new');
                    } else {
                        toast.error(res.message);
                    }
                })
                .catch((err) => {
                    toast.error(err?.message || 'Login failed');
                    console.error(err);
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            toast.error("Please fill all the fields");
        }
    }

    return (
        <div className='w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8'>
            <div className='max-w-md w-full'>
                {/* Card */}
                <div className='bg-white rounded-2xl shadow-xl p-8 md:p-10'>
                    
                    {/* Logo/Branding */}
                    <div className='text-center mb-8'>
                        <div className='inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4'>
                            <svg className='w-8 h-8 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'></path>
                            </svg>
                        </div>
                        <h2 className='text-3xl font-bold text-gray-900'>Welcome back</h2>
                        <p className='text-gray-600 mt-2'>Sign in to your account</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleLogin} className='space-y-5'>
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
                                    value={loginUser.userEmail}
                                    onChange={(e) => setLoginUser({ ...loginUser, userEmail: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2 text-left'>
                                Password
                            </label>
                            <div className='relative'>
                                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                                    <svg className='h-5 w-5 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'></path>
                                    </svg>
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className='block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition'
                                    placeholder='••••••••'
                                    value={loginUser.userPassword}
                                    onChange={(e) => setLoginUser({ ...loginUser, userPassword: e.target.value })}
                                    required
                                />
                                <button
                                    type='button'
                                    className='absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600'
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21'></path>
                                        </svg>
                                    ) : (
                                        <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'></path>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'></path>
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Remember & Forgot */}
                        <div className='flex items-center justify-between'>
                            <label className='flex items-center'>
                                <input type='checkbox' className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded' />
                                <span className='ml-2 text-sm text-gray-700'>Remember me</span>
                            </label>
                            <Link to='/auth/forgetpassword' className='text-sm font-medium text-blue-600 hover:text-blue-500'>
                                Forgot password?
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <button
                            type='submit'
                            disabled={loading}
                            className='w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-xl transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center'
                        >
                            {loading ? (
                                <>
                                    <svg className='animate-spin -ml-1 mr-3 h-5 w-5 text-white' fill='none' viewBox='0 0 24 24'>
                                        <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                                        <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                                    </svg>
                                    Signing in...
                                </>
                            ) : (
                                'Sign in'
                            )}
                        </button>
                    </form>

                    {/* Sign up link */}
                    <p className='mt-8 text-center text-sm text-gray-600'>
                        Don't have an account?{' '}
                        <Link to='/auth/register' className='font-medium text-blue-600 hover:text-blue-500'>
                            Sign up for free
                        </Link>
                    </p>
                </div>

                {/* Footer */}
                <p className='mt-6 text-center text-xs text-gray-500'>
                    By signing in, you agree to our{' '}
                    <a href='#' className='underline'>Terms</a>
                    {' '}and{' '}
                    <a href='#' className='underline'>Privacy Policy</a>
                </p>
            </div>
        </div>
    )
};

export default LoginComponent;