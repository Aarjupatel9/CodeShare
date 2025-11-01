import React, { useState, useMemo, useRef } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  pageIcon,
  removeIcon,
  fileIcon,
  downloadIcon
} from '../../../assets/svgs';
import { getPresizeFileName, generateRandomString } from '../../../common/functions';
import useClickOutside from '../../../hooks/useClickOutside';
import toast from 'react-hot-toast';

/**
 * EditorSidebar - Pages/Files sidebar for logged users
 * Shows user's pages and files with management options
 * Features: Search, Drag & Drop, Pin/Unpin, Rename
 */
const EditorSidebar = ({
  currUser,
  setCurrUser,
  privateTabs,
  onSelectTab,
  onPageNavigate,
  onPageRemove,
  onSelectFile,
  onFileRemove,
  privateFileList,
  onPageRename,
  onPageReorder,
  onPagePinToggle
}) => {
  const [documentSearch, setDocumentSearch] = useState('');
  const [fileSearch, setFileSearch] = useState('');
  const [optimisticPages, setOptimisticPages] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );


  // Filter and sort documents (use optimistic state if available)
  const sortedDocuments = useMemo(() => {
    const pagesToUse = optimisticPages || currUser?.pages;
    if (!pagesToUse) return [];

    let docs = [...pagesToUse];

    // Apply search filter
    if (documentSearch.trim()) {
      docs = docs.filter(page =>
        page.pageId.unique_name.toLowerCase().includes(documentSearch.toLowerCase())
      );
    }

    // Sort: pinned first, then by order
    return docs.sort((a, b) => {
      const aPinned = a.isPinned || false;
      const bPinned = b.isPinned || false;
      if ((aPinned && bPinned) || (!aPinned && !bPinned)) {
        return (a.order || 0) - (b.order || 0);
      }
      return aPinned ? -1 : 1;
    });
  }, [currUser?.pages, documentSearch, optimisticPages]);

  // Filter files
  const filteredFiles = useMemo(() => {
    if (!privateFileList) return [];
    if (!fileSearch.trim()) return privateFileList;

    return privateFileList.filter(file =>
      file.name.toLowerCase().includes(fileSearch.toLowerCase())
    );
  }, [privateFileList, fileSearch]);

  // Handle drag end for documents
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!active || !over || active.id === over.id) return;

    const oldIndex = sortedDocuments.findIndex(doc => doc.pageId._id === active.id);
    const newIndex = sortedDocuments.findIndex(doc => doc.pageId._id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const newOrder = arrayMove(sortedDocuments, oldIndex, newIndex);

    // Optimistic update: apply new order immediately
    const optimisticPagesWithOrder = newOrder.map((page, index) => ({ ...page, order: index }));
    setOptimisticPages(optimisticPagesWithOrder);

    // Call parent handler to update order in database
    if (onPageReorder) {
      onPageReorder(active.id, over.id, newOrder, (success) => {
        // Clear optimistic state on success (real data will be shown) or failure (revert)
        setOptimisticPages(null);
        if (!success) {
          toast.error("Failed to update document order. Please try again.");
        }
      });
    }
  };

  // Handle rename
  const handleRename = (pageId) => {
    if (onPageRename) {
      onPageRename(pageId);
    }
  };

  // Handle pin toggle
  const handlePinToggle = (e, page) => {
    e.stopPropagation();
    if (onPagePinToggle) {
      onPagePinToggle(page);
    }
  };

  return (
    <aside
      id="separator-sidebar"
      className="hidden md:block lg:block w-64 lg:w-80 flex-shrink-0 bg-gray-50 border-r border-gray-200 overflow-y-auto"
      aria-label="Sidebar"
    >
      <div className="flex flex-col h-full px-4 py-4 overflow-y-auto">
        {/* Tabs */}
        <div className="flex flex-row w-full text-sm gap-2 mb-3">
          {privateTabs.map((tab, index) => {
            return (
              <div
                key={tab.tabId + generateRandomString(10)}
                className={`${tab.selected
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

            {/* Search bar for documents */}
            <div className="mb-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={documentSearch}
                  onChange={(e) => setDocumentSearch(e.target.value)}
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  🔍
                </span>
              </div>
            </div>

            {/* Page List with Drag & Drop */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sortedDocuments.map(doc => doc.pageId._id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {sortedDocuments.length > 0 ? (
                    sortedDocuments.map((page) => (
                      <DocumentCard
                        key={page.pageId._id}
                        page={page}
                        onNavigate={onPageNavigate}
                        onRemove={onPageRemove}
                        onPinToggle={handlePinToggle}
                        onStartRename={() => handleRename(page.pageId._id)}
                      />
                    ))
                  ) : (
                    <div className="text-center text-gray-500 text-sm py-8">
                      {documentSearch ? 'No documents found' : 'No documents yet'}
                    </div>
                  )}
                </div>
              </SortableContext>
            </DndContext>
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

              {/* Search bar for files */}
              <div className="mb-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search files..."
                    value={fileSearch}
                    onChange={(e) => setFileSearch(e.target.value)}
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    🔍
                  </span>
                </div>
              </div>

              {filteredFiles.length > 0 ? (
                <div className="space-y-3">
                  {filteredFiles.map((file, _id) => {
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
              ) : (
                <div className="text-center text-gray-500 text-sm py-8">
                  {fileSearch ? 'No files found' : 'No files yet'}
                </div>
              )}
            </>
          )
        )}
      </div>
    </aside>
  );
};

// Sortable Document Card Component
const DocumentCard = ({
  page,
  onNavigate,
  onRemove,
  onPinToggle,
  onStartRename
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: page.pageId._id });

  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useClickOutside(menuRef, () => setShowMenu(false));

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isPinned = page.isPinned || false;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border ${isPinned ? 'border-yellow-400' : 'border-gray-200'} rounded-lg p-3 hover:shadow-md transition cursor-pointer group ${isDragging ? 'shadow-lg' : ''}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 flex-1">
          {/* Drag handle */}
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
          >
            ⋮⋮
          </div>

          {/* Pinned indicator */}
          {isPinned && (
            <span className="text-sm text-yellow-600" title="Pinned">
              📌
            </span>
          )}

          {/* Page name */}
          <div
            className="flex items-center gap-2 flex-1"
            onClick={(e) => onNavigate(page.pageId.unique_name)}
          >
            <span className="text-lg">{pageIcon}</span>
            <span
              className="font-semibold text-gray-900 text-sm line-clamp-1"
              title={page.pageId.unique_name}
            >
              {page.pageId.unique_name ? getPresizeFileName(page.pageId.unique_name) : "page"}
            </span>
          </div>
        </div>

        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-gray-800 transition text-lg"
            title="More options"
          >
            ⋯
          </button>

          {/* Dropdown menu */}
          {showMenu && (
            <div className="absolute right-0 top-6 z-50 w-40 bg-white border border-gray-200 rounded-lg shadow-lg py-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPinToggle(e, page);
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <span>{isPinned ? '📌' : '📍'}</span>
                <span>{isPinned ? 'Unpin' : 'Pin'}</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onStartRename();
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <span>✏️</span>
                <span>Rename</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(page.pageId);
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <span>{removeIcon}</span>
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="pt-2 border-t border-gray-100">
        <button
          onClick={(e) => onNavigate(page.pageId.unique_name)}
          className="w-full px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 font-medium transition"
        >
          Open
        </button>
      </div>
    </div>
  );
};

export default EditorSidebar;
