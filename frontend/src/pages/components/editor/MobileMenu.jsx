import React from 'react';
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

/**
 * MobileMenu - Mobile dropdown menu (hamburger)
 * Shows pages/files navigation on mobile devices
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
  privateFileList
}) => {
  return (
    <div className="md:hidden inline-block text-left">
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
        <div className="overflow-auto absolute left-0 z-10 mt-2 min-w-[240px] max-w-96 max-h-96 p-1 px-3 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="flex flex-col h-full text-sm text-gray-700 dark:text-gray-200">
            <div className="relative fixed top-0">
              <div className="flex flex-row h-[30px] w-full text-sm justify-center gap-2">
                {privateTabs.map((tab) => {
                  return (
                    <div
                      key={tab.tabId + generateRandomString(10)}
                      className={`${
                        tab.selected ? "bg-slate-300" : "bg-slate-100"
                      } h-full flex items-center justify-center w-full hover:bg-slate-400 text-black rounded`}
                      onClick={(e) => onSelectTab(tab.tabId, e)}
                    >
                      {tab.tabName}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="overflow-auto flex-grow h-full">

              {privateTabs[0].selected ? (
                <>
                  <div className="pt-2 mt-4 font-medium text-sm border-t border-gray-200 dark:border-gray-700">
                    <div>
                      <label
                        onClick={(e) => onPageNavigate("new")}
                        className="custom-file-upload gap-2 cursor-pointer flex flex-row justify-around items-center p-1 text-gray-900 transition duration-75 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white group"
                      >
                        {pageListIcon}
                        Create new page
                      </label>
                    </div>
                  </div>
                  {/* Page List functionality */}
                  <div className="pt-4 mt-4 space-y-2 font-medium border-t border-gray-200 dark:border-gray-700 overflow-auto">
                    {currUser &&
                      currUser.pages &&
                      currUser.pages.map((page) => {
                        return (
                          <li
                            key={page.pageId._id}
                            className="text-xs w-full max-w-full flex flex-row items-center gap-1 justify-between border-blue-300 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white"
                          >
                            <div
                              className="flex items-center cursor-pointer p-2 text-gray-900 transition duration-75 rounded-lg group flex-1"
                              onClick={(e) => onPageNavigate(page.pageId.unique_name)}
                            >
                              {pageIcon}
                              <span
                                className="ms-3 w-full line-clamp-1"
                                title={page.pageId.unique_name}
                              >
                                {page.pageId.unique_name ? getPresizeFileName(page.pageId.unique_name) : "page"}
                              </span>
                            </div>
                            <div className="flex flex-row">
                              <div onClick={() => onPageRemove(page.pageId)}>
                                {removeIcon}
                              </div>
                            </div>
                          </li>
                        );
                      })}
                  </div>
                </>
              ) : (
                currUser && <>
                  <div className="pt-4 mt-4 font-medium text-sm border-t border-gray-200 dark:border-gray-700">
                    <label className="custom-file-upload gap-2 cursor-pointer flex flex-row justify-around items-center p-2 text-gray-900 transition duration-75 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white group">
                      <input type="file" accept="*" onChange={onSelectFile} />
                      {fileAddIcon}
                      Upload File
                    </label>
                  </div>

                  {/* File List functionality */}
                  {privateFileList.length > 0 && (
                    <div className="pt-4 mt-4 space-y-2 font-medium border-t border-gray-200 dark:border-gray-700 overflow-auto">
                      {privateFileList.map((file, index) => {
                        return (
                          <li
                            key={index}
                            className="text-xs w-full max-w-full flex flex-row items-center gap-1 justify-between border-blue-300"
                          >
                            <div className="flex items-center p-2 text-gray-900 transition duration-75 rounded-lg group flex-1">
                              {fileIcon(file.type)}
                              <span
                                className="ms-3 cursor-pointer line-clamp-1"
                                title={file.name}
                              >
                                {file.name ? getPresizeFileName(file.name) : "file"}
                              </span>
                            </div>
                            <div className="flex flex-row min-w-[50px]">
                              <a
                                href={file.url}
                                target="_blank"
                                download={file.name}
                                rel="noreferrer"
                              >
                                {downloadIcon}
                              </a>
                              <div onClick={() => onFileRemove(file)}>
                                {removeIcon}
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileMenu;

