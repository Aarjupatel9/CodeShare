import React, { useContext, useEffect, useRef, useState } from "react";
import userService from "../services/userService";
import { useNavigate, useParams } from "react-router-dom";
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
import { HelpMoedal, UserProfileModal } from "../common/Modals";

var SOCKET_ADDRESS = process.env.REACT_APP_SOCKET_ADDRESS;

export default function MainPage(props) {
  const { currUser, setCurrUser } = useContext(UserContext);

  const editorRef = useRef(null);
  const navigate = useNavigate();
  const { slug, username } = useParams();

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
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showUserProfileModal, setShowUserProfileModal] = useState(false);

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

  const checkSlug = () => {
    if (!slug || !isValidSlug(slug)) {
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
    if (socketEnabled) {
      if (slug) {
        const socket = new io(SOCKET_ADDRESS, {
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
  }, [slug, socketEnabled]);

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
    if (props.user) {
      if (userSlug.toLocaleLowerCase() == "new") {
        let newTitle = "";
        toast.custom((t) => (
          <div className="z-[1000] bg-gray-100 border border-gray-200 p-6 rounded w-[350px] h-auto flex flex-col justify-center items-center space-y-4 shadow-md">
            <div className={`text-gray-800 text-lg font-semibold normal-case ${t.visible ? "animate-enter" : "animate-leave"}`}>
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
              className="flex flex-col gap-2">
              <div className="flex flex-col items-start w-full space-y-2">
                <input
                  id="newTitle"
                  type="text"
                  placeholder="Page name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => (newTitle = e.target.value)}
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
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        ), { duration: 400000 });
      } else {
        saveDataMain(userSlug);
      }
    } else {
      saveDataMain(userSlug);
    }
  };

  const saveDataMain = (pageTitle) => {
    if (!editorRef) {
      return;
    }
    var editorValue = editorRef.current.getContent();
    var body = {
      slug: pageTitle,
      data: editorValue,
      owner: props.user,
    };
    var dataSavePromise = userService
      .saveData(body)
      .then((res) => {
        if (res.newData) {
          var obj = structuredClone(latestVersion);
          obj.timeformate = getTimeInFormate(res.newData.time);
          obj.data = editorValue;
          obj.time = res.newData.time;
          setLatestVersion(obj);
        }
        toast.success("Saved");
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
      })
      .catch((error) => {
        toast.error("error while saving data");
        console.error(error);
      });

    toast.promise(
      dataSavePromise,
      {
        loading: "Saving...",
        success: (data) => "",
        error: (err) => "",
      },
      {
        success: {
          duration: 1,
        },
        error: {
          duration: 1,
        },
      }
    );
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
    if (value != incomingEditorValue) {
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


  const loginButtonView = (<div className="ml-auto mr-1">
    <div
      onClick={!currUser ? () => { navigate("/auth/login"); } : () => {
        setDropdownVisibility(() => {
          var val = structuredClone(dropdownVisibility);
          val.file = false;
          val.history = false;
          val.profile = !val.profile;
          return val;
        });
      }}
      className={`${currUser ? "px-2 " : "py-1 bg-slate-500 hover:bg-slate-600 text-white px-4"} ml-auto text-sm font-bold rounded cursor-pointer`}
    >
      {currUser ? userProfileIcon : "Login"}
    </div>
    {currUser && dropdownVisibility.profile && (
      <div
        className="absolute right-0 z-10 mt-2 p-1 min-w-48 max-h-96 overflow-auto origin-top-right rounded-md bg-slate-300 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
        role="menu"
      >
        <ul
          className="py-2 text-sm text-gray-700 dark:text-gray-200 rounded font-bold"
        >
          <li className="flex px-1 items-center rounded">
            <div
              className="w-full version-text text-justify cursor-pointer block gap-1 px-2 py-1 border-1 border-black-100 hover:bg-slate-100 dark:hover:bg-gray-600 dark:hover:text-white flex items-center rounded"
              onClick={() => { setShowUserProfileModal(true) }}
            >
              <div className="w-12 h-12 flex-shrink-0">
                {profilePicture}
              </div>
              <span className="ml-2">{username}</span>
            </div>
          </li>

          <li className="flex items-center px-1">
            <div
              onClick={() => { navigate("/t/auction"); }}
              className="w-full version-text text-justify cursor-pointer block gap-1 px-2 py-1 border-1 border-black-100 hover:bg-slate-200 dark:hover:bg-gray-600 dark:hover:text-white rounded"
            >
              Auction
            </div>
          </li>

          <li className="flex items-center px-1">
            <div
              onClick={() => { setShowHelpModal(true); }}
              className="w-full version-text text-justify cursor-pointer block gap-1 px-2 py-1 border-1 border-black-100 hover:bg-slate-200 dark:hover:bg-gray-600 dark:hover:text-white rounded"
            >
              Help
            </div>
          </li>

          <li
            key="logout"
            className="flex px-1 items-center px-1"
          >
            <div
              title="Click to logout"
              onClick={() => {
                handleLogout();
              }}
              className="w-full version-text text-justify cursor-pointer block gap-1 px-2 py-1 border-1 border-black-100 hover:bg-slate-200 dark:hover:bg-gray-600 dark:hover:text-white rounded"
            >
              Logout
            </div>
          </li>
        </ul>

        {showHelpModal && (
          <HelpMoedal onClose={() => setShowHelpModal(false)} />
        )}
        {showUserProfileModal && (
          <UserProfileModal
            onClose={() => { setShowUserProfileModal(false) }}
            currUser={currUser}
            navigate={navigate}
          />
        )}
      </div>
    )}
  </div>)

  const mainListView = (
    <div className="md:hidden inline-block text-left">
      <button
        onClick={() => {
          setDropdownVisibility(() => {
            var val = structuredClone(dropdownVisibility);
            val.file = !val.file;
            val.history = false;
            val.profile = false;
            return val;
          });
        }}
        type="button"
        className="inline-flex md:hidden items-center justify-center rounded-md px-2 py-2 text-xs font-semibold shadow-sm ring-1 ring-inset ring-gray-300 text-dark bg-slate-100 hover:bg-slate-200 focus:outline-none focus:ring-gray-300 font-medium rounded-lg px-2 py-1 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-gray-800"
        aria-expanded="true"
        aria-haspopup="true"
      >
        {menuIcon}
      </button>

      {dropdownVisibility.file && (
        <div className="overflow-auto absolute left-0 z-10 mt-2 min-w-[240px] max-w-96 max-h-96 p-1 px-3 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div
            className="flex flex-col h-full text-sm text-gray-700 dark:text-gray-200 "
          >
            <div className="relative fixed top-0">
              <div className="flex flex-row h-[30px] w-full text-sm justify-center gap-2">
                {privateTabs.map((tab) => {
                  return (
                    <div
                      key={tab.tabId + generateRandomString(10)}
                      className={`${tab.selected ? "bg-slate-300" : "bg-slate-100"
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
                        onClick={(e) => handlePageNavigate("new")}
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
                              onClick={(e) => handlePageNavigate(page.pageId.unique_name)}
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
                              <div onClick={() => confirmPageRemove(page.pageId)}>
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
                              <div onClick={() => confirmFileRemove(file)}>
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
    </div>)

  const redirectView = (!currUser && <form onSubmit={(e) => { e.preventDefault(); redirect(); }} className="flex flex-row space-x-2 py-1 text-sm justify-center items-center gap-2 ">
    <input
      className="font-bold  mx-2 px-1 border-b border-blue-700 outline-none max-w-[130px]"
      onChange={(e) => { setTmpSlug(e.target.value); }}
      value={tmpSlug}
    />
    <button
      type="submit"
      className="px-2 text-sm font-bold bg-blue-200 hover:bg-blue-300 text-white border-b-1 border-blue-700 hover:border-blue-500 rounded"
    >
      {redirectArrowIcon}
    </button>
  </form>)

  return (
    <div className="MainPage flex flex-col h-full w-full p-1 gap-1">

      <script src={flobiteJS}></script>
      <input
        type="file"
        accept="*"
        onChange={onSelectFile}
        ref={inputFile}
        style={{ display: "none" }}
      />

      <header className="flex flex-row justify-between px-1 gap-1 flex-wrap">
        {currUser ? mainListView : <>
          <div className="md:hidden">
            {redirectView}
          </div>
        </>}
        {/* login logout */}
        <div className="md:hidden">
          {loginButtonView}
        </div>
      </header>

      <div className="flex flex-row h-full w-full">

        {currUser &&
          <aside
            id="separator-sidebar"
            className="hidden md:block lg:block SideBar z-40 h-screen h-full "
            aria-label="Sidebar"
          >
            <div className="flex flex-col h-full px-2 py-1 overflow-y-auto ">
              {/* tabs */}
              <div className="flex flex-row h-[30px] w-full text-sm justify-center gap-2 ">
                {privateTabs.map((tab, index) => {
                  return (
                    <div
                      key={tab.tabId + generateRandomString(10)}
                      className={`${tab.selected ? "bg-slate-300" : "bg-slate-100"
                        } h-full flex items-center justify-center w-full hover:bg-slate-400 text-black rounded`}
                      onClick={(e) => onSelectTab(tab.tabId, e)}
                    >
                      {tab.tabName}
                    </div>
                  );
                })}
              </div>

              {/* Tabs content */}
              {privateTabs[0].selected ? (<>
                <div className="pt-4 mt-4 space-y-2 font-medium text-sm border-t border-gray-200 dark:border-gray-700">
                  <div>
                    <label
                      onClick={(e) => handlePageNavigate("new")}
                      className="custom-file-upload gap-2 cursor-pointer flex flex-row justify-around items-center p-2 text-gray-900 transition duration-75 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white group"
                    >
                      {pageListIcon}
                      Create new page
                    </label>
                  </div>
                </div>

                {/* File List functionality */}
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
                            onClick={(e) =>
                              handlePageNavigate(page.pageId.unique_name)
                            }
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
                            <div onClick={() => confirmPageRemove(page.pageId)}>
                              {removeIcon}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                </div>
              </>
              ) : (<>
                <div className="pt-4 mt-4 space-y-2 font-medium text-sm border-t border-gray-200 dark:border-gray-700">
                  <div>
                    <label className="custom-file-upload gap-2 cursor-pointer flex flex-row justify-around items-center p-2 text-gray-900 transition duration-75 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white group">
                      <input type="file" accept="*" onChange={onSelectFile} />
                      {fileAddIcon}
                      Select to Upload Files
                    </label>
                  </div>
                </div>

                {/* File List functionality */}
                <div className="pt-4 mt-4 space-y-2 font-medium border-t border-gray-200 dark:border-gray-700">
                  {privateFileList.map((file, index) => {
                    return (
                      <li
                        key={index}
                        className="text-xs w-full max-w-full flex flex-row items-center gap-1 justify-between border-blue-300 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white"
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
                          <div onClick={() => confirmFileRemove(file)}>
                            {removeIcon}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </div>
              </>
              )}
            </div>
          </aside>
        }
        <div className="MainArea sm:size-full text-xs md:text:sm p-1 md:p-1 gap-2">

          {/* page title and version */}
          <div className="flex flex-row gap-2 items-center">
            {/* version and page name */}
            <div className="flex flex-row gap-2 w-full">

              <div className="flex flex-row gap-3 items-center justify-between ">
                <div className="relative inline-block text-left cursor-pointer">
                  <div onClick={() => {
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
                    className="gap-2 flex items-center justify-between rounded-md text-xs font-semibold shadow-sm  text-dark bg-slate-200 focus:outline-none focus:ring-gray-300 font-medium rounded-lg px-1 py-1 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-gray-800"
                  >
                    <div className="px-1 py-1 capitalize">
                      {latestVersion.timeformate ? userSlug : "New page"}
                    </div>
                    <div
                      title="Click to show page versions"
                      className="flex items-center justify-between px-1 py-1 cursor-pointer hover:bg-slate-200 "
                    >
                      {downArrowIcon}
                    </div>
                  </div>

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

              <div
              type="button"
                onClick={(e) => saveData()}
                className="cursor-pointer text-dark px-2 py-1 text-sm bg-blue-200 hover:bg-blue-300 rounded"
              >
                Save
              </div>
            </div>
            <div className="sm:hidden md:block lg:block">
              {redirectView}
            </div>
            <div className="sm:hidden md:block lg:block">
              {loginButtonView}
            </div>
          </div>

          {/* code area */}
          <div className="MainTextArea text-sm relative">
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
    </div >
  );
}
