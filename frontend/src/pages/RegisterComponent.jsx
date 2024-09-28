import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import './Auth.css';
import authService from '../services/authService';


const RegisterComponent = () => {


    const navigate = useNavigate();


    const [registerUser, setRegisterUser] = useState({
        userName: '',
        userPassword: '',
        userEmail: '',
    });


    const [message, setMessage] = useState();
    const [error, setError] = useState(null);


    const HandleSubmit = (e) => {
        e.preventDefault();
        if (registerUser.userEmail && registerUser.userName && registerUser.userPassword) {
            const newUser = {
                username: registerUser.userName,
                password: registerUser.userPassword,
                email: registerUser.userEmail
            };
            authService.register(newUser).then(res => {
                console.log(res);
                if (res.success) {
                    setMessage(res.message);
                    console.log(res.message);
                    navigate('/login');
                    setError(null);
                }
                else {
                    setError(res.message);
                }
            }).catch(e => {
                // setError();
                console.log(e);
            });
        }
        else {
            setError("Please fill all the fields");
        }
    };



    return (
        <div className='auth-container'>
            <form className='auth-form' onSubmit={e => HandleSubmit(e)} >
                <h2>Register</h2>
                {error ?
                    <div className="error-message">{error}</div>
                    :
                    <div className="message">{message}</div>
                }
                <input type="text" placeholder="Username" value={registerUser.userName} onChange={(e) => setRegisterUser({ ...registerUser, userName: e.target.value })} required />
                <input type="email" placeholder="Email" value={registerUser.userEmail} onChange={(e) => setRegisterUser({ ...registerUser, userEmail: e.target.value })} required />
                <input type="password" placeholder="Password" value={registerUser.userPassword} onChange={(e) => setRegisterUser({ ...registerUser, userPassword: e.target.value })} />


                <button type="submit">Register</button>
                <Link to='/login'>Already have an Account?</Link>


            </form>
        </div>
    );



};


export default RegisterComponent;