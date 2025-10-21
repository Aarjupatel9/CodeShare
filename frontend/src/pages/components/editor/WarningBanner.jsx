import React from 'react';

/**
 * WarningBanner - Save warning for non-logged users
 * Shows yellow banner with save button when there are unsaved changes
 * Banner only disappears when user saves (no dismiss option to prevent data loss)
 */
const WarningBanner = ({ onSave, show = true }) => {
  if (!show) return null;
  
  return (
    <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2.5 flex items-center justify-between text-sm flex-shrink-0 animate-slideDown">
      <div className="flex items-center gap-2">
        <svg className="w-5 h-5 text-yellow-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
        </svg>
        <span className="text-yellow-800">
          <span className="font-medium">Your work is not saved!</span>{' '}
          <span className="hidden sm:inline">Click "Save" to save your document.</span>
        </span>
      </div>
      <button
        type="button"
        onClick={onSave}
        className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium rounded-lg transition shadow-sm flex items-center gap-1 flex-shrink-0"
      >
        💾 <span className="hidden sm:inline">Save Now</span><span className="sm:hidden">Save</span>
      </button>
    </div>
  );
};

export default WarningBanner;

