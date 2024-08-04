import React, { useEffect, useRef, useState } from "react";
import userService from "../services/userService";
import { useNavigate, useParams } from "react-router-dom";
import toast from 'react-hot-toast';
export default function MainPage() {
  const mainTextArea = useRef(null);
  const navigate = useNavigate();
  const { slug } = useParams();
  const [isRedirectFocused, setIsRedirectFocused] = useState(true);
  const [latestVersion, setLatestVersion] = useState({ time: "", data: "", _id: "" });
  const [allVersionData, setAllVersionData] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [tmpSlug, setTmpSlug] = useState("");

  useEffect(() => {
    if (!slug) {
      const newSlug = generateRandomString(10)
      navigate("/" + newSlug);
      setTmpSlug(newSlug);
    } else {
      setTmpSlug(slug);
      userService
        .getData(slug)
        .then((res) => {
          if (res.success) {
            mainTextArea.current.value = res.result.data.data;
            res.result.data.timeformate = getTimeInFormate(res.result.data.time);
            setLatestVersion(res.result.data);

            if (res.result.files && res.result.files.length > 0) {
              setFileList(res.result.files);
            }else{
              setFileList([])
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

  function clearMainArea() {
    mainTextArea.current.value = "";
    setFileList([])
  }

  function getTimeInFormate(time) {
    let t = new Date(time);
    return t.getFullYear() + "-" + t.getMonth() + "-" + t.getDate() + " " + t.getHours() + ":" + t.getMinutes() + ":" + t.getSeconds();
  }

  const saveData = () => {
    var body = {
      slug: slug,
      data: mainTextArea.current.value,
    };
    userService.saveData(body).then((res) => {
      toast.success("data saved");
    }).catch((error) => {
      toast.error("error while saving data");
      console.error(error);
    });
  };

  const onSelectFile = async (event) => {
    const file = event.target.files[0];

    const convertedFile = await convertToBase64(file);

    var requestPayload = {
      file: convertedFile,
      fileName: file.name,
      slug: slug,
      type: "image/png"
    }

    // console.log("requestPayload : ", requestPayload);

    const imageUploadPromise = userService.saveFile(requestPayload).then((res) => {
      toast.success(res.message);
      setFileList((list) => [...list, res.result]);
    }).catch((error) => {
      console.log(error);
      toast.error(error.toString());
    })
  }
  const convertToBase64 = (file) => {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        resolve(reader.result);
      }
    })
  }

  const redirect = () => {
    navigate("/" + tmpSlug);
  };

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
    userService.removeFile({ slug, file }).then((res) => {
      toast.success(res.message);
      setFileList((list) => {
        const t = list.filter((l) => { return l.key != file.key });
        return t;
      });

    }).catch(e => {
      toast.error("Error while removing file : ", e);
    })
  }

  useKey('ctrl+s', (event) => {
    event.preventDefault();
    saveData();
  });
  useKey('Enter', (event) => {
    if (isRedirectFocused) {
      redirect();
    }
  });

  return (
    <div className="MainPage">

      <aside id="separator-sidebar" className=" SideBar z-40  h-screen transition-transform -translate-x-full sm:translate-x-0" aria-label="Sidebar">
        <div className="h-full px-3 py-4 overflow-y-auto bg-gray-50 dark:bg-gray-800">
          {/* redirect functionality */}
          <ul className="space-y-2 font-medium">
            <div onFocus={() => { setIsRedirectFocused(true); }} onBlur={() => { setIsRedirectFocused(false); }} className="flex flex-col justify-center items-center gap-2 ">
              <input
                accept="image/*"
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
              <label className="custom-file-upload gap-2 cursor-pointer flex flex-row justify-between items-center p-2 text-gray-900 transition duration-75 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white group">
               
                {/* <span className="ms-3"></span> */}
                {/* <label className="custom-file-upload"> */}
                  <input type="file" accept="image/*" onChange={onSelectFile} />
                  <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m3 16 5-7 6 6.5m6.5 2.5L16 13l-4.286 6M14 10h.01M4 19h16a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1Z" />
                </svg>
                  Upload Files
                  <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14m-7 7V5" />
                </svg>
                </label>
              {/* </div> */}
            </li>
            {/* File List functionality */}
          </ul> <ul className="pt-4 mt-4 space-y-2 font-medium border-t border-gray-200 dark:border-gray-700">
            {fileList.map((file) => {
              return (<li key={file.key} className="Image-content flex flex-row items-center gap-1">
                <a href={file.url} target="_blank" className="flex items-center p-2 text-gray-900 transition duration-75 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white group">
                  <svg className="text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m3 16 5-7 6 6.5m6.5 2.5L16 13l-4.286 6M14 10h.01M4 19h16a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1Z" />
                  </svg>
                  <span className="ms-3">{file.name ? file.name : "file"} </span>
                </a>

                <svg className=" cursor-pointer hover:bg-gray-100" onClick={() => remvoeCurrentFile(file)} xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="48" height="48" viewBox="0 0 24 24">
                  <path d="M 10 2 L 9 3 L 3 3 L 3 5 L 4.109375 5 L 5.8925781 20.255859 L 5.8925781 20.263672 C 6.023602 21.250335 6.8803207 22 7.875 22 L 16.123047 22 C 17.117726 22 17.974445 21.250322 18.105469 20.263672 L 18.107422 20.255859 L 19.890625 5 L 21 5 L 21 3 L 15 3 L 14 2 L 10 2 z M 6.125 5 L 17.875 5 L 16.123047 20 L 7.875 20 L 6.125 5 z"></path>
                </svg>

              </li>)
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
          <div className="hover:bg-slate-200 text-dark   text-xs " >
            Last save on - {latestVersion.timeformate}
          </div>
        </div>

        <textarea
          ref={mainTextArea}
          id="mainTextArea"

          className="text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        ></textarea>

      </div>

    </div>
  );
}

function useKey(key, cb) {
  const callback = useRef(cb);

  useEffect(() => {
    callback.current = cb;
  })

  useEffect(() => {
    function handle(event) {
      if (event.code === key) {
        callback.current(event);
      } else if (key === 'ctrl+s' && event.key === 's' && event.ctrlKey) {
        callback.current(event);
      } else if (key === 'ctrl+s' && event.key === 's' && event.metaKey) {
        callback.current(event);
      }
    }

    document.addEventListener('keydown', handle);
    return () => document.removeEventListener("keydown", handle)
  }, [key])
}
