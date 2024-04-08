import React, { useEffect, useRef } from "react";
import userService from "../services/userService";
import { useNavigate, useParams } from "react-router-dom";

export default function MainPage() {
  const main_area = useRef(null);
  const navigate = useNavigate();
  const { slug } = useParams();

  useEffect(() => {
    console.log("slug : " + slug);
    if (!slug) {
      navigate("/" + generateRandomString(10));
    }
    userService.getData(slug).then((res) => {
      if (res.success) {
        main_area.current.value = res.data.data;
      }
    });
  }, [slug]);
  const saveData = () => {
    console.log(main_area.current.value);
    var body = {
      slug: slug,
      data: main_area.current.value,
    };
    userService.saveData(body).then((res) => {
      alert("data saved");
    });
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

  return (
    <div className="flex flex-col justify-center items-center gap-2 ">
      <button
        onClick={saveData}
        class="bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded"
      >
        Save
      </button>

      <textarea
        ref={main_area}
        id="main_area"
        rows="30"
        class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      ></textarea>
    </div>
  );
}
