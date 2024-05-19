import React, { useEffect, useRef, useState } from "react";
import userService from "../services/userService";
import { useNavigate, useParams } from "react-router-dom";
import toast from 'react-hot-toast';
export default function MainPage() {
  const main_area = useRef(null);
  const navigate = useNavigate();
  const { slug } = useParams();
const [isRedirectFocused, setIsRedirectFocused] = useState(true);
  const [tmpSlug, setTmpSlug] = useState("");

  useEffect(() => {
    console.log("slug : " + slug);
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
            main_area.current.value = res.data.data;
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
    main_area.current.value = "";
  }


  const saveData = () => {
    // console.log(main_area.current.value);
    var body = {
      slug: slug,
      data: main_area.current.value,
    };
    userService.saveData(body).then((res) => {
      toast.success("data saved");
    }).catch((error) => {
      toast.error("error while saving data");
      console.error(error);
    });
  };

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


  useKey('ctrl+s', (event) => {
    event.preventDefault();
    saveData();
  });
  useKey('Enter', (event) => {
    event.preventDefault();
    if(isRedirectFocused){
      redirect();
    }
  });

  return (
    <div className="MainPage flex flex-col justify-center items-center gap-2">
      <div className="page-header  ">
        <div onFocus={()=>{setIsRedirectFocused(true);}} onBlur={()=>{setIsRedirectFocused(false);}} className="flex flex-row justify-center items-center gap-2 ">
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
        <button
          onClick={saveData}
          title="Ctr + S also worked!"
          className="bg-blue-500 hover:bg-blue-400 text-white buttons border-b-1 border-blue-700 hover:border-blue-500 rounded"
        >
          Save
        </button>
      </div>

      <textarea
        ref={main_area}
        id="main_area"
        // rows="30"
        className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      ></textarea>
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
      }
    }

    document.addEventListener('keydown', handle);
    return () => document.removeEventListener("keydown", handle)
  }, [key])
}