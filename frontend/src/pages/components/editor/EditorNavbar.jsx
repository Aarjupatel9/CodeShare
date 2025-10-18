import React from 'react';

/**
 * EditorNavbar - Top navigation bar
 * Shows CodeShare logo, nav links, and login/profile actions
 */
const EditorNavbar = ({ 
  currUser, 
  username,
  dropdownVisibility,
  setDropdownVisibility,
  userProfileIcon,
  profilePicture,
  onNavigate,
  onLogout,
  onShowUserProfile,
  onShowHelp,
  RedirectUrlComponent,
  MobileMenuComponent
}) => {
  
  const handleProfileClick = () => {
    setDropdownVisibility((prev) => {
      var val = structuredClone(prev);
      val.file = false;
      val.history = false;
      val.profile = !val.profile;
      return val;
    });
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-4">
        {currUser && MobileMenuComponent}
        <div className="text-xl font-bold text-blue-600">CodeShare</div>
      </div>
      
      <div className="hidden md:flex items-center gap-6 text-sm">
        {!currUser ? (
          <>
            <a href="/games" className="text-gray-700 hover:text-blue-600">Games</a>
            <a href="/t/auction" className="text-gray-700 hover:text-blue-600 flex items-center gap-1">
              Auctions <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Pro</span>
            </a>
            <a href="#" className="text-gray-700 hover:text-blue-600 flex items-center gap-1">
              My Documents <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Pro</span>
            </a>
          </>
        ) : (
          <>
            <a href={`/p/${username}/new`} className="text-gray-700 hover:text-blue-600">My Documents</a>
            <a href="/games" className="text-gray-700 hover:text-blue-600">Games</a>
            <a href="/t/auction" className="text-gray-700 hover:text-blue-600">Auctions</a>
          </>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        {!currUser && <div className="hidden md:block">{RedirectUrlComponent}</div>}
        
        {/* Login/Profile Button */}
        <div className="flex items-center gap-2">
          <div
            onClick={!currUser ? () => onNavigate("/auth/login") : handleProfileClick}
            className={`${currUser ? "p-2 hover:bg-gray-100 rounded-lg" : "px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"} text-sm font-medium cursor-pointer transition`}
          >
            {currUser ? userProfileIcon : "Login"}
          </div>
          {!currUser && (
            <a href="/auth/register" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition">
              Sign Up
            </a>
          )}
          
          {/* Profile Dropdown */}
          {currUser && dropdownVisibility.profile && (
            <div
              className="absolute right-0 top-16 z-10 mt-2 p-1 min-w-48 max-h-96 overflow-auto origin-top-right rounded-md bg-slate-300 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
              role="menu"
            >
              <ul className="py-2 text-sm text-gray-700 dark:text-gray-200 rounded font-bold">
                <li className="flex px-1 items-center rounded">
                  <div
                    className="w-full version-text text-justify cursor-pointer block gap-1 px-2 py-1 border-1 border-black-100 hover:bg-slate-100 dark:hover:bg-gray-600 dark:hover:text-white flex items-center rounded"
                    onClick={onShowUserProfile}
                  >
                    <div className="w-12 h-12 flex-shrink-0">
                      {profilePicture}
                    </div>
                    <span className="ml-2">{username}</span>
                  </div>
                </li>

                <li className="flex items-center px-1">
                  <div
                    onClick={() => onNavigate("/t/auction")}
                    className="w-full version-text text-justify cursor-pointer block gap-1 px-2 py-1 border-1 border-black-100 hover:bg-slate-100 dark:hover:bg-gray-600 dark:hover:text-white rounded"
                  >
                    Auction
                  </div>
                </li>

                <li className="flex items-center px-1">
                  <div
                    onClick={() => onNavigate("/games")}
                    className="w-full version-text text-justify cursor-pointer block gap-1 px-2 py-1 border-1 border-black-100 hover:bg-slate-100 dark:hover:bg-gray-600 dark:hover:text-white rounded"
                  >
                    Games
                  </div>
                </li>

                <li className="flex items-center px-1">
                  <div
                    onClick={onShowHelp}
                    className="w-full version-text text-justify cursor-pointer block gap-1 px-2 py-1 border-1 border-black-100 hover:bg-slate-100 dark:hover:bg-gray-600 dark:hover:text-white rounded"
                  >
                    Help
                  </div>
                </li>

                <li className="flex items-center px-1">
                  <div
                    onClick={onLogout}
                    className="w-full version-text text-justify cursor-pointer block gap-1 px-2 py-1 border-1 border-black-100 hover:bg-slate-100 dark:hover:bg-gray-600 dark:hover:text-white rounded"
                  >
                    Logout
                  </div>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default EditorNavbar;

