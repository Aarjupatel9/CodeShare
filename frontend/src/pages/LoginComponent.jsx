import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { UserContext } from '../context/UserContext';
import toast from 'react-hot-toast';

const LoginComponent = () => {
    const { currUser, setCurrUser } = useContext(UserContext);
    const navigate = useNavigate();
    const [loginUser, setLoginUser] = useState({
        userEmail: '',
        userPassword: ''
    });

    const handleLogin = (e) => {
        e.preventDefault();
        if (loginUser.userEmail && loginUser.userPassword) {
            const newLoginUser = {
                email: loginUser.userEmail,
                password: loginUser.userPassword,
            };

            authService.login(newLoginUser).then(res => {
                if (res.success) {
                    toast.success(res.message);
                    setCurrUser(res.user);
                    localStorage.setItem('currUser', JSON.stringify(res.user));
                    navigate('/p/' + res.user.username + '/new');
                } else {
                    toast.error(res.message);
                }
            }).catch((err) => {
                toast.error(err);
                console.error(err);
            })
        }
        else {
            toast.error("Please fill all the fields");
        }
    }


    return (
        <div className='h-full w-full flex justify-center items-start   '>
            <form className='flex flex-col mt-[14%] gap-4 bg-white p-[20px] rounded-[8px] shadow-[0_0px_10px_0px_rgba(0,0,0,0.2)] w-80' onSubmit={handleLogin} >
                <h2 className='font-bold text-xl'>Login</h2>
                <input type="email" className='bg-gray-50 font-semibold border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500' placeholder="Email" onChange={(e) => setLoginUser({ ...loginUser, userEmail: e.target.value })} required />
                <input type="password" className='bg-gray-50 font-medium border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500' placeholder="Password" onChange={(e) => setLoginUser({ ...loginUser, userPassword: e.target.value })} required />
                <button type="submit" className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800'>Login</button>
                <div className='flex justify-between mt-4 text-[14px]'>
                    <Link className='text-blue-600 hover:underline dark:text-blue-500 ml-2' to='/auth/register'>Register</Link>
                    <Link className='text-blue-600 hover:underline dark:text-blue-500 mr-3' to='/auth/forgetpassword'>Forget Password?</Link>
                </div>
            </form>
        </div>
    )
};


export default LoginComponent;