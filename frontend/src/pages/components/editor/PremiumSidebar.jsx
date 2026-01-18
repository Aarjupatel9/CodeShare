import React from 'react';

/**
 * PremiumSidebar - Features showcase for non-logged users
 * Desktop sidebar showing premium features
 */
const PremiumSidebar = ({ onNavigate }) => {
  return (
    <aside className="hidden lg:block w-80 xl:w-96 flex-shrink-0 bg-gradient-to-br from-blue-50 to-indigo-50 border-r border-gray-200 overflow-y-auto">
      <div className="p-6 space-y-6">
        <div className="text-center">
          <div className="text-2xl mb-2">✨</div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">Unlock Premium Features</h3>
          <p className="text-sm text-gray-600">Sign up for free to access everything</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-xl">📎</span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">File Uploads</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Upload images & PDFs</li>
                <li>• Attach Excel files</li>
                <li>• File management</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-xl">📄</span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Advanced Documents</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Multiple pages</li>
                <li>• Version history</li>
                <li>• Share & collaborate</li>
              </ul>
            </div>
          </div>
        </div>

        {/* <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-xl">🏏</span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Cricket Auctions</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Live bidding system</li>
                <li>• Team management</li>
                <li>• Real-time tracking</li>
              </ul>
            </div>
          </div>
        </div> */}

        <button onClick={() => onNavigate("/auth/register")} className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition shadow-lg">
          🚀 Sign Up Free
        </button>

        <p className="text-center text-sm text-gray-600">
          Already have an account?
          <button onClick={() => onNavigate("/auth/login")} className="text-blue-600 hover:underline font-medium ml-1">Login</button>
        </p>
      </div>
    </aside>
  );
};

export default PremiumSidebar;

