import React from 'react';

/**
 * Modern Modal Component for Auction Pages
 * Reusable modal with gradient header matching auction design
 */
const ModernModal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md', // 'sm', 'md', 'lg', 'xl'
  icon = null,
  headerGradient = 'from-blue-600 to-indigo-600' // Default gradient
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black bg-opacity-60 animate-fadeIn">
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${sizeClasses[size]} transform transition-all animate-slideUp max-h-[90vh] overflow-y-auto`}>
        {/* Header */}
        <div className={`bg-gradient-to-r ${headerGradient} p-6 rounded-t-2xl sticky top-0 z-10`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {icon && <span className="text-3xl">{icon}</span>}
              <h3 className="text-2xl font-bold text-white">{title}</h3>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ModernModal;

