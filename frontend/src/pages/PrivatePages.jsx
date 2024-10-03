import React, { useEffect, useContext, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MainPage from './MainPage';
import authService from '../services/authService';
import { UserContext } from "../context/UserContext";
import { generateRandomString } from '../common/functions';
import userService from '../services/userService';

export default function PrivatePages() {
    const navigate = useNavigate();
    const { slug } = useParams();
    const { currUser, setCurrUser } = useContext(UserContext)


    useEffect(() => {

        const loggedInUSser = authService.checkLoggedInUser();
        if (loggedInUSser) {
            setCurrUser(loggedInUSser)
            console.log("user is logged in ", JSON.stringify(loggedInUSser));
        } else {
            console.log("navigate to login")
            navigate('/login');
        }

    }, [slug]);


    return <MainPage isPersonal={true} />
}