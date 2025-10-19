import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import authService from '../services/authService';
import toast from 'react-hot-toast';
import { profilePicture } from '../assets/svgs';

/**
 * UserProfilePage - Dedicated user profile page
 * Shows user information, settings, and account management
 */
const UserProfilePage = () => {
  const navigate = useNavigate();
  const { currUser, setCurrUser } = useContext(UserContext);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Check authentication
    authService.checkUserLogInStatus()
      .then((res) => {
        setCurrUser(res.user);
        setIsLoading(false);
      })
      .catch(() => {
        navigate('/auth/login');
      });
  }, [navigate, setCurrUser]);

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
      <nav className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
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
      <div className="max-w-4xl mx-auto px-6 py-8">
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
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span>👤</span> Account Information
                </h3>
                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 font-medium mb-1">Username</p>
                    <p className="text-gray-900 font-semibold">{currUser.username}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 font-medium mb-1">Email</p>
                        <p className="text-gray-900 font-semibold truncate">{currUser.email}</p>
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
                    <p className="text-xs text-gray-500 font-medium mb-1">Account Status</p>
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
                      <p className="text-xs text-gray-500 font-medium mb-1">Member Since</p>
                      <p className="text-gray-900 font-semibold">
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
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span>🆔</span> User ID
                </h3>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6">
                  <div className="flex items-start gap-2 mb-3">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <p className="text-sm text-blue-800">
                      Share this ID with others so they can join your auctions.
                    </p>
                  </div>
                  
                  <div className="bg-white border border-blue-300 rounded-lg p-4 mb-4">
                    <p className="text-xs text-gray-500 font-medium mb-2">Your User ID</p>
                    <p className="font-mono text-sm text-gray-800 break-all mb-3">
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
                    <p className="font-semibold mb-1">💡 How to use:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
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
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span>📊</span> Your Statistics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {currUser.pages?.length || 0}
              </div>
              <p className="text-sm text-gray-600">Documents</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {currUser.pages?.reduce((total, page) => total + (page.pageId?.files?.length || 0), 0) || 0}
              </div>
              <p className="text-sm text-gray-600">Files</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <div className="text-3xl font-bold text-purple-600 mb-1">
                {currUser.isVerified ? '✓' : '○'}
              </div>
              <p className="text-sm text-gray-600">Verified</p>
            </div>
          </div>
        </div>

        {/* Account Actions Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span>⚙️</span> Account Settings
          </h3>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/p/' + currUser.username)}
              className="w-full px-6 py-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-semibold transition text-left flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">📄</span>
                <div>
                  <div className="font-semibold">My Documents</div>
                  <div className="text-sm text-blue-600">View all your pages</div>
                </div>
              </div>
              <span className="text-blue-400 group-hover:text-blue-600 transition">→</span>
            </button>

            <button
              onClick={() => navigate('/p/t/auction')}
              className="w-full px-6 py-4 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg font-semibold transition text-left flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🏏</span>
                <div>
                  <div className="font-semibold">My Auctions</div>
                  <div className="text-sm text-purple-600">Manage your auctions</div>
                </div>
              </div>
              <span className="text-purple-400 group-hover:text-purple-600 transition">→</span>
            </button>

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

