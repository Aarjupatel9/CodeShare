import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import './Auth.css';
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
                   
                }
                else {
                    
                    toast.error(res.message);
                }
            })
                .catch((er) => {
                   toast.error(er);
                    // console.log(e.response ? e.response.data.error : e.message);
                })
        }
        else {
            toast.error("Please fill all the fields");
        }
    }


    return (
        <div className='auth-container'>
            <form className='auth-form' onSubmit={handleLogin} >
                <h2>Login</h2>
                <input type="email" placeholder="Email" onChange={(e) => setLoginUser({ ...loginUser, userEmail: e.target.value })} required />
                <input type="password" placeholder="Password" onChange={(e) => setLoginUser({ ...loginUser, userPassword: e.target.value })} required />
                <button type="submit">Login</button>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Link to='/auth/register'>Register</Link>
                    <Link to='/auth/forgetpassword'>Forget Password?</Link>
                </div>
            </form>
        </div>
    )
};


export default LoginComponent;