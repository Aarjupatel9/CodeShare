import React, { useEffect, useContext, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MainPage from './MainPage';
import authService from '../services/authService';
import { UserContext } from "../context/UserContext";

export default function PrivatePages() {
    const navigate = useNavigate();
    const { slug, username } = useParams();
    const { currUser, setCurrUser } = useContext(UserContext)

    useEffect(() => {
        if (!username) {
            navigate('/auth/login');
        }
        authService.checkUserLogInStatus().then((res) => {
            setCurrUser(res.user);
            if (!slug) {
                navigate('/p' + username + '/new');
            }
        }).catch((err) => {
            navigate('/auth/login');
        })

    }, [slug, username]);

    return currUser && <MainPage user={currUser} />
}