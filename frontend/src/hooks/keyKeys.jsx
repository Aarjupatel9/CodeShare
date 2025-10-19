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

    // Add listener to main document
    document.addEventListener("keydown", handle);
    
    // Also add to TinyMCE iframes if they exist
    const addIframeListeners = () => {
      const iframes = document.querySelectorAll('iframe');
      iframes.forEach(iframe => {
        try {
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
          if (iframeDoc) {
            iframeDoc.addEventListener('keydown', handle);
          }
        } catch (e) {
          // Ignore cross-origin iframe errors
          console.debug('Cannot access iframe for keyboard events:', e);
        }
      });
    };

    // Add listeners to existing iframes
    addIframeListeners();

    // Watch for new iframes (TinyMCE loads async)
    const observer = new MutationObserver(addIframeListeners);
    observer.observe(document.body, { childList: true, subtree: true });

    // Cleanup
    return () => {
      document.removeEventListener("keydown", handle);
      
      // Remove iframe listeners
      const iframes = document.querySelectorAll('iframe');
      iframes.forEach(iframe => {
        try {
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
          if (iframeDoc) {
            iframeDoc.removeEventListener('keydown', handle);
          }
        } catch (e) {
          // Ignore cross-origin iframe errors
        }
      });
      
      observer.disconnect();
    };
  }, [key]);
}

export default useKeys;