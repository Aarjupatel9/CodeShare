import React from 'react';

/**
 * FloatingHint - Mobile tip to encourage signup
 * Shows after 3 seconds on mobile devices
 */
const FloatingHint = ({ isVisible, onClose, onViewFeatures }) => {
  if (!isVisible) return null;

  return (
    <div className="lg:hidden fixed bottom-20 right-4 max-w-xs bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 z-40 animate-slide-in-right">
      <button
        onClick={onClose}
        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs"
      >
        ✕
      </button>
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-xl">💡</span>
        </div>
        <div>
          <h4 className="font-bold text-gray-900 text-sm mb-1">Tip: Sign up for more!</h4>
          <p className="text-xs text-gray-600">Unlock file uploads, multiple pages, and auctions</p>
        </div>
      </div>
      <button
        onClick={onViewFeatures}
        className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
      >
        View All Features
      </button>
    </div>
  );
};

export default FloatingHint;

