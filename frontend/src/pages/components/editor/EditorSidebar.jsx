import React from 'react';
import { 
  pageIcon, 
  pageListIcon, 
  removeIcon, 
  fileIcon, 
  downloadIcon, 
  fileAddIcon 
} from '../../../assets/svgs';
import { getPresizeFileName, generateRandomString } from '../../../common/functions';

/**
 * EditorSidebar - Pages/Files sidebar for logged users
 * Shows user's pages and files with management options
 */
const EditorSidebar = ({ 
  currUser,
  privateTabs,
  onSelectTab,
  onPageNavigate,
  onPageRemove,
  onSelectFile,
  onFileRemove,
  privateFileList
}) => {
  return (
    <aside
      id="separator-sidebar"
      className="hidden md:block lg:block w-64 lg:w-80 flex-shrink-0 bg-white border-r border-gray-200 overflow-y-auto"
      aria-label="Sidebar"
    >
      <div className="flex flex-col h-full px-2 py-1 overflow-y-auto">
        {/* tabs */}
        <div className="flex flex-row h-[30px] w-full text-sm justify-center gap-2">
          {privateTabs.map((tab, index) => {
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

        {/* Tabs content */}
        {privateTabs[0].selected ? (
          <>
            <div className="pt-4 mt-4 space-y-2 font-medium text-sm border-t border-gray-200 dark:border-gray-700">
              <div>
                <label
                  onClick={(e) => onPageNavigate("new")}
                  className="custom-file-upload gap-2 cursor-pointer flex flex-row justify-around items-center p-2 text-gray-900 transition duration-75 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white group"
                >
                  {pageListIcon}
                  Create new page
                </label>
              </div>
            </div>

            {/* Page List */}
            <div className="pt-4 mt-4 space-y-2 font-medium border-t border-gray-200 dark:border-gray-700">
              {currUser.pages &&
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
          currUser && (
            <>
              <div className="pt-2 mt-4 font-medium text-sm border-gray-200 dark:border-gray-700">
                <label className="custom-file-upload gap-2 cursor-pointer flex flex-row justify-around items-center p-2 text-gray-900 transition duration-75 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white group">
                  <input
                    type="file"
                    accept="*"
                    onChange={onSelectFile}
                  />
                  {fileAddIcon}
                  Select to Upload Files
                </label>
              </div>
              {privateFileList.length > 0 && (
                <div className="pt-1 space-y-2 font-medium border-t border-gray-200 dark:border-gray-700">
                  {privateFileList.map((file, _id) => {
                    return (
                      <li
                        key={_id}
                        className="Image-content flex flex-row items-center gap-1 justify-between border-blue-300"
                      >
                        <div className="flex items-center p-2 text-gray-900 transition duration-75 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white group flex-1">
                          {fileIcon(file.type)}
                          <span className="ms-3">
                            {file.name ? getPresizeFileName(file.name) : "file"}
                          </span>
                        </div>
                        <div className="flex flex-row">
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
          )
        )}
      </div>
    </aside>
  );
};

export default EditorSidebar;

