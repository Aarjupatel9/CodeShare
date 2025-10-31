import React from 'react'

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', type = 'warning' }) => {
  if (!isOpen) return null

  const typeStyles = {
    warning: {
      icon: '⚠️',
      confirmBg: 'bg-red-600 hover:bg-red-700',
      titleColor: 'text-red-600'
    },
    info: {
      icon: 'ℹ️',
      confirmBg: 'bg-blue-600 hover:bg-blue-700',
      titleColor: 'text-blue-600'
    }
  }

  const style = typeStyles[type] || typeStyles.warning

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-[9998] transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div 
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Content */}
          <div className="p-6 flex flex-col items-center">
            {/* Icon & Title */}
            <div className="flex items-center gap-4 mb-4">
              <div className="text-4xl">{style.icon}</div>
              <h3 className={`text-2xl font-bold ${style.titleColor}`}>
                {title}
              </h3>
            </div>

            {/* Message */}
            <p className="text-gray-700 mb-6">
              {message}
            </p>

            {/* Actions */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors font-medium"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className={`px-5 py-2.5 rounded-lg text-white ${style.confirmBg} transition-colors font-medium shadow-lg`}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ConfirmModal
