import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import authService from '../../services/authService';
import toast from 'react-hot-toast';

/**
 * PrivateRoute - Gateway component for all private routes
 * Handles authentication, userId validation, and redirects
 * 
 * @param {Component} component - The component to render if authenticated
 * @param {Boolean} skipAuth - If true, skip auth checking (for info pages like Help/About)
 * @param {Object} props - Additional props to pass to the component
 */
const PrivateRoute = ({ component: Component, skipAuth = false, ...rest }) => {
  const { currUser, setCurrUser } = useContext(UserContext);
  const { userId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(!skipAuth); // Skip checking if skipAuth is true
  const [isAuthorized, setIsAuthorized] = useState(skipAuth); // Auto-authorize if skipAuth is true

  useEffect(() => {
    // Skip auth checking for public info pages (Help, About, etc.)
    if (skipAuth) {
      setIsAuthorized(true);
      setIsChecking(false);
      return;
    }

    const checkAuthAndValidate = async () => {
      setIsChecking(true);
      
      try {
        // Check if user is logged in
        const response = await authService.checkUserLogInStatus();
        const user = response.user;
        setCurrUser(user);

        // Validate userId in URL matches logged-in user
        if (userId && userId !== user._id) {
          toast.error('Page not found or you do not have access to this page', { duration: 3000 });
          // Redirect to user's own page
          const targetPath = location.pathname.replace(`/p/${userId}`, `/p/${user._id}`);
          navigate(targetPath, { replace: true });
          setIsAuthorized(false);
          return;
        }

        // If no userId in URL but we're on a /p/ route, redirect to user's page
        if (!userId && location.pathname.startsWith('/p/')) {
          const newPath = location.pathname.replace('/p/', `/p/${user._id}/`);
          navigate(newPath, { replace: true });
          setIsAuthorized(false);
          return;
        }

        // All checks passed
        setIsAuthorized(true);
        setIsChecking(false);
      } catch (error) {
        navigate('/auth/login', { replace: true });
        setIsAuthorized(false);
        setIsChecking(false);
      }
    };

    checkAuthAndValidate();
  }, [skipAuth, userId, location.pathname, navigate, setCurrUser]);

  // Show loading spinner while checking authentication
  if (isChecking) {
    return (
      <div className="min-h-screen min-w-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Authenticating...</p>
        </div>
      </div>
    );
  }

  // Render component if authorized
  if (isAuthorized && currUser) {
    return <Component user={currUser} {...rest} />;
  }

  // Don't render anything while redirecting
  return null;
};

export default PrivateRoute;

