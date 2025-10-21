import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * SubscriptionModal - Modal shown to public users when clicking on premium features
 * Encourages users to sign up for access to premium features like Auctions
 */
const SubscriptionModal = ({ isVisible, onClose, feature = "Auctions" }) => {
  const navigate = useNavigate();

  if (!isVisible) return null;

  const handleSignUp = () => {
    navigate('/auth/register');
  };

  const handleLogin = () => {
    navigate('/auth/login');
  };

  const handleLearnMore = () => {
    navigate('/help');
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all">
          {/* Header with Gradient */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 text-center">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-3xl font-bold text-white mb-2">Premium Feature</h2>
            <p className="text-blue-100 text-lg">{feature} - Sign up to get started</p>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">
                Unlock {feature} Today!
              </h3>
              <p className="text-gray-600 text-center mb-4">
                {feature === "Auctions" 
                  ? "Create and manage cricket/sports auctions with advanced features like team management, player bidding, and live updates."
                  : "Get access to premium features and take your experience to the next level."}
              </p>
            </div>

            {/* Features List */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 mb-6">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span>✨</span> What you'll get:
              </h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Create unlimited auctions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Team and player management</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Live bidding system</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Real-time updates</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Advanced analytics</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 mb-4">
              <button
                onClick={handleSignUp}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-bold text-lg shadow-lg transform hover:scale-105 transition"
              >
                Sign Up Free
              </button>
              
              <button
                onClick={handleLogin}
                className="w-full px-6 py-3 bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg font-semibold transition"
              >
                Already have an account? Login
              </button>
            </div>

            {/* Learn More */}
            <div className="text-center">
              <button
                onClick={handleLearnMore}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
              >
                Learn more about features →
              </button>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
};

export default SubscriptionModal;

