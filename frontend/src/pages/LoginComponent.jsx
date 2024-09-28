import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import './Auth.css';
import authService from '../services/authService';
import { UserContext } from '../context/UserContext';


const LoginComponent = () => {
    const { currUser, setCurrUser } = useContext(UserContext);
    const navigate = useNavigate();
    const [loginUser, setLoginUser] = useState({
        userEmail: '',
        userPassword: ''
    });
    const [message, setMessage] = useState();
    const [error, setError] = useState(null)


    const handleLogin = (e) => {
        e.preventDefault();
        if (loginUser.userEmail && loginUser.userPassword) {
            const newLoginUser = {
                email: loginUser.userEmail,
                password: loginUser.userPassword,
            };


            authService.login(newLoginUser).then(res => {
                if (res.success) {
                    setMessage(res.message);
                    setCurrUser(res.user);
                    localStorage.setItem('currUser', JSON.stringify(res.user));
                    navigate('/' + res.user.username + '/new');
                    setError(null);
                }
                else {
                    setError(res.error);
                }
            })
                .catch(e => {
                    // setError(e.response.data.error);
                    console.log(e);
                    // console.log(e.response ? e.response.data.error : e.message);
                })
        }
        else {
            setError("Please fill all the fields");
        }
    }


    return (
        <div className='auth-container'>
            <form className='auth-form' onSubmit={handleLogin} >
                <h2>Login</h2>
                {error ?
                    <div className="error-message">{error}</div>
                    :
                    <div className="message">{message}</div>
                }
                <input type="email" placeholder="Email" onChange={(e) => setLoginUser({ ...loginUser, userEmail: e.target.value })} required />
                <input type="password" placeholder="Password" onChange={(e) => setLoginUser({ ...loginUser, userPassword: e.target.value })} required />
                <button type="submit">Login</button>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Link to='/register'>Register</Link>
                    <Link to='/forget-password'>Forget Password?</Link>
                </div>
            </form>
        </div>
    )
};


export default LoginComponent;