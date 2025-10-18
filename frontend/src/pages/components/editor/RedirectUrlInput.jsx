import React from 'react';

/**
 * RedirectUrlInput - Custom URL input for non-logged users
 * Allows setting custom document URL
 */
const RedirectUrlInput = ({ value, onChange, onSubmit, redirectArrowIcon }) => {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="flex items-center gap-2">
      <div className="relative">
        <input
          className="pl-3 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition w-32 md:w-40"
          type="text"
          placeholder="Custom URL"
          onChange={onChange}
          value={value}
        />
      </div>
      <button
        type="submit"
        className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
        title="Set custom URL"
      >
        {redirectArrowIcon}
      </button>
    </form>
  );
};

export default RedirectUrlInput;

