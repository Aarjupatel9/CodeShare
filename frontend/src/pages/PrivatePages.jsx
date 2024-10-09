import React, { useEffect, useContext, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MainPage from './MainPage';
import authService from '../services/authService';
import { UserContext } from "../context/UserContext";
import { generateRandomString } from '../common/functions';
import userService from '../services/userService';

export default function PrivatePages() {
    const navigate = useNavigate();
    const { slug,username } = useParams();
    const { currUser, setCurrUser } = useContext(UserContext)


    useEffect(() => {
        if(!username){
            navigate('/auth/login');
        }
        const loggedInUSser = authService.checkLoggedInUser();
        if (loggedInUSser) {
            setCurrUser(loggedInUSser)
            console.log("user is logged in ", JSON.stringify(loggedInUSser));
            if(!slug){
                navigate('/p'+username+'/new');
            }
        } else {
            console.log("navigate to login")
            navigate('/auth/login');
        }

    }, [slug,username]);


    return currUser && <MainPage user={currUser} />
}