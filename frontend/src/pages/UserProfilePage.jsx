import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import authService from '../services/authService';
import googleDriveApi from '../services/api/googleDriveApi';
import toast from 'react-hot-toast';
import { profilePicture } from '../assets/svgs';

/**
 * UserProfilePage - Dedicated user profile page
 * Shows user information, settings, and account management
 */
const UserProfilePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currUser, setCurrUser } = useContext(UserContext);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [googleDriveConnected, setGoogleDriveConnected] = useState(false);
  const [checkingDriveStatus, setCheckingDriveStatus] = useState(true);
  const [connectingDrive, setConnectingDrive] = useState(false);

  useEffect(() => {
    // Check authentication
    authService.checkUserLogInStatus()
      .then((res) => {
        setCurrUser(res.user);
        setIsLoading(false);
        
        // Check Google Drive connection status
        checkGoogleDriveStatus();
      })
      .catch(() => {
        navigate('/auth/login');
      });

    // Handle OAuth callback
    const connected = searchParams.get('google-drive-connected');
    const error = searchParams.get('google-drive-error');
    
    if (connected === 'true') {
      toast.success('Google Drive connected successfully!');
      checkGoogleDriveStatus();
      // Clean URL
      navigate(window.location.pathname, { replace: true });
    } else if (error) {
      toast.error(`Failed to connect Google Drive: ${decodeURIComponent(error)}`);
      // Clean URL
      navigate(window.location.pathname, { replace: true });
    }
  }, [navigate, setCurrUser, searchParams]);

  const checkGoogleDriveStatus = async () => {
    try {
      setCheckingDriveStatus(true);
      const response = await googleDriveApi.getConnectionStatus();
      if (response.success && response.data) {
        setGoogleDriveConnected(response.data.connected || false);
      }
    } catch (error) {
      console.error('Error checking Google Drive status:', error);
      setGoogleDriveConnected(false);
    } finally {
      setCheckingDriveStatus(false);
    }
  };

  const handleConnectGoogleDrive = async () => {
    try {
      setConnectingDrive(true);
      const response = await googleDriveApi.getAuthUrl();
      if (response.success && response.data?.authUrl) {
        // Redirect to Google OAuth
        window.location.href = response.data.authUrl;
      } else {
        throw new Error('Failed to get authorization URL');
      }
    } catch (error) {
      console.error('Error connecting Google Drive:', error);
      toast.error(error.message || 'Failed to connect Google Drive');
      setConnectingDrive(false);
    }
  };

  const handleDisconnectGoogleDrive = async () => {
    if (!window.confirm('Are you sure you want to disconnect Google Drive? You will need to reconnect to upload files.')) {
      return;
    }

    try {
      const response = await googleDriveApi.disconnect();
      if (response.success) {
        setGoogleDriveConnected(false);
        toast.success('Google Drive disconnected successfully');
      }
    } catch (error) {
      console.error('Error disconnecting Google Drive:', error);
      toast.error(error.message || 'Failed to disconnect Google Drive');
    }
  };

  const copyUserId = () => {
    navigator.clipboard.writeText(currUser._id);
    setCopied(true);
    toast.success('User ID copied to clipboard!', { duration: 2000 });
    setTimeout(() => setCopied(false), 2000);
  };

  const copyEmail = () => {
    navigator.clipboard.writeText(currUser.email);
    toast.success('Email copied to clipboard!', { duration: 2000 });
  };

  if (isLoading) {
    return (
      <div className="min-h-full min-w-full bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!currUser) return null;

  return (
    <div className="min-h-full min-w-full bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="flex items-center justify-between">
          <div 
            onClick={() => navigate('/')}
            className="text-xl font-bold text-blue-600 cursor-pointer hover:text-blue-700 transition"
          >
            CodeShare
          </div>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition"
          >
            ← Back
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-8">
          {/* Header with Gradient */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full -ml-32 -mb-32"></div>
            </div>
            
            <div className="relative">
              <div className="w-24 h-24 mx-auto mb-4 transform scale-150">
                {profilePicture}
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">{currUser.username}</h1>
              <p className="text-blue-100">{currUser.email}</p>
            </div>
          </div>

          {/* Profile Info */}
          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Account Information */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 text-left">
                  <span>👤</span> Account Information
                </h3>
                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 font-medium mb-1 text-left">Username</p>
                    <p className="text-gray-900 font-semibold text-left">{currUser.username}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 font-medium mb-1 text-left">Email</p>
                        <p className="text-gray-900 font-semibold truncate text-left">{currUser.email}</p>
                      </div>
                      <button
                        onClick={copyEmail}
                        className="ml-2 p-2 hover:bg-gray-200 rounded-lg transition"
                        title="Copy email"
                      >
                        📋
                      </button>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 font-medium mb-1 text-left">Account Status</p>
                    <div className="flex items-center gap-2">
                      {currUser.isVerified ? (
                        <>
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          <span className="text-green-700 font-semibold text-sm">Verified</span>
                        </>
                      ) : (
                        <>
                          <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                          <span className="text-yellow-700 font-semibold text-sm">Unverified</span>
                        </>
                      )}
                    </div>
                  </div>
                  {currUser.createdAt && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs text-gray-500 font-medium mb-1 text-left">Member Since</p>
                      <p className="text-gray-900 font-semibold text-left">
                        {new Date(currUser.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* User ID for Auctions */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 text-left">
                  <span>🆔</span> User ID
                </h3>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6">
                  <div className="flex items-start gap-2 mb-3">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <p className="text-sm text-blue-800 text-left">
                      Share this ID with others so they can join your auctions.
                    </p>
                  </div>
                  
                  <div className="bg-white border border-blue-300 rounded-lg p-4 mb-4">
                    <p className="text-xs text-gray-500 font-medium mb-2 text-left">Your User ID</p>
                    <p className="font-mono text-sm text-gray-800 break-all mb-3 text-left">
                      {currUser._id}
                    </p>
                    <button
                      onClick={copyUserId}
                      className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition shadow-md flex items-center justify-center gap-2"
                    >
                      {copied ? (
                        <>
                          <span>✓</span>
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <span>📋</span>
                          <span>Copy User ID</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="text-xs text-gray-600 bg-white bg-opacity-50 rounded p-3">
                    <p className="font-semibold mb-1 text-left">💡 How to use:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2 text-left">
                      <li>Others need your User ID to join your auctions</li>
                      <li>Copy and share it along with auction name and password</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 text-left">
            <span>📊</span> Your Statistics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-xl">
              <div className="text-3xl font-bold text-blue-600 mb-1 text-left">
                {currUser.pages?.length || 0}
              </div>
              <p className="text-sm text-gray-600 text-left">Documents</p>
            </div>
            <div className="p-4 bg-green-50 rounded-xl">
              <div className="text-3xl font-bold text-green-600 mb-1 text-left">
                {currUser.pages?.reduce((total, page) => total + (page.pageId?.files?.length || 0), 0) || 0}
              </div>
              <p className="text-sm text-gray-600 text-left">Files</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-xl">
              <div className="text-3xl font-bold text-purple-600 mb-1 text-left">
                {currUser.isVerified ? '✓' : '○'}
              </div>
              <p className="text-sm text-gray-600 text-left">Verified</p>
            </div>
          </div>
        </div>

        {/* Google Drive Connection Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 text-left">
            <span>☁️</span> Google Drive Storage
          </h3>
          
          {checkingDriveStatus ? (
            <div className="flex items-center gap-3 text-gray-600">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span>Checking connection status...</span>
            </div>
          ) : googleDriveConnected ? (
            <div className="space-y-4">
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">✅</span>
                  <div className="flex-1">
                    <div className="font-semibold text-green-800">Google Drive Connected</div>
                    <div className="text-sm text-green-600">Files will be uploaded to your Google Drive</div>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleDisconnectGoogleDrive}
                className="w-full px-6 py-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg font-semibold transition text-left flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">🔌</span>
                  <div>
                    <div className="font-semibold">Disconnect Google Drive</div>
                    <div className="text-sm text-red-600">Remove Google Drive connection</div>
                  </div>
                </div>
                <span className="text-red-400 group-hover:text-red-600 transition">→</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">☁️</span>
                  <div className="flex-1">
                    <div className="font-semibold text-blue-800 mb-1">Connect Google Drive</div>
                    <div className="text-sm text-blue-700 text-left">
                      Connect your Google account to upload files to Google Drive. Files will be stored in your personal Drive with 15GB free storage.
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleConnectGoogleDrive}
                disabled={connectingDrive}
                className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-semibold transition shadow-md flex items-center justify-center gap-3"
              >
                {connectingDrive ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    <span>Connect Google Drive</span>
                  </>
                )}
              </button>

              <div className="text-xs text-gray-600 bg-gray-50 rounded p-3 text-left">
                <p className="font-semibold mb-1">💡 Benefits:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>15GB free storage per Google account</li>
                  <li>Files stored in your personal Google Drive</li>
                  <li>Secure OAuth 2.0 authentication</li>
                  <li>You can revoke access anytime</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Account Actions Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 text-left">
            <span>⚙️</span> Account Settings
          </h3>
          <div className="space-y-3">

            <button
              onClick={() => navigate('/auth/forgetpassword')}
              className="w-full px-6 py-4 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 rounded-lg font-semibold transition text-left flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔑</span>
                <div>
                  <div className="font-semibold">Reset Password</div>
                  <div className="text-sm text-yellow-600">Change your account password</div>
                </div>
              </div>
              <span className="text-yellow-400 group-hover:text-yellow-600 transition">→</span>
            </button>

            <button
              onClick={() => {
                authService.logout();
                setCurrUser(null);
                localStorage.removeItem('currentUser');
                navigate('/');
                toast.success('Logged out successfully');
              }}
              className="w-full px-6 py-4 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg font-semibold transition text-left flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🚪</span>
                <div>
                  <div className="font-semibold">Logout</div>
                  <div className="text-sm text-red-600">Sign out of your account</div>
                </div>
              </div>
              <span className="text-red-400 group-hover:text-red-600 transition">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;

