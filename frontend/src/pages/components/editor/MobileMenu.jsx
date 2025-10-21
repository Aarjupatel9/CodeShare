import React, { useRef } from 'react';
import { 
  menuIcon,
  pageIcon, 
  pageListIcon, 
  removeIcon, 
  fileIcon, 
  downloadIcon, 
  fileAddIcon 
} from '../../../assets/svgs';
import { getPresizeFileName, generateRandomString } from '../../../common/functions';
import useClickOutside from '../../../hooks/useClickOutside';

/**
 * MobileMenu - Mobile dropdown menu (hamburger)
 * Shows pages/files navigation on mobile devices
 * For public users, shows URL input option
 */
const MobileMenu = ({ 
  isVisible,
  currUser,
  privateTabs,
  onToggle,
  onSelectTab,
  onPageNavigate,
  onPageRemove,
  onSelectFile,
  onFileRemove,
  privateFileList,
  // Public user props
  tmpSlug,
  onTmpSlugChange,
  onTmpSlugSubmit,
  redirectArrowIcon
}) => {
  const mobileMenuRef = useRef(null);

  // Close menu when clicking outside
  useClickOutside(mobileMenuRef, () => {
    if (isVisible) {
      onToggle();
    }
  }, isVisible);

  return (
    <div className="md:hidden inline-block text-left" ref={mobileMenuRef}>
      <button
        onClick={onToggle}
        type="button"
        className="inline-flex md:hidden items-center justify-center rounded-md px-2 py-2 text-xs font-semibold shadow-sm ring-1 ring-inset ring-gray-300 text-dark bg-slate-100 hover:bg-slate-200 focus:outline-none focus:ring-gray-300 font-medium rounded-lg px-2 py-1 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-gray-800"
        aria-expanded="true"
        aria-haspopup="true"
      >
        {menuIcon}
      </button>

      {isVisible && (
        <div className="overflow-auto absolute left-0 right-0 z-10 mt-2 max-w-full sm:w-[500px] sm:right-auto max-h-96 p-3 origin-top-right rounded-md bg-gray-50 shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="flex flex-col h-full text-sm text-gray-700">
            
            {/* Public User - Show URL Input */}
            {!currUser ? (
              <div className="p-4">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">📄 Open Document by URL</h3>
                <p className="text-xs text-gray-600 mb-3">Enter a custom URL to open or create a document</p>
                <form onSubmit={(e) => { e.preventDefault(); onTmpSlugSubmit(); }} className="flex items-center gap-2">
                  <input
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    type="text"
                    placeholder="e.g., my-document"
                    onChange={onTmpSlugChange}
                    value={tmpSlug}
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition text-sm font-medium"
                    title="Open document"
                  >
                    Go {redirectArrowIcon}
                  </button>
                </form>
              </div>
            ) : (
              /* Logged User - Show Pages/Files Tabs */
              <>
                <div className="relative fixed top-0">
                  <div className="flex flex-row w-full text-sm gap-2 mb-3">
                    {privateTabs.map((tab) => {
                      return (
                        <div
                          key={tab.tabId + generateRandomString(10)}
                          className={`${
                            tab.selected 
                              ? "bg-blue-600 text-white font-semibold shadow-sm" 
                              : "bg-white text-gray-700 border border-gray-200 font-medium hover:bg-gray-50"
                          } flex items-center justify-center flex-1 py-2 px-3 rounded-lg transition cursor-pointer`}
                          onClick={(e) => onSelectTab(tab.tabId, e)}
                        >
                          {tab.tabName === "Pages" ? "📄 " : "📎 "}{tab.tabName}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="overflow-auto flex-grow h-full">

              {privateTabs[0].selected ? (
                <>
                  <div className="pb-3">
                    <button
                      onClick={(e) => onPageNavigate("new")}
                      className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition shadow-sm flex items-center justify-center gap-2 text-sm"
                    >
                      <span>⊕</span>
                      <span>New Document</span>
                    </button>
                  </div>
                  {/* Page List functionality */}
                  <div className="space-y-2 overflow-auto">
                    {currUser &&
                      currUser.pages &&
                      currUser.pages.map((page) => {
                        return (
                          <div
                            key={page.pageId._id}
                            className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm active:shadow-md transition group"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div
                                className="flex items-center gap-2 flex-1"
                                onClick={(e) => onPageNavigate(page.pageId.unique_name)}
                              >
                                <span className="text-base">{pageIcon}</span>
                                <span
                                  className="font-semibold text-gray-900 text-sm line-clamp-1"
                                  title={page.pageId.unique_name}
                                >
                                  {page.pageId.unique_name ? getPresizeFileName(page.pageId.unique_name) : "page"}
                                </span>
                              </div>
                              <button
                                onClick={() => onPageRemove(page.pageId)}
                                className="text-red-600 text-lg px-2"
                              >
                                {removeIcon}
                              </button>
                            </div>
                            <div className="pt-2 border-t border-gray-100">
                              <button
                                onClick={(e) => onPageNavigate(page.pageId.unique_name)}
                                className="w-full px-3 py-2 text-xs bg-blue-50 text-blue-600 rounded-md font-medium"
                              >
                                Open
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </>
              ) : (
                currUser && <>
                  <div className="pb-3">
                    <label className="w-full px-4 py-2.5 bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold rounded-lg transition cursor-pointer flex items-center justify-center gap-2 text-sm">
                      <input type="file" accept="*" onChange={onSelectFile} className="hidden" />
                      <span>📎</span>
                      <span>Upload File</span>
                    </label>
                  </div>

                  {/* File List functionality */}
                  {privateFileList.length > 0 && (
                    <div className="space-y-2 overflow-auto">
                      {privateFileList.map((file, index) => {
                        return (
                          <div
                            key={index}
                            className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm group"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-base">{fileIcon(file.type)}</span>
                              <span
                                className="font-semibold text-gray-900 text-sm flex-1 line-clamp-1"
                                title={file.name}
                              >
                                {file.name ? getPresizeFileName(file.name) : "file"}
                              </span>
                            </div>
                            <div className="flex gap-2 pt-2 border-t border-gray-100">
                              <a
                                href={file.url}
                                target="_blank"
                                download={file.name}
                                rel="noreferrer"
                                className="flex-1 px-3 py-2 text-xs bg-green-50 text-green-600 rounded-md font-medium text-center"
                              >
                                Download
                              </a>
                              <button
                                onClick={() => onFileRemove(file)}
                                className="px-3 py-2 text-xs bg-red-50 text-red-600 rounded-md font-medium"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileMenu;

