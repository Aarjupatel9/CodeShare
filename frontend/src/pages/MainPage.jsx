import React, { useEffect, useRef, useState } from "react";
import userService from "../services/userService";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  currentVersionIcon,
  versionIndicatorIcon,
  fileIcon,
  fileUploadIcon,
  downloadIcon,
  removeIcon,
  fileAddIcon,
  downArrowIcon,
} from "../assets/svgs";

export default function MainPage() {
  var MAX_FILE_NAME_VISIBLE = 25;
  const mainTextArea = useRef(null);
  const navigate = useNavigate();
  const { slug } = useParams();
  const [isRedirectFocused, setIsRedirectFocused] = useState(true);
  const [latestVersion, setLatestVersion] = useState({
    time: "",
    data: "",
    _id: "",
  });
  const [allVersionData, setAllVersionData] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [tmpSlug, setTmpSlug] = useState("");

  const isClipBoardAvailable = navigator?.clipboard ? true : false;

  useEffect(() => {
    if (!slug) {
      const newSlug = generateRandomString(10);
      navigate("/" + newSlug);
      setTmpSlug(newSlug);
    } else {
      setAllVersionData([]);
      setFileList([]);
      setTmpSlug(slug);
      userService
        .getData(slug, null, "latest")
        .then((res) => {
          if (res.success) {
            mainTextArea.current.value = res.result.data.data;
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
            clearMainArea();
          }
        })
        .catch((error) => {
          console.log(error);
          clearMainArea();
        });
    }
  }, [slug]);

  const getAllversionData = (isCliced) => {
    if (allVersionData.length > 0) {
      return;
    }
    if (!latestVersion?.timeformate && isCliced) {
      toast.success("No history available for this page");
      return;
    }
    userService
      .getData(slug, null, "allVersion")
      .then((res) => {
        console.log(res);
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
        console.log(err);
      });
  };

  const loadSpecificVersion = (time, index) => {
    userService
      .getData(slug, time, "specific")
      .then((res) => {
        console.log("specific : ", res);
        if (res.success) {
          mainTextArea.current.value = res.result.data.data;
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
        console.log(err);
      });
  };

  function clearMainArea() {
    mainTextArea.current.value = "";
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
    var body = {
      slug: slug,
      data: mainTextArea.current.value,
    };
    var dataSavePromise = userService
      .saveData(body)
      .then((res) => {
        var obj = structuredClone(latestVersion);
        obj.timeformate = getTimeInFormate(res.newData.time);
        obj.time = res.newData.time;
        setLatestVersion(obj);
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
    const convertedFile = await convertToBase64(file);
    var requestPayload = {
      file: convertedFile,
      fileName: file.name,
      slug: slug,
      type: "image/png",
    };

    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileName", file.name);
    formData.append("slug", slug);

    const imageUploadPromise = userService
      .saveFile(formData)
      .then((res) => {
        toast.success(res.message);
        setFileList((list) => [...list, res.result]);
      })
      .catch((error) => {
        console.log(error);
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
  const convertToBase64 = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        resolve(reader.result);
      };
    });
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
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
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
      .removeFile({ slug, file })
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
    navigator?.clipboard?.writeText(mainTextArea.current.value).then(
      () => {
        toast.success("Content copied to clipboard");
      },
      () => {
        toast.error("Failed to copy");
      }
    );
    // navigator?.permissions
    //   ?.query({ name: "write-on-clipboard" })
    //   .then((result) => {
    //     if (result.state == "granted" || result.state == "prompt") {
    //       navigator?.clipboard?.writeText(mainTextArea.current.value);
    //       toast.success("Text copied!");
    //     }
    //   });
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

  useEffect(() => {
    console.log(allVersionData);
  }, [allVersionData]);

  return (
    <div className="MainPage">
      <aside
        id="separator-sidebar"
        className=" SideBar z-40  h-screen transition-transform -translate-x-full sm:translate-x-0"
        aria-label="Sidebar"
      >
        <div className="h-full px-3 py-4 overflow-y-auto bg-gray-50 dark:bg-gray-800">
          {/* redirect functionality */}
          <ul className="space-y-2 font-medium">
            <div
              onFocus={() => {
                setIsRedirectFocused(true);
              }}
              onBlur={() => {
                setIsRedirectFocused(false);
              }}
              className="flex flex-col justify-center items-center gap-2 "
            >
              <input
                className=" font-bold  px-4 border-b-2 border-blue-700 hover:border-blue-500 rounded"
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
          </ul>
          {/* File upload functionality */}
          <ul className="pt-4 mt-4 space-y-2 font-medium border-t border-gray-200 dark:border-gray-700">
            <li>
              <label className="custom-file-upload gap-2 cursor-pointer flex flex-row justify-around items-center p-2 text-gray-900 transition duration-75 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white group">
                <input type="file" accept="*" onChange={onSelectFile} />
                {fileAddIcon}
                Select to Upload Files
              </label>
              {/* </div> */}
            </li>
            {/* File List functionality */}
          </ul>{" "}
          <ul className="pt-4 mt-4 space-y-2 font-medium border-t border-gray-200 dark:border-gray-700">
            {fileList.map((file, index) => {
              return (
                <li
                  key={index}
                  className="Image-content flex flex-row items-center gap-1 justify-between  border-blue-300"
                >
                  <div className="flex items-center p-2 text-gray-900 transition duration-75 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white group flex-1">
                    {fileIcon(file.type)}
                    <span className="ms-3">
                      {file.name ? getPresizeFileName(file.name) : "file"}{" "}
                    </span>
                  </div>
                  <div className="flex flex-row">
                    <a href={file.url} target="_blank">
                      {downloadIcon}
                    </a>
                    <div onClick={() => remvoeCurrentFile(file)}>
                      {removeIcon}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>

      <div className="MainArea p-4 gap-2">
        <div className="flex flex-row justify-end gap-2 items-center ">
          <button
            onClick={saveData}
            title="Ctr + S also worked!"
            className="bg-blue-500 hover:bg-blue-400 text-white buttons font-bold border-b-1 border-blue-700 hover:border-blue-500 rounded"
          >
            Save
          </button>

          <button
            id="dropdownDefaultButton"
            onMouseOver={() => {
              getAllversionData(false);
            }}
            onClick={() => {
              getAllversionData(true);
            }}
            data-dropdown-toggle="dropdown"
            className="text-dark bg-slate-100  hover:bg-slate-200  focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-2 py-1 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            type="button"
          >
            {latestVersion.timeformate
              ? "Last save on - " + latestVersion.timeformate
              : "History "}
            {downArrowIcon}
          </button>

          {/* <!-- Dropdown menu --> */}
          <div
            id="dropdown"
            className="z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow dark:bg-gray-700 "
          >
            <ul
              className="py-2 text-sm text-gray-700 dark:text-gray-200 max-h-96 overflow-auto"
              aria-labelledby="dropdownDefaultButton"
            >
              {allVersionData.map((v, index) => {
                return (
                  <li
                    key={index}
                    className="flex px-1 items-center justify-end "
                  >
                    <div title="Current version">
                      {v.isCurrent && currentVersionIcon(v)}
                      {v.isLoaded && !v.isCurrent && versionIndicatorIcon}
                    </div>
                    <div
                      title="Click to load this version"
                      onClick={() => {
                        loadSpecificVersion(v.time, index);
                      }}
                      className="cursor-pointer block gap-1 px-2 py-1 border-1 border-black-100 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                    >
                      Version - {v.timeformat}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
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
          <textarea
            ref={mainTextArea}
            id="mainTextArea"
            className="text-sm z-10 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          ></textarea>
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
