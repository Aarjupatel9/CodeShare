import React from 'react';
import { 
  pageIcon, 
  removeIcon, 
  fileIcon, 
  downloadIcon
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
      className="hidden md:block lg:block w-64 lg:w-80 flex-shrink-0 bg-gray-50 border-r border-gray-200 overflow-y-auto"
      aria-label="Sidebar"
    >
      <div className="flex flex-col h-full px-4 py-4 overflow-y-auto">
        {/* tabs */}
        <div className="flex flex-row w-full text-sm gap-2 mb-3">
          {privateTabs.map((tab, index) => {
            return (
              <div
                key={tab.tabId + generateRandomString(10)}
                className={`${
                  tab.selected 
                    ? "bg-blue-600 text-white font-semibold shadow-sm" 
                    : "bg-white text-gray-700 border border-gray-200 font-medium hover:bg-gray-50"
                } flex items-center justify-center flex-1 py-1.5 px-3 rounded-lg transition cursor-pointer`}
                onClick={(e) => onSelectTab(tab.tabId, e)}
              >
                {tab.tabName === "Pages" ? "📄 " : "📎 "}{tab.tabName}
              </div>
            );
          })}
        </div>

        {/* Tabs content */}
        {privateTabs[0].selected ? (
          <>
            <div className="mb-3">
              <button
                onClick={(e) => onPageNavigate("new")}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition shadow-sm flex items-center justify-center gap-2 text-sm"
              >
                <span>⊕</span>
                <span>New Document</span>
              </button>
            </div>

            {/* Page List */}
            <div className="space-y-3">
              {currUser.pages &&
                currUser.pages.map((page) => {
                  return (
                    <div
                      key={page.pageId._id}
                      className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div
                          className="flex items-center gap-2 flex-1"
                          onClick={(e) => onPageNavigate(page.pageId.unique_name)}
                        >
                          <span className="text-lg">{pageIcon}</span>
                          <span
                            className="font-semibold text-gray-900 text-sm line-clamp-1"
                            title={page.pageId.unique_name}
                          >
                            {page.pageId.unique_name ? getPresizeFileName(page.pageId.unique_name) : "page"}
                          </span>
                        </div>
                        <button
                          onClick={() => onPageRemove(page.pageId)}
                          className="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-700 transition text-lg"
                        >
                          {removeIcon}
                        </button>
                      </div>
                      <div className="pt-2 border-t border-gray-100">
                        <button
                          onClick={(e) => onPageNavigate(page.pageId.unique_name)}
                          className="w-full px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 font-medium transition"
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
          currUser && (
            <>
              <div className="mb-3">
                <label className="w-full px-4 py-2 bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold rounded-lg transition cursor-pointer flex items-center justify-center gap-2 text-sm">
                  <input
                    type="file"
                    accept="*"
                    onChange={onSelectFile}
                    className="hidden"
                  />
                  <span>📎</span>
                  <span>Upload File</span>
                </label>
              </div>
              {privateFileList.length > 0 && (
                <div className="space-y-3">
                  {privateFileList.map((file, _id) => {
                    return (
                      <div
                        key={_id}
                        className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition group"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{fileIcon(file.type)}</span>
                          <span className="font-semibold text-gray-900 text-sm flex-1 line-clamp-1" title={file.name}>
                            {file.name ? getPresizeFileName(file.name) : "file"}
                          </span>
                        </div>
                        <div className="flex gap-2 pt-2 border-t border-gray-100">
                          <a
                            href={file.url}
                            target="_blank"
                            download={file.name}
                            rel="noreferrer"
                            className="flex-1 px-3 py-1.5 text-xs bg-green-50 text-green-600 rounded-md hover:bg-green-100 font-medium transition text-center"
                          >
                            Download
                          </a>
                          <button
                            onClick={() => onFileRemove(file)}
                            className="px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded-md hover:bg-red-100 font-medium transition"
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
          )
        )}
      </div>
    </aside>
  );
};

export default EditorSidebar;

