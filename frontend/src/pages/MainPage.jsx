import React, { useContext, useEffect, useRef, useState } from "react";
import userService from "../services/userService";
import { json, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import flobiteJS from "flowbite/dist/flowbite.min.js";
import { io } from "socket.io-client";
import useKeys from "../hooks/keyKeys";
import {
  currentVersionIcon,
  versionIndicatorIcon,
  fileIcon,
  downloadIcon,
  removeIcon,
  fileAddIcon,
  downArrowIcon,
  pageIcon,
  pageListIcon,
  menuIcon,
  userProfileIcon,
  profilePicture,
  redirectArrowIcon,
} from "../assets/svgs";
import { UserContext } from "../context/UserContext";
import TmceEditor from "./TmceEditor";
import {
  generateRandomString,
  getPresizeFileName,
  getTimeInFormate,
  isValidSlug,
} from "../common/functions";
import { UserProfileModal } from "../common/Modals";

// Import new components
import EditorNavbar from "./components/editor/EditorNavbar";
import WarningBanner from "./components/editor/WarningBanner";
import PremiumSidebar from "./components/editor/PremiumSidebar";
import EditorSidebar from "./components/editor/EditorSidebar";
import MobileMenu from "./components/editor/MobileMenu";
import FloatingHint from "./components/editor/FloatingHint";
import FeatureModal from "./components/editor/FeatureModal";
import RedirectUrlInput from "./components/editor/RedirectUrlInput";

export default function MainPage(props) {
  const { currUser, setCurrUser } = useContext(UserContext);

  const editorRef = useRef(null);
  const navigate = useNavigate();
  const { slug, username } = useParams();

  const [appConfig, setAppConfig] = useState({});
  const [userSlug, setUserSlug] = useState(slug);
  const [socketEnabled, setSocketEnabled] = useState(true);
  const [allVersionData, setAllVersionData] = useState([]);
  const [socket, setSocket] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [privateFileList, setPrivateFileList] = useState([]);
  const [tmpSlug, setTmpSlug] = useState("");
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
  const [showUserProfileModal, setShowUserProfileModal] = useState(false);
  const [showFloatingHint, setShowFloatingHint] = useState(false);
  const [showMobileModal, setShowMobileModal] = useState(false);

  useEffect(() => {
    if (props.user) {
      setPrivateTabs([
        { tabId: 1, tabName: "Pages", selected: true },
        { tabId: 2, tabName: "Files", selected: false },
      ]);

      let results = [];
      Object.values(props.user.pages).forEach((page) => {
        const { _id, unique_name, files = [] } = page.pageId;
        files.forEach((file) => {
          results.push({
            ...file,
            pageName: unique_name,
          });
        });
      });
      setPrivateFileList(results);
    }
  }, []);

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
      if (props.user) {
        navigate("/p/" + props.user.username + "/new");
      } else {
        // Just set empty slug - let user work without navigation
        setTmpSlug('');
        setUserSlug('');
        return;
      }
    }
    
    if (!isValidSlug(slug)) {
      const newSlug = generateRandomString(7);
      if (props.user) {
        navigate("/p/" + props.user.username + "/new");
      } else {
        navigate("/" + newSlug);
      }
      setTmpSlug(newSlug);
      setUserSlug(newSlug);
    } else {
      setAllVersionData([]);
      setFileList([]);
      setLatestVersion({ time: "", data: "", _id: "" });
      setTmpSlug(slug);
      setUserSlug(slug);

      if (slug == "new") {
        return;
      }
      userService.getData(slug, null, "latest", props.user).then((res) => {
        if (res.success) {
          if (res.result.data) {
            if (editorRef && editorRef.current) {
              editorRef.current.value = res.result.data.data;
            }
            res.result.data.timeformate = getTimeInFormate(
              res.result.data.time
            );
            setLatestVersion(res.result.data);
          }
          if (res.result.files && res.result.files.length > 0) {
            if (!currUser) {
              var publicFile = res.result.files;
              publicFile.forEach(function (file) {
                file.pageName = slug;
              });
              setFileList(publicFile);
            }
          } else {
            setFileList([]);
          }
        } else {
          if (props.user) {
            navigate("/p/" + props.user.username + "/new");
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

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch('/config.json');
        const config = await res.json();
        setAppConfig(config);
      } catch (error) {
        console.error("Error fetching config:", error);
      }
    };
    fetchConfig();
  }, []); 

  useEffect(() => {
    if (socketEnabled && appConfig.backend_socket_url) {
      if (slug) {
        const socket = new io(appConfig.backend_socket_url, {
          query: { slug: slug },
          path: "/socket/", // Custom path for Socket.IO
        });
        socket.on("room_message", (room, content) => {
          setIncomingEditorValue(content);
        });
        setSocket(socket);

        return () => {
          socket.disconnect();
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
            if (confirmText == "confirm") {
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

  const getAllversionData = (isCliced) => {
    if (allVersionData.length > 0) {
      return;
    }
    if (!latestVersion?.timeformate && isCliced) {
      toast.success("No history available for this page");
      return;
    }
    userService
      .getData(userSlug, null, "allVersion", props.user)
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
      .getData(userSlug, time, "specific", props.user)
      .then((res) => {
        if (res.success) {
          if (editorRef && editorRef.current) {
            editorRef.current.value = res.result.data.data;
          }
          latestVersion.data = res.result.data.data;
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
    setFileList([]);
  }

  const validateNewPageTitle = (newTitle) => {
    let reservedPageTitle = ["new", "auth", "p", "api", "socket", "game", "games"];
    if (reservedPageTitle.includes(newTitle.toLowerCase())) {
      return false;
    }
    if (!isValidSlug(newTitle)) {
      return true
    }
    return true;
  };

  const isDuplicatePageName = (newName) => {
    var existingPage = currUser.pages.find((p) => { return p.pageId.unique_name == newName });
    return existingPage ? true : false;
  }

  const saveData = () => {
    // For non-logged users without a slug - ask for document name
    if (!props.user && (!userSlug || userSlug === '' || userSlug === 'new')) {
      let newSlug = "";
      toast.custom((t) => (
        <div className="z-[1000] bg-white border border-gray-200 p-6 rounded-xl w-[90%] max-w-md shadow-2xl">
          <div className={`text-gray-800 text-xl font-bold mb-4 ${t.visible ? "animate-enter" : "animate-leave"}`}>
            Save Your Document
          </div>
          <form onSubmit={(e) => {
            e.preventDefault();
            newSlug = newSlug.trim();
            if (newSlug) {
              newSlug = newSlug.replaceAll(" ", "_");
              if (isValidSlug(newSlug)) {
                toast.dismiss(t.id);
                // Pass callback to navigate after save
                saveDataMain(newSlug, () => {
                  navigate("/" + newSlug);
                  setUserSlug(newSlug);
                });
              } else {
                toast.error("Please use only letters, numbers, and underscores");
              }
            }
          }}
            className="flex flex-col gap-4">
            <div className="flex flex-col items-start w-full space-y-2">
              <label className="text-sm font-medium text-gray-700 text-left">Document Name</label>
              <input
                id="newDocName"
                type="text"
                placeholder="e.g., my_awesome_document"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => (newSlug = e.target.value)}
                autoFocus
              />
              <p className="text-xs text-gray-500">This will be your document's URL</p>
            </div>
            <div className="flex flex-row gap-3 justify-end w-full">
              <button
                type="button"
                onClick={() => {
                  toast.dismiss(t.id);
                }}
                className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
              >
                💾 Save
              </button>
            </div>
          </form>
        </div>
      ), { duration: 400000 });
      return;
    }
    
    // For logged users with "new" page - ask for page name
    if (props.user) {
      if (userSlug.toLocaleLowerCase() == "new") {
        let newTitle = "";
        toast.custom((t) => (
          <div className="z-[1000] bg-white border border-gray-200 p-6 rounded-xl w-[90%] max-w-md shadow-2xl">
            <div className={`text-gray-800 text-xl font-bold mb-4 ${t.visible ? "animate-enter" : "animate-leave"}`}>
              Enter new page name
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              newTitle = newTitle.trim()
              if (newTitle) {
                newTitle = newTitle.replaceAll(" ", "_");
                if (validateNewPageTitle(newTitle)) {
                  if (!isDuplicatePageName(newTitle)) {
                    saveDataMain(newTitle);
                    toast.dismiss(t.id);
                  } else {
                    toast.error("Page already exist, create page with new name");
                  }
                }
              }
            }}
              className="flex flex-col gap-4">
              <div className="flex flex-col items-start w-full space-y-2">
                <label className="text-sm font-medium text-gray-700 text-left">Page Name</label>
                <input
                  id="newTitle"
                  type="text"
                  placeholder="Page name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => (newTitle = e.target.value)}
                  autoFocus
                />
              </div>
              <div className="flex flex-row gap-3 justify-end w-full">
                <button
                  type="button"
                  onClick={() => {
                    toast.dismiss(t.id);
                  }}
                  className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
                >
                  💾 Save
                </button>
              </div>
            </form>
          </div>
        ), { duration: 400000 });
        return;
      }
    }
    saveDataMain(userSlug);
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
      owner: props.user,
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
        if (userSlug == "new") {
          navigate("/p/" + username + "/" + pageTitle);
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
    let fileSlug = userSlug;
    if (fileSlug == "new") {
      if (props.user.pages.length == 0) {
        toast.error("Please create a page first to save a file.");
        return;
      } else {
        fileSlug = props.user.pages[0].pageId.unique_name;
      }
    }

    const file = event.target.files[0];
    if (file.size > 20e6 && !userSlug.includes("aarju")) {
      toast.error("Please upload a file smaller than 10 MB");
      return false;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileName", file.name);
    formData.append("fileSize", file.size * 8);
    formData.append("slug", fileSlug);
    const toastId = toast.loading("Uploading file server...");
    userService.saveFile(formData).then((res) => {
      toast.success(res.message, {
        id: toastId,
      });
      res.result.pageName = fileSlug;

      setPrivateFileList((file) => [...file, res.result]);
      var localUser = JSON.parse(localStorage.getItem("currentUser"));
      localUser.pages.map((page) => {
        if (page.pageId.unique_name == fileSlug) {
          page.pageId.files.push(res.result);
        }
        return page;
      });
      localStorage.setItem("currentUser", JSON.stringify(localUser));

    }).catch((error) => {
      console.error(error);
      toast.error(error, {
        id: toastId,
      });
    });
  };

  const redirect = () => {
    navigate("/" + tmpSlug);
  };

  const remvoeCurrentFile = (file) => {
    userService
      .removeFile({ slug: file.pageName, file, currUser })
      .then((res) => {
        toast.success(res.message);
        if (currUser) {
          var currentUser = JSON.parse(localStorage.getItem("currentUser"));
          const updatedPages = currentUser.pages.map((page) => {
            const updatedFiles = page.pageId.files.filter(
              (fo) => fo._id !== file._id
            );
            return {
              ...page,
              pageId: {
                ...page.pageId,
                files: updatedFiles,
              },
            };
          });
          const updatedUser = {
            ...currentUser,
            pages: updatedPages,
          };
          localStorage.setItem("currentUser", JSON.stringify(updatedUser));
          setPrivateFileList((f) => {
            const t = f.filter((l) => {
              return l.key != file.key;
            });
            return t;
          });
        } else {
          setFileList((list) => {
            const t = list.filter((l) => {
              return l.key != file.key;
            });
            return t;
          });
        }
      })
      .catch((e) => {
        console.error(e);
        toast.error("Error while removing file : " + e);
      });
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

  const handleLogout = () => {
    navigate("/");
    setCurrUser(null);
    localStorage.removeItem("currentUser");
  };

  const handleOnEditorChange = (value) => {
    if (value != incomingEditorValue && socket && socketEnabled && userSlug) {
      socket.emit("room_message", userSlug, value);
    }
  };

  const onSelectTab = (tabId, e) => {
    e.preventDefault();
    setPrivateTabs((old) => {
      return old.map((o) => {
        if (o.tabId == tabId) {
          o.selected = true;
        } else {
          o.selected = false;
        }
        return o;
      });
    });
  };

  const handlePageNavigate = (slugName) => {
    navigate("/p/" + username + "/" + slugName);
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
    <div className="MainPage flex flex-col h-full w-full overflow-hidden bg-gray-50">
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
        username={username}
        dropdownVisibility={dropdownVisibility}
        setDropdownVisibility={setDropdownVisibility}
        userProfileIcon={userProfileIcon}
        profilePicture={profilePicture}
        onNavigate={navigate}
        onLogout={handleLogout}
        onShowUserProfile={() => setShowUserProfileModal(true)}
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
            onSelectFile={onSelectFile}
            onFileRemove={confirmFileRemove}
            privateFileList={privateFileList}
          />
        }
      />

      <div className="flex flex-row h-full w-full overflow-hidden">
        {/* Logged User Sidebar */}
        {currUser && (
          <EditorSidebar
            currUser={currUser}
            privateTabs={privateTabs}
            onSelectTab={onSelectTab}
            onPageNavigate={handlePageNavigate}
            onPageRemove={confirmPageRemove}
            onSelectFile={onSelectFile}
            onFileRemove={confirmFileRemove}
            privateFileList={privateFileList}
          />
        )}

        {/* Premium Sidebar for Non-Logged */}
        {!currUser && <PremiumSidebar onNavigate={navigate} />}

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          {/* Warning Banner */}
          {!currUser && <WarningBanner onSave={saveData} />}

          {/* Page title and version - LOGGED USERS ONLY */}
          {currUser && (
            <div className="flex flex-row gap-3 items-center justify-between px-4 py-3 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center gap-3 flex-1">
                <div className="relative inline-block">
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
        onNavigate={navigate}
      />

      {/* Existing Modals */}
      {showUserProfileModal && <UserProfileModal currUser={currUser} setCurrUser={setCurrUser} setShowUserProfileModal={setShowUserProfileModal} />}
    </div>
  );
}
