import { useRef, useEffect } from "react";
const useKeys = (key, cb) => {
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
      }
    }

    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [key]);
}

export default useKeys;