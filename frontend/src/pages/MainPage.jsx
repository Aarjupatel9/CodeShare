import React, { useContext, useEffect, useRef, useState, useCallback } from "react";
import { useConfig } from "../hooks/useConfig";
import userService from "../services/userService";
import documentApi from "../services/api/documentApi";
import fileApi from "../services/api/fileApi";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import flobiteJS from "flowbite/dist/flowbite.min.js";
import { io } from "socket.io-client";
import useKeys from "../hooks/keyKeys";
import useClickOutside from "../hooks/useClickOutside";
import {
  currentVersionIcon,
  versionIndicatorIcon,
  downArrowIcon,
  userProfileIcon,
  profilePicture,
  redirectArrowIcon,
} from "../assets/svgs";
import { UserContext } from "../context/UserContext";
import TmceEditor from "./TmceEditor";
import {
  generateRandomString,
  getTimeInFormate,
  isReservedRouteName,
  isValidAndNotReservedSlug,
} from "../common/functions";

// Import new components
import EditorNavbar from "./components/editor/EditorNavbar";
import WarningBanner from "./components/editor/WarningBanner";
import PremiumSidebar from "./components/editor/PremiumSidebar";
import SubscriptionModal from "./components/editor/SubscriptionModal";
import EditorSidebar from "./components/editor/EditorSidebar";
import MobileMenu from "./components/editor/MobileMenu";
import FloatingHint from "./components/editor/FloatingHint";
import FeatureModal from "./components/editor/FeatureModal";
import RedirectUrlInput from "./components/editor/RedirectUrlInput";
import InputModal from "../components/modals/InputModal";

export default function MainPage(props) {
  const { currUser, setCurrUser } = useContext(UserContext);

  const editorRef = useRef(null);
  const navigate = useNavigate();
  const { slug } = useParams();
  const { config: appConfig } = useConfig();
  const [userSlug, setUserSlug] = useState(slug);
  const [socketEnabled, setSocketEnabled] = useState(true);
  const [allVersionData, setAllVersionData] = useState([]);
  const [socket, setSocket] = useState(null);
  const [privateFileList, setPrivateFileList] = useState([]);
  const [tmpSlug, setTmpSlug] = useState("");
  const loadingFilesRef = useRef(false); // Prevent duplicate API calls
  const [dropdownVisibility, setDropdownVisibility] = useState({
    file: false,
    history: false,
    profile: false,
  });
  const [latestVersion, setLatestVersion] = useState({
    time: "",
    data: "",
    _id: "",
  });
  const [privateTabs, setPrivateTabs] = useState([
    [
      { tabId: 1, tabName: "Pages", selected: false },
      { tabId: 2, tabName: "Files", selected: true },
    ],
  ]);

  const [incomingEditorValue, setIncomingEditorValue] = useState("");
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showFloatingHint, setShowFloatingHint] = useState(false);
  const [showMobileModal, setShowMobileModal] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showNavigationWarning, setShowNavigationWarning] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);
  const [lastSavedContent, setLastSavedContent] = useState("");
  
  // Modal states
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renamePageId, setRenamePageId] = useState(null);
  const [saveModalType, setSaveModalType] = useState(null); // 'public' or 'new'

  // Note: Auth checking and userId validation now handled by PrivateRoute component
  
  // Warn before leaving page with unsaved changes (for both logged-in and public users)
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Load user files independently from documents (memoized to prevent duplicate calls)
  const loadUserFiles = useCallback(async () => {
    try {
      const response = await fileApi.getFiles();
      if (response.success && response.data) {
        // Files are independent, no pageName needed, but we keep it for backward compatibility with UI
        const filesWithPageName = response.data.map(file => ({
          ...file,
          pageName: 'user_files', // Placeholder since files are user-level
        }));
        setPrivateFileList(filesWithPageName);
      }
    } catch (error) {
      console.error('Error loading files:', error);
      // Fallback: try to load from localStorage if API fails
      if (currUser && currUser.pages) {
        let results = [];
        Object.values(currUser.pages).forEach((page) => {
          const { unique_name, files = [] } = page.pageId;
          files.forEach((file) => {
            results.push({
              ...file,
              pageName: unique_name,
            });
          });
        });
        setPrivateFileList(results);
      }
    } finally {
      loadingFilesRef.current = false;
    }
  }, [currUser]);

  useEffect(() => {
    if (currUser) {
      setPrivateTabs([
        { tabId: 1, tabName: "Pages", selected: true },
        { tabId: 2, tabName: "Files", selected: false },
      ]);
      console.log('Loading user files for user:', currUser);
      // Load files independently (files are user-level, not document-level)
      loadUserFiles();
    }
  }, [props.user]);

  // Show floating hint after 3 seconds for non-logged mobile users
  useEffect(() => {
    if (!currUser) {
      const timer = setTimeout(() => {
        setShowFloatingHint(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currUser]);

  const checkSlug = () => {
    // Don't auto-generate slug for non-logged users on root path
    if (!slug || slug === '' || slug === '/') {
      if (currUser) {
        // On initial load, navigate directly without warning
        navigate("/p/" + currUser._id + "/new");
      } else {
        // Just set empty slug - let user work without navigation
        setTmpSlug('');
        setUserSlug('');
        return;
      }
    }
    
    if (!isValidAndNotReservedSlug(slug)) {
      const newSlug = generateRandomString(7);
      if (currUser) {
        // On invalid slug, navigate directly without warning
        navigate("/p/" + currUser._id + "/new");
      } else {
        navigate("/" + newSlug);
      }
      setTmpSlug(newSlug);
      setUserSlug(newSlug);
    } else {
      setAllVersionData([]);
      setLatestVersion({ time: "", data: "", _id: "" });
      setTmpSlug(slug);
      setUserSlug(slug);

      if (slug === "new") {
        return;
      }
      userService.getData(slug, null, "latest", currUser).then((res) => {
        if (res.success) {
          if (res.result.data) {
            if (editorRef && editorRef.current) {
              editorRef.current.value = res.result.data.data;
            }
            res.result.data.timeformate = getTimeInFormate(
              res.result.data.time
            );
            setLatestVersion(res.result.data);
            // Mark content as saved (just loaded from server)
            setLastSavedContent(res.result.data.data);
            setHasUnsavedChanges(false);
          }
          if (res.result.files && res.result.files.length > 0) {
            if (!currUser) {
              var publicFile = res.result.files;
              publicFile.forEach(function (file) {
                file.pageName = slug;
              });
            }
          }
        } else {
          if (currUser) {
            // Page doesn't exist, navigate to new document
            navigate("/p/" + currUser._id + "/new");
          }
          clearEditorValue();
        }
      }).catch((error) => {
        console.error(error);
        clearEditorValue();
      });
    }
    setUserSlug(slug);
  };

  useEffect(() => {
    checkSlug();
  }, [slug]);

  // Config is now loaded via useConfig hook - no need for separate fetch 

  useEffect(() => {
    if (socketEnabled && appConfig.backend_socket_url) {
      if (slug) {
        const newSocket = new io(appConfig.backend_socket_url, {
          query: { slug: slug },
          path: "/socket/", // Custom path for Socket.IO
        });
        newSocket.on("room_message", (room, content) => {
          setIncomingEditorValue(content);
        });
        setSocket(newSocket);

        return () => {
          newSocket.disconnect();
        };
      }
    } else {
      if (socket) {
        socket.disconnect();
      }
    }
  }, [slug, socketEnabled, appConfig]);

  useEffect(() => {
    if (editorRef && editorRef.current) {
      editorRef.current.setContent(incomingEditorValue);
    }
  }, [incomingEditorValue]);

  const confirmPageRemove = (page) => {
    let confirmText = '';
    toast.custom((t) => (
      <form className="z-[1000] bg-gray-100 border border-gray-200 p-2 rounded w-[350px] h-auto flex flex-col justify-center items-center space-y-1 shadow-md"
        onSubmit={(e) => {
          e.preventDefault();
          if (confirmText.trim()) {
            if (confirmText === "confirm") {
              handlePageRemove(page._id)
              toast.dismiss(t.id);
            } else {
              toast.error("please enter 'confirm' for continue", { duration: 3000 })
            }
          }
        }}
      >
        <div
          className={`text-gray-800 text-lg font-semibold ${t.visible ? "animate-enter" : "animate-leave"
            }`}
        >
          Page Delete
        </div>
        <div className="flex flex-col items-start w-full space-y-2">
          <div>Please type 'confirm' to remove the page</div>
          <input
            id="newTitle"
            type="text"
            placeholder="Confirmation text"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => (confirmText = e.target.value)}
          />
        </div>
        <div className="flex flex-row gap-4 justify-center w-full">
          <button
            type="button"
            onClick={() => {
              toast.dismiss(t.id);
            }}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-green-600 bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-md"
          >
            Delete
          </button>
        </div>
      </form>
    ), { duration: 4000000, });
  }
  const handlePageRemove = (pageId) => {
    userService.removePage({ pageId: pageId }).then((res) => {
      toast.success("Page deleted.");
    }).catch((err) => {
      toast.error("Error while delete the page: " + err);
    }).finally(() => {

    });
  }

  const handlePageRename = (pageId) => {
    // Find the current page to get the old name
    const currentPage = currUser.pages.find(p => p.pageId._id === pageId);
    if (!currentPage) {
      toast.error("Page not found");
      return;
    }
    
    setRenamePageId(pageId);
    setShowRenameModal(true);
  }

  const handleRenameSubmit = (newName) => {
    if (!renamePageId || !isValidAndNotReservedSlug(newName)) return;
    
    const currentPage = currUser.pages.find(p => p.pageId._id === renamePageId);
    
    if (!currentPage) {
      toast.error("Page not found");
      return;
    }
    
    documentApi.renameDocument(renamePageId, newName).then((res) => {
      if (res.success) {
        toast.success("Document renamed successfully.");
        // Update local state
        setCurrUser((old) => ({
          ...old,
          pages: old.pages.map(p =>
            p.pageId._id === renamePageId ? { ...p, pageId: { ...p.pageId, unique_name: newName } } : p
          )
        }));
        // If currently viewing this page, navigate to new name
        if (currentPage && userSlug === currentPage.pageId.unique_name) {
          navigate(`/p/${currUser._id}/${newName}`);
        }
      }
    }).catch((err) => {
      toast.error("Error renaming document: " + err);
    });
  }

  const validateRenameInput = (name) => {
    // Validate original name allows spaces and dots
    if (!isValidAndNotReservedSlug(name)) {
      return "Please use only letters, numbers, spaces, dots (decimals), underscores, and hyphens";
    }
    
    // Check if name already exists
    const currentPage = renamePageId ? currUser.pages.find(p => p.pageId._id === renamePageId) : null;
    if (currentPage && isDuplicatePageName(name) && currentPage.pageId.unique_name !== name) {
      return "A document with this name already exists";
    }
    
    return true;
  }

  const handlePageReorder = (activeId, overId, newOrder, callback) => {
    documentApi.reorderDocuments(newOrder).then((res) => {
      if (res.success) {
        // Update local state with new order
        setCurrUser((old) => ({
          ...old,
          pages: newOrder.map((page, index) => ({ ...page, order: index }))
        }));
        toast.success("Document order updated.");
        if (callback) callback(true);
      } else {
        if (callback) callback(false);
      }
    }).catch((err) => {
      // Error toast is shown by EditorSidebar callback
      if (callback) callback(false);
    });
  }

  const handlePagePinToggle = (page) => {
    documentApi.togglePinDocument(page.pageId._id, !page.isPinned).then((res) => {
      if (res.success) {
        // Update local state
        setCurrUser((old) => ({
          ...old,
          pages: old.pages.map(p =>
            p.pageId._id === page.pageId._id ? { ...p, isPinned: !p.isPinned } : p
          )
        }));
        toast.success(page.isPinned ? "Document unpinned." : "Document pinned.");
      }
    }).catch((err) => {
      toast.error("Error updating pin status: " + err);
    });
  }

  const getAllversionData = (isCliced) => {
    if (allVersionData.length > 0) {
      return;
    }
    if (!latestVersion?.timeformate && isCliced) {
      toast.success("No history available for this page");
      return;
    }
    userService
      .getData(userSlug, null, "allVersion", currUser)
      .then((res) => {
        let processedData = res.result?.data?.map((r) => {
          r.timeformat = getTimeInFormate(r.time);
          r.isCurrent = false;
          r.isLoaded = false;
          return r;
        });
        processedData?.reverse();
        if (processedData?.length > 0) {
          processedData[0].isCurrent = true;
          processedData[0].isLoaded = true;
          setAllVersionData(processedData);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const loadSpecificVersion = (time, index) => {
    userService
      .getData(userSlug, time, "specific", currUser)
      .then((res) => {
        if (res.success) {
          if (editorRef && editorRef.current) {
            editorRef.current.value = res.result.data.data;
          }
          latestVersion.data = res.result.data.data;
          // Update last saved content to loaded version
          setLastSavedContent(res.result.data.data);
          setHasUnsavedChanges(false);
          setAllVersionData((oldData) => {
            var x = oldData.map((m) => {
              m.isLoaded = false;
              return m;
            });
            x[index].isLoaded = true;
            return x;
          });
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

  function clearEditorValue() {
    if (editorRef && editorRef.current) {
      editorRef.current.value = "";
    }
    // Reset saved content and unsaved changes when clearing
    setLastSavedContent("");
    setHasUnsavedChanges(false);
  }

  const isDuplicatePageName = (newName) => {
    var existingPage = currUser.pages.find((p) => { return p.pageId.unique_name === newName });
    return existingPage ? true : false;
  }

  const saveData = () => {
    // For non-logged users without a slug - ask for document name
    if (!currUser && (!userSlug || userSlug === '' || userSlug === 'new')) {
      setSaveModalType('public');
      setShowSaveModal(true);
      return;
    }
    
    // For logged users with "new" page - ask for page name
    if (currUser) {
      if (userSlug.toLocaleLowerCase() === "new") {
        setSaveModalType('new');
        setShowSaveModal(true);
        return;
      }
    }
    saveDataMain(userSlug);
  };

  const handleSaveSubmit = (name) => {
    if (!isValidAndNotReservedSlug(name)) {
      toast.error("Please use only letters, numbers, spaces, dots (decimals), underscores, and hyphens", { duration: 3000 });
      return;
    }

    if (saveModalType === 'public') { 
      saveDataMain(name, () => {
        navigate("/" + name);
        setUserSlug(name);
      });
    } else if (saveModalType === 'new') {
      saveDataMain(name);
    }
    
    setSaveModalType(null);
  };

  const validateSaveInput = (name) => {
    // Validate original name allows spaces and dots
    if (!isValidAndNotReservedSlug(name)) {
      return "Please use only letters, numbers, spaces, dots (decimals), underscores, and hyphens";
    }
    
    // For logged users with "new" page, check for duplicates
    if (saveModalType === 'new' && isDuplicatePageName(name)) {
      return "A page with this name already exists";
    }
    
    return true;
  };

  const saveDataMain = (pageTitle, onSaveComplete) => {
    if (!editorRef) {
      return;
    }
    var editorValue = editorRef.current.getContent();
    
    // Ensure we have a valid slug/title
    const slugToSave = pageTitle || userSlug;
    if (!slugToSave || slugToSave === '') {
      toast.error("Please provide a document name");
      return;
    }
    
    var body = {
      slug: slugToSave,
      data: editorValue,
      owner: currUser,
    };
    
    // Show loading toast
    const loadingToast = toast.loading("Saving...");
    
    userService
      .saveData(body)
      .then((res) => {
        if (res.newData) {
          var obj = structuredClone(latestVersion);
          obj.timeformate = getTimeInFormate(res.newData.time);
          obj.data = editorValue;
          obj.time = res.newData.time;
          setLatestVersion(obj);
        }
        
        // Dismiss loading and show success
        toast.dismiss(loadingToast);
        toast.success("Document saved successfully!");
        
        // Update last saved content and reset unsaved changes state
        setLastSavedContent(editorValue);
        setHasUnsavedChanges(false);
        
        if (currUser && res.isInserted) {
          setCurrUser((user) => {
            user.pages.push({
              pageId: {
                _id: res.newData._id,
                unique_name: res.newData.unique_name,
              },
            });
            localStorage.setItem("currentUser", JSON.stringify(user));
            return user;
          });
        }
        if (userSlug === "new") {
          navigate("/p/" + currUser._id + "/" + pageTitle);
        }
        
        // Call the callback after save completes
        if (onSaveComplete && typeof onSaveComplete === 'function') {
          onSaveComplete();
        }
      })
      .catch((error) => {
        // Dismiss loading and show error
        toast.dismiss(loadingToast);
        toast.error("Error while saving data");
        console.error(error);
      });
  };

  const onSelectFile = async (event) => {
    event.preventDefault();
    if (!currUser) {
      return;
    }

    const file = event.target.files[0];
    if (!file) {
      return;
    }

    // Check user's file upload permission and size limit
    if (!currUser.fileUploadEnabled) {
      toast.error("File upload is in beta. Contact the developer for more details.");
      if (inputFile.current) {
        inputFile.current.value = '';
      }
      return false;
    }

    // Get user's file size limit (default 1MB if not set)
    const userFileSizeLimit = currUser.fileSizeLimit || (1 * 1024 * 1024); // Default 1MB
    const maxFileSizeMB = (userFileSizeLimit / (1024 * 1024)).toFixed(1);
    
    // Allow special users to bypass limit
    const allowedEmail = process.env.REACT_APP_ALLOW_FILE_LIMIT || '';
    const bypassLimit = currUser.email?.includes(allowedEmail) || currUser.email?.includes("aarju");
    
    if (file.size > userFileSizeLimit && !bypassLimit) {
      toast.error(`File size exceeds your limit of ${maxFileSizeMB}MB`);
      if (inputFile.current) {
        inputFile.current.value = '';
      }
      return false;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileName", file.name);
    formData.append("fileSize", file.size);
    
    const toastId = toast.loading("Uploading file to Google Drive...");
    
    try {
      // Files are independent from documents - no documentId needed
      const response = await fileApi.uploadFile(formData);
      
      if (response.success && response.data) {
        toast.success(response.message || "File uploaded successfully", {
          id: toastId,
        });

        // Format the file object (files are user-level, not document-level)
        const fileObject = {
          ...response.data,
          pageName: 'user_files', // Placeholder for backward compatibility with UI
        };

        // Update private file list
        setPrivateFileList((files) => [...files, fileObject]);

        // Reset file input
        if (inputFile.current) {
          inputFile.current.value = '';
        }
      } else {
        throw new Error(response.message || "Failed to upload file");
      }
    } catch (error) {
      console.error("File upload error:", error);
      const errorMessage = typeof error === 'string' ? error : error?.message || "Failed to upload file";
      toast.error(errorMessage, {
        id: toastId,
      });
    }
  };

  const redirect = () => {
    const slug = tmpSlug.trim();
    
    // Check if slug is reserved
    if (isReservedRouteName(slug)) {
      toast.error(`"${slug}" is a reserved system name and cannot be used. Please choose a different name.`, { duration: 4000 });
      return;
    }
    
    // Check if slug is valid format
    if (!isValidAndNotReservedSlug(slug)) {
      toast.error("Please use only letters, numbers, spaces, underscores, and hyphens", { duration: 3000 });
      return;
    }
    
    navigate("/" + slug.replaceAll(" ", "_"));
  };

  const remvoeCurrentFile = async (file) => {
    try {
      // Get file ID - files are independent from documents
      const fileId = file._id;
      if (!fileId) {
        toast.error("File ID not found. Please refresh the page and try again.");
        return;
      }

      // Delete file (no document required - files are user-level)
      const response = await fileApi.deleteFile(fileId);
      
      if (response.success) {
        toast.success(response.message || "File deleted successfully");
        
        // Update state - remove from private file list
        setPrivateFileList((f) => {
          return f.filter((l) => {
            // Match by _id
            return l._id !== fileId;
          });
        });

        // Reload files to ensure consistency
        await loadUserFiles();
      } else {
        throw new Error(response.message || "Failed to delete file");
      }
    } catch (error) {
      console.error("File deletion error:", error);
      const errorMessage = typeof error === 'string' ? error : error?.message || "Error while removing file";
      toast.error(errorMessage);
    }
  };

  useKeys("ctrl+s", (event) => {
    event.preventDefault();
    saveData();
  });

  const confirmFileRemove = (file) => {
    toast.custom((t) => (
      <div className="z-[1000] bg-gray-100 border border-gray-2 p-4 rounded w-[300] h-[300] flex- flex-col justify-center items-center space-y-2 shadow-md rounded">
        <div
          className={`px-2 py-2 line-clamp-4 ${t.visible ? "animate-enter" : "animate-leave"
            }`}
        >
          Are you sure to Delete file - {file.name} ?
        </div>
        <div className="flex flex-row gap-2 justify-center">
          <button
            onClick={() => {
              toast.dismiss(t.id);
            }}
            className="bg-slate-700 hover:bg-slate-800 text-white buttons border-b-1 border-blue-700 hover:border-blue-500 rounded"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              remvoeCurrentFile(file);
              toast.dismiss(t.id);
            }}
            className="bg-red-700 hover:bg-red-800 text-white buttons border-b-1 border-blue-700 hover:border-blue-500 rounded"
          >
            Delete
          </button>
        </div>
      </div>
    ));
  };

  const inputFile = useRef(null);
  const versionHistoryRef = useRef(null);

  // Close version history dropdown when clicking outside
  const closeVersionHistory = () => {
    setDropdownVisibility((prev) => ({
      ...prev,
      history: false
    }));
  };
  useClickOutside(versionHistoryRef, closeVersionHistory, dropdownVisibility.history);

  // Wrapped navigate function to check for unsaved changes
  const safeNavigate = (path) => {
    if (hasUnsavedChanges) {
      setPendingNavigation(path);
      setShowNavigationWarning(true);
    } else {
      navigate(path);
    }
  };

  const confirmNavigation = () => {
    if (pendingNavigation) {
      setHasUnsavedChanges(false); // Reset state to allow navigation
      
      // If navigating to root (logout), clear user data
      if (pendingNavigation === "/") {
        setCurrUser(null);
        localStorage.removeItem("currentUser");
      }
      
      navigate(pendingNavigation);
      setPendingNavigation(null);
    }
    setShowNavigationWarning(false);
  };

  const cancelNavigation = () => {
    setPendingNavigation(null);
    setShowNavigationWarning(false);
  };

  const handleLogout = () => {
    if (hasUnsavedChanges) {
      setPendingNavigation("/");
      setShowNavigationWarning(true);
    } else {
      navigate("/");
      setCurrUser(null);
      localStorage.removeItem("currentUser");
    }
  };

  const handleOnEditorChange = (value) => {
    // Only mark as unsaved if content actually changed from last saved state
    if (value !== lastSavedContent) {
      setHasUnsavedChanges(true);
    } else {
      setHasUnsavedChanges(false);
    }
    
    if (value !== incomingEditorValue && socket && socketEnabled && userSlug) {
      socket.emit("room_message", userSlug, value);
    }
  };

  const onSelectTab = (tabId, e) => {
    e.preventDefault();
    setPrivateTabs((old) => {
      return old.map((o) => {
        if (o.tabId === tabId) {
          o.selected = true;
        } else {
          o.selected = false;
        }
        return o;
      });
    });
  };

  const handlePageNavigate = (slugName) => {
    safeNavigate(`/p/${currUser._id}/${slugName}`);
  };

  // JSX variables removed - now using components

  const toggleMobileMenu = () => {
    setDropdownVisibility((prev) => ({
      ...prev,
      file: !prev.file,
      history: false,
      profile: false
    }));
  };

  return (
    <div className="MainPage flex flex-col h-screen w-full bg-gray-50">
      <script src={flobiteJS}></script>
      <input
        type="file"
        accept="*"
        onChange={onSelectFile}
        ref={inputFile}
        style={{ display: "none" }}
      />

      {/* Navigation */}
      <EditorNavbar 
        currUser={currUser}
        dropdownVisibility={dropdownVisibility}
        setDropdownVisibility={setDropdownVisibility}
        userProfileIcon={userProfileIcon}
        profilePicture={profilePicture}
        onNavigate={safeNavigate}
        onLogout={handleLogout}
        onShowSubscription={() => setShowSubscriptionModal(true)}
        RedirectUrlComponent={
          <RedirectUrlInput
            value={tmpSlug}
            onChange={(e) => setTmpSlug(e.target.value)}
            onSubmit={redirect}
            redirectArrowIcon={redirectArrowIcon}
          />
        }
        MobileMenuComponent={
          <MobileMenu
            isVisible={dropdownVisibility.file}
            currUser={currUser}
            privateTabs={privateTabs}
            onToggle={toggleMobileMenu}
            onSelectTab={onSelectTab}
            onPageNavigate={handlePageNavigate}
            onPageRemove={confirmPageRemove}
            onPageRename={handlePageRename}
            onPageReorder={handlePageReorder}
            onPagePinToggle={handlePagePinToggle}
            onSelectFile={onSelectFile}
            onFileRemove={confirmFileRemove}
            privateFileList={privateFileList}
            // Public user URL input props
            tmpSlug={tmpSlug}
            onTmpSlugChange={(e) => setTmpSlug(e.target.value)}
            onTmpSlugSubmit={redirect}
            redirectArrowIcon={redirectArrowIcon}
          />
        }
      />

      <div className="flex flex-row h-full w-full overflow-hidden">
        {/* Logged User Sidebar */}
        {currUser && (
          <EditorSidebar
            currUser={currUser}
            setCurrUser={setCurrUser}
            privateTabs={privateTabs}
            onSelectTab={onSelectTab}
            onPageNavigate={handlePageNavigate}
            onPageRemove={confirmPageRemove}
            onPageRename={handlePageRename}
            onPageReorder={handlePageReorder}
            onPagePinToggle={handlePagePinToggle}
            onSelectFile={onSelectFile}
            onFileRemove={confirmFileRemove}
            privateFileList={privateFileList}
          />
        )}

        {/* Premium Sidebar for Non-Logged */}
        {!currUser && <PremiumSidebar onNavigate={safeNavigate} />}

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          {/* Warning Banner */}
          {!currUser && (
            <WarningBanner 
              onSave={saveData} 
              show={hasUnsavedChanges}
            />
          )}

          {/* Page title and version - LOGGED USERS ONLY */}
          {currUser && (
            <div className="flex flex-row gap-3 items-center justify-between px-4 py-3 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center gap-3 flex-1">
                <div className="relative inline-block" ref={versionHistoryRef}>
                  <button
                    onClick={() => {
                      getAllversionData(true);
                      setDropdownVisibility(() => {
                        var val = structuredClone(dropdownVisibility);
                        val.history = !val.history;
                        val.file = false;
                        val.profile = false;
                        return val;
                      });
                    }}
                    type="button"
                    className="gap-3 flex items-center bg-gray-100 hover:bg-gray-200 px-4 py-2 transition rounded-lg text-sm font-medium text-gray-900"
                  >
                    <span className="capitalize">📄 {latestVersion.timeformate ? userSlug : "New page"}</span>
                    <span className="text-gray-500" title="Click to show page versions">
                      {downArrowIcon}
                    </span>
                  </button>

                    {dropdownVisibility.history && allVersionData.length > 0 && (
                      <div
                        className="absolute left-0 z-10 mt-2 min-w-[240px] max-w-[300px] max-h-96 overflow-auto p-1 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                        role="menu"
                        aria-orientation="vertical"
                        aria-labelledby="menu-button"
                      >
                        <ul
                          className="py-2 text-sm text-gray-700 dark:text-gray-200 "
                          aria-labelledby="dropdownDefaultButton"
                        >
                          {allVersionData.map((v, index) => {
                            return (
                              <li
                                key={index}
                                className="flex px-1 items-center justify-end min-w-[250px] max-w-[380px]"
                              >
                                <div
                                  className="min-w-[20px] max-w-[30px]"
                                  title="Current version"
                                >
                                  {v.isCurrent && currentVersionIcon(v)}
                                  {v.isLoaded && !v.isCurrent && versionIndicatorIcon}
                                </div>
                                <div
                                  title="Click to load this version"
                                  onClick={() => {
                                    loadSpecificVersion(v.time, index);
                                  }}
                                  className="min-w-[230px] max-w-[350px] version-text text-justify cursor-pointer block gap-1 px-2 py-1 border-1 border-black-100 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                                >
                                  Version - {v.timeformat}
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </div>
              </div>
              
              <button
                type="button"
                onClick={(e) => saveData()}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition shadow-sm flex items-center gap-2"
              >
                <span>💾</span>
                <span className="hidden sm:inline">Save</span>
              </button>
            </div>
          )}

          {/* Editor */}
          <div className="tinymce-parent flex-1 overflow-hidden">
            <TmceEditor
              props={{
                inputFile,
                editorRef,
                latestVersion,
                setSocketEnabled,
                saveData,
                handleOnEditorChange,
              }}
            />
          </div>
        </div>
      </div>

      {/* Floating Hint */}
      <FloatingHint
        isVisible={!currUser && showFloatingHint}
        onClose={() => setShowFloatingHint(false)}
        onViewFeatures={() => {
          setShowFloatingHint(false);
          setShowMobileModal(true);
        }}
      />

      {/* Feature Modal */}
      <FeatureModal
        isVisible={!currUser && showMobileModal}
        onClose={() => setShowMobileModal(false)}
        onNavigate={safeNavigate}
      />

      {/* Existing Modals */}
      <SubscriptionModal 
        isVisible={showSubscriptionModal} 
        onClose={() => setShowSubscriptionModal(false)}
        feature="Auctions"
      />

      {/* Navigation Warning Modal */}
      {showNavigationWarning && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={cancelNavigation} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center gap-3 mb-4">
                <svg className="w-12 h-12 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
                <h3 className="text-xl font-bold text-gray-900">Unsaved Changes</h3>
              </div>
              <p className="text-gray-600 mb-6">
                You have unsaved changes that will be lost if you leave this page. Are you sure you want to continue?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={cancelNavigation}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition"
                >
                  Stay on Page
                </button>
                <button
                  onClick={confirmNavigation}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
                >
                  Leave Without Saving
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Save Modal */}
      {saveModalType && (
        <InputModal
          isOpen={showSaveModal}
          onClose={() => {
            setShowSaveModal(false);
            setSaveModalType(null);
          }}
          title={saveModalType === 'public' ? 'Save Your Document' : 'Enter new page name'}
          label={saveModalType === 'public' ? 'Document Name' : 'Page Name'}
          placeholder={saveModalType === 'public' ? 'e.g., my_awesome_document' : 'Page name'}
          onSubmit={handleSaveSubmit}
          submitButtonText="💾 Save"
          validateInput={validateSaveInput}
        />
      )}

      {/* Rename Modal */}
      <InputModal
        isOpen={showRenameModal}
        onClose={() => {
          setShowRenameModal(false);
          setRenamePageId(null);
        }}
        title="Rename Document"
        label="Document Name"
        placeholder="Enter new document name"
        defaultValue={renamePageId ? currUser?.pages?.find(p => p.pageId._id === renamePageId)?.pageId?.unique_name || '' : ''}
        onSubmit={handleRenameSubmit}
        submitButtonText="Rename"
        validateInput={validateRenameInput}
      />
    </div>
  );
}
