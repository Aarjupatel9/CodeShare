import React from 'react';

/**
 * FeatureModal - Mobile features showcase modal
 * Bottom sheet showing premium features on mobile
 */
const FeatureModal = ({ isVisible, onClose, onNavigate }) => {
  if (!isVisible) return null;

  return (
    <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose}>
      <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-3xl max-h-[85vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">Premium Features</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">📎</span>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-2">File Uploads</h4>
                <p className="text-sm text-gray-600">Upload images, PDFs, and Excel files to your documents</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">📄</span>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Advanced Documents</h4>
                <p className="text-sm text-gray-600">Multiple pages, version history, and collaboration</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🏏</span>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Cricket Auctions</h4>
                <p className="text-sm text-gray-600">Live bidding, team management, and real-time tracking</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => onNavigate("/auth/register")}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition"
          >
            🚀 Sign Up Free
          </button>
          <p className="text-center text-sm text-gray-600 mt-3">
            Already have an account?
            <button onClick={() => onNavigate("/auth/login")} className="text-blue-600 hover:underline font-medium ml-1">Login</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default FeatureModal;

