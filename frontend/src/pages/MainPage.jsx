import React, { useEffect, useRef, useState } from "react";
import userService from "../services/userService";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Editor } from '@tinymce/tinymce-react';
import flobiteJS from "flowbite/dist/flowbite.min.js";
import { io } from 'socket.io-client';

import {
  currentVersionIcon,
  versionIndicatorIcon,
  fileIcon,
  downloadIcon,
  removeIcon,
  fileAddIcon,
  downArrowIcon,
  socketIcon,
} from "../assets/svgs";

var tinyApiKey = process.env.REACT_APP_TINYMCE_KEY;
var SOCKET_ADDRESS = process.env.REACT_APP_SOCKET_ADDRESS;

export default function MainPage() {
  var MAX_FILE_NAME_VISIBLE = 20;
  const editorRef = useRef(null);
  const navigate = useNavigate();
  const { slug } = useParams();

  const [userSlug, setUserSlug] = useState(slug);
  const [isRedirectFocused, setIsRedirectFocused] = useState(true);
  const [latestVersion, setLatestVersion] = useState({
    time: "",
    data: "",
    _id: "",
  });
  const [socketEnabled, setSocketEnabled] = useState(true);
  const [allVersionData, setAllVersionData] = useState([]);
  const [socket, setSocket] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [tmpSlug, setTmpSlug] = useState("");
  const [dropdownVisibility, setDropdownVisibility] = useState({
    file: false,
    history: false,
  });

  const [incomingEditorValue, setIncomingEditorValue] = useState("");

  const isClipBoardAvailable = navigator?.clipboard ? true : false;

  useEffect(() => {
    if (!slug) {
      const newSlug = generateRandomString(7);
      navigate("/" + newSlug);
      setTmpSlug(newSlug);
      setUserSlug(slug)
    } else {

      setAllVersionData([]);
      setFileList([]);
      setLatestVersion({ time: "", data: "", _id: "" });
      setTmpSlug(slug);
      setUserSlug(slug)

      userService
        .getData(slug, null, "latest")
        .then((res) => {
          if (res.success) {
            if (editorRef && editorRef.current) {
              editorRef.current.value = res.result.data.data;
            }
            res.result.data.timeformate = getTimeInFormate(
              res.result.data.time
            );
            setLatestVersion(res.result.data);

            if (res.result.files && res.result.files.length > 0) {
              setFileList(res.result.files);
            } else {
              setFileList([]);
            }
          } else {
            clearEditorValue();
          }
        })
        .catch((error) => {
          console.error(error);
          clearEditorValue();
        });
    }
    setUserSlug(slug)
  }, [slug]);

  useEffect(() => {
    if (socketEnabled) {
      if (slug) {
        const socket = new io(SOCKET_ADDRESS, {
          query: "slug=" + slug
        });

        socket.on('room_message', (room, content) => {
          setIncomingEditorValue(content);
        })
        setSocket(socket);

        return () => {
          socket.disconnect();
        }
      }
    } else {
      if (socket) {
        socket.disconnect()
      }
    }
  }, [slug, socketEnabled])

  useEffect(() => {
    if (editorRef && editorRef.current) {
      editorRef.current.setContent(incomingEditorValue);
    }
  }, [incomingEditorValue])

  const getAllversionData = (isCliced) => {
    if (allVersionData.length > 0) {
      return;
    }
    if (!latestVersion?.timeformate && isCliced) {
      toast.success("No history available for this page");
      return;
    }
    userService
      .getData(userSlug, null, "allVersion")
      .then((res) => {

        let processedData = res.result?.data?.map((r) => {
          r.timeformat = getTimeInFormate(r.time);
          r.isCurrent = false;
          r.isLoaded = false;
          return r;
        });
        processedData.reverse();
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
      .getData(userSlug, time, "specific")
      .then((res) => {

        if (res.success) {
          if (editorRef && editorRef.current) { editorRef.current.value = res.result.data.data; }
          latestVersion.data = res.result.data.data
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

  function getTimeInFormate(time) {
    let t = new Date(time);

    // Pad each component with leading zeros if necessary
    const year = t.getFullYear();
    const month = (t.getMonth() + 1).toString().padStart(2, "0"); // Months are 0-based, so add 1
    const day = t.getDate().toString().padStart(2, "0");
    const hours = t.getHours().toString().padStart(2, "0");
    const minutes = t.getMinutes().toString().padStart(2, "0");
    const seconds = t.getSeconds().toString().padStart(2, "0");

    // Construct the formatted time string
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  const saveData = () => {
    if (!editorRef) {
      return;
    }
    var editorValue = editorRef.current.getContent()
    var body = {
      slug: userSlug,
      data: editorValue,
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
        toast.success("data saved");
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
    const file = event.target.files[0];
    if (file.size > 10e6 && !userSlug.includes("aarju")) {
      window.alert("Please upload a file smaller than 10 MB");
      return false;
    }
    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileName", file.name);
    formData.append("slug", userSlug);

    const imageUploadPromise = userService
      .saveFile(formData)
      .then((res) => {
        toast.success(res.message);
        setFileList((list) => [...list, res.result]);
      })
      .catch((error) => {
        console.error(error);
        toast.error(error.toString());
      });
    toast.promise(
      imageUploadPromise,
      {
        loading: "Uploading file server..",
        success: (data) => `File saved successfully`,
        error: (err) => `Something gone wrong}`,
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

  const redirect = () => {
    navigate("/" + tmpSlug);
  };

  function getPresizeFileName(name) {
    if (name.length > MAX_FILE_NAME_VISIBLE) {
      return name.slice(0, MAX_FILE_NAME_VISIBLE) + "...";
    }
    return name;
  }

  function generateRandomString(length) {
    const characters =
      "abcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return result;
  }
  const remvoeCurrentFile = (file) => {
    userService
      .removeFile({ userSlug, file })
      .then((res) => {
        toast.success(res.message);
        setFileList((list) => {
          const t = list.filter((l) => {
            return l.key != file.key;
          });
          return t;
        });
      })
      .catch((e) => {
        toast.error("Error while removing file : ", e);
      });
  };

  const copyToClipBoard = () => {
    if (!editorRef) {
      return
    }
    navigator?.clipboard?.writeText(editorRef.current.value).then(
      () => {
        toast.success("Content copied to clipboard");
      },
      () => {
        toast.error("Failed to copy");
      }
    );
  };

  useKey("ctrl+s", (event) => {
    event.preventDefault();
    saveData();
  });
  useKey("ctrl+c", (event) => {
    if (isClipBoardAvailable) {
      copyToClipBoard();
    }
  });
  useKey("Enter", (event) => {
    if (isRedirectFocused) {
      redirect();
    }
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

  return (
    <div className="MainPage">
      <script src={flobiteJS}></script>
      <aside
        id="separator-sidebar"
        className="hidden md:block lg:block SideBar z-40  h-screen "
        aria-label="Sidebar"
      >
        <div className="h-full px-2 py-4 overflow-y-auto bg-gray-50 dark:bg-gray-800">
          {/* redirect */}
          <div
            onFocus={() => {
              setIsRedirectFocused(true);
            }}
            onBlur={() => {
              setIsRedirectFocused(false);
            }}
            className="flex flex-col space-y-2 text-sm justify-center items-center gap-2 "
          >
            <input
              className=" font-bold px-4 border-b border-blue-700 hover:border-blue-500  "
              onChange={(e) => {
                setTmpSlug(e.target.value);
              }}
              value={tmpSlug}
            />
            <button
              onClick={redirect}
              className="bg-blue-500 hover:bg-blue-400 text-white  buttons border-b-1 border-blue-700 hover:border-blue-500 rounded"
            >
              Redirect
            </button>
          </div>

          {/* File upload functionality */}
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
            {fileList.map((file, index) => {
              return (
                <li
                  key={index}
                  className="text-xs w-full max-w-full flex flex-row items-center gap-1 justify-between  border-blue-300  hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white"
                >
                  <div className="flex items-center p-2 text-gray-900 transition duration-75 rounded-lg group flex-1">
                    {fileIcon(file.type)}
                    <span
                      className="ms-3 cursor-pointer line-clamp-1"
                      title={file.name}
                    >
                      {file.name ? getPresizeFileName(file.name) : "file"}{" "}
                      {/* {file.name ? file.name : "file"}{" "} */}
                    </span>
                  </div>
                  <div className="flex flex-row min-w-[50px]">
                    <a href={file.url} target="_blank" download={file.name}>
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
        </div>
      </aside>

      <div className="MainArea sm:size-full  text-xs md:text:sm p-1 md:p-4 gap-2">
        <div
          onFocus={() => {
            setIsRedirectFocused(true);
          }}
          onBlur={() => {
            setIsRedirectFocused(false);
          }}
          className="md:hidden flex flex-row space-x-2 py-2 text-sm justify-center items-center gap-2 "
        >
          <input
            className="font-bold px-4 border-b border-blue-700 hover:border-blue-500  "
            onChange={(e) => {
              setTmpSlug(e.target.value);
            }}
            value={tmpSlug}
          />
          <button
            onClick={redirect}
            className="bg-blue-500 hover:bg-blue-400 text-white  buttons border-b-1 border-blue-700 hover:border-blue-500 rounded"
          >
            Redirect
          </button>
        </div>
        {/* app bar header */}
        <div className="flex flex-row justify-between gap-2 items-center text-xs">
          <div className="flex flex-row">
            <div className="relative inline-block text-left">
              <button
                onClick={() => {
                  setDropdownVisibility(() => {
                    var val = structuredClone(dropdownVisibility);
                    val.file = !val.file;
                    val.history = false;
                    return val;
                  });
                }}
                type="button"
                className="inline-flex md:hidden items-center justify-center  rounded-md px-2 py-2 text-xs font-semibold shadow-sm ring-1 ring-inset ring-gray-300 text-dark bg-slate-100  hover:bg-slate-200  focus:outline-none focus:ring-gray-300 font-medium rounded-lg px-2 py-1 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-gray  -800"
                aria-expanded="true"
                aria-haspopup="true"
              >
                Files
                {downArrowIcon}
              </button>

              {dropdownVisibility.file && (
                <div
                  className="absolute left-0 z-10 mt-2 min-w-[240px] max-w-96 max-h-96 overflow-auto p-1 px-3 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="menu-button"
                >
                  <ul
                    className=" text-sm text-gray-700 dark:text-gray-200 "
                    aria-labelledby="fileDropdownDefaultButton"
                  >
                    <div className="space-y-2 font-medium text-sm border-gray-200 dark:border-gray-700">
                      <label className="custom-file-upload gap-2 cursor-pointer flex flex-row justify-around items-center p-2 text-gray-900 transition duration-75 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white group">
                        <input type="file" accept="*" onChange={onSelectFile} />
                        {fileAddIcon}
                        Select to Upload Files
                      </label>
                    </div>
                    {fileList.length > 0 && (
                      <div className="pt-1 space-y-2 font-medium border-t border-gray-200 dark:border-gray-700">
                        {fileList.map((file, index) => {
                          return (
                            <li
                              key={index}
                              className="Image-content flex flex-row items-center gap-1 justify-between  border-blue-300"
                            >
                              <div className="flex items-center p-2 text-gray-900 transition duration-75 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white group flex-1">
                                {fileIcon(file.type)}
                                <span className="ms-3">
                                  {file.name
                                    ? getPresizeFileName(file.name)
                                    : "file"}{" "}
                                </span>
                              </div>
                              <div className="flex flex-row">
                                <a
                                  href={file.url}
                                  target="_blank"
                                  download={file.name}
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
                  </ul>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-row gap-1   ">
            <button
              onClick={saveData}
              title="Ctr + S also worked!"
              className="bg-blue-500 hover:bg-blue-400 text-white buttons  font-bold border-b-1 border-blue-700 hover:border-blue-500 rounded"
            >
              Save
            </button>

            <div className="relative inline-block text-left">
              <button
                onMouseOver={() => {
                  getAllversionData(false);
                }}
                onClick={() => {
                  getAllversionData(true);

                  setDropdownVisibility(() => {
                    var val = structuredClone(dropdownVisibility);
                    val.history = !val.history;
                    val.file = false;
                    return val;
                  });
                }}
                type="button"
                className="inline-flex items-center justify-center  rounded-md px-2 py-2 text-xs font-semibold shadow-sm ring-1 ring-inset ring-gray-300 text-dark bg-slate-100  hover:bg-slate-200  focus:outline-none focus:ring-gray-300 font-medium rounded-lg px-2 py-1 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-gray  -800"
                id="menu-button"
                aria-expanded="true"
                aria-haspopup="true"
              >
                {latestVersion.timeformate
                  ? "Last save on - " + latestVersion.timeformate
                  : "History "}
                {downArrowIcon}
              </button>

              {dropdownVisibility.history && allVersionData.length > 0 && (
                <div
                  className="absolute right-0 z-10 mt-2 min-w-[240px] max-w-[300px]  max-h-96 overflow-auto p-1 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
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
                          className="flex px-1 items-center justify-end "
                        >
                          <div className="min-w-[20px] max-w-[30px]" title="Current version ">
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
        </div>

        {/* code area */}
        <div className="MainTextArea text-sm relative">
          {isClipBoardAvailable && (
            <div
              onClick={() => {
                copyToClipBoard();
              }}
              className="absolute top-1 right-1 cursor-pointer text-dark bg-slate-100  hover:bg-slate-200  focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-2 py-0.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              copy text
            </div>
          )}


          <Editor
            onInit={(evt, editor) => editorRef.current = editor}
            className="text-sm z-10 h-[100%] rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            apiKey={tinyApiKey}
            init={{
              ai_request: (request, respondWith) => respondWith.string(() => Promise.reject('See docs to implement AI Assistant')),
              selector: "textarea",
              plugins: [
                // Core editing features
                'fullscreen', 'save', 'anchor', 'autolink', 'charmap', 'codesample', 'emoticons', 'image', 'link', 'lists', 'media', 'searchreplace', 'table', 'visualblocks', 'wordcount',
                'checklist', 'mediaembed', 'casechange', 'export', 'formatpainter', 'pageembed', 'a11ychecker', 'tinymcespellchecker', 'permanentpen', 'powerpaste', 'advtable', 'advcode', 'editimage', 'advtemplate', 'ai', 'mentions', 'tinycomments', 'tableofcontents', 'footnotes', 'mergetags', 'autocorrect', 'typography', 'inlinecss', 'markdown',
              ],
              toolbar: 'socketTogglePlugin fullscreen save undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
              tinycomments_mode: 'embedded',
              tinycomments_author: 'Aarju Patel',

              setup: (editor) => {

                editor.ui.registry.addIcon("socketIcon", socketIcon)
                editor.ui.registry.addButton("socketTogglePlugin", {
                  icon: "socketIcon",
                  tooltip: "Toggle realtime socket update ",
                  onAction: function () {
                    setSocketEnabled((prev) => !prev);
                  },
                });
              },

              save_onsavecallback: (e) => {
                saveData()
              }
            }}
            onEditorChange={(value) => {
              if (value != incomingEditorValue) {
                socket.emit("room_message", userSlug, value);
              }
            }}
            initialValue={latestVersion.data}
          />
        </div>
      </div>
    </div>
  );
}

function useKey(key, cb) {
  const callback = useRef(cb);

  useEffect(() => {
    callback.current = cb;
  });

  useEffect(() => {
    function handle(event) {
      if (event.code === key) {
        callback.current(event);
      } else if (key === "ctrl+s" && event.key === "s" && event.ctrlKey) {
        callback.current(event);
      } else if (key === "ctrl+s" && event.key === "s" && event.metaKey) {
        callback.current(event);
      } else if (key === "ctrl+c" && event.key === "c" && event.ctrlKey) {
        callback.current(event);
      } else if (key === "ctrl+c" && event.key === "c" && event.metaKey) {
        callback.current(event);
      }
    }

    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [key]);
}
