import React, { useState } from 'react';
import { closeIcon } from '../../assets/svgs';

/**
 * InputModal - Reusable modal for text input (save, rename, etc.)
 */
const InputModal = ({ 
  isOpen, 
  onClose, 
  title, 
  label, 
  placeholder, 
  defaultValue = '', 
  onSubmit, 
  submitButtonText = 'Save',
  validateInput,
  showCancel = true
}) => {
  const [inputValue, setInputValue] = useState(defaultValue);
  const [error, setError] = useState('');

  // Reset state when modal opens/closes or defaultValue changes
  React.useEffect(() => {
    if (isOpen) {
      setInputValue(defaultValue);
      setError('');
    }
  }, [isOpen, defaultValue]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    const trimmedValue = inputValue.trim();
    
    if (!trimmedValue) {
      setError('This field is required');
      return;
    }

    // Custom validation if provided
    if (validateInput) {
      const validationResult = validateInput(trimmedValue);
      if (validationResult !== true) {
        setError(validationResult || 'Invalid input');
        return;
      }
    }

    onSubmit(trimmedValue);
    onClose();
  };

  const handleClose = () => {
    setInputValue('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[50000] flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white border border-gray-200 rounded-xl w-[90%] max-w-md shadow-2xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">{title}</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              {closeIcon}
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col items-start w-full space-y-2">
              <label className="text-sm font-medium text-gray-700 text-left">
                {label}
              </label>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={placeholder}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                  error 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                autoFocus
              />
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
              {!error && (
                <p className="text-xs text-gray-500">
                  Letters, numbers, spaces, dots (for decimals), underscores, and hyphens are allowed. Spaces will be converted to underscores for the URL.
                </p>
              )}
            </div>
            
            <div className="flex flex-row gap-3 justify-end w-full">
              {showCancel && (
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
              >
                {submitButtonText}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InputModal;

