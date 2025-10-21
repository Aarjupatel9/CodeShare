import { useEffect } from 'react';

/**
 * Custom hook to detect clicks outside of a ref element
 * @param {React.RefObject} ref - The ref of the element to detect outside clicks
 * @param {Function} handler - Callback function to execute when clicked outside
 * @param {boolean} enabled - Whether the hook is enabled (default: true)
 */
const useClickOutside = (ref, handler, enabled = true) => {
  useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        handler();
      }
    };

    // Add event listener to main document
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    
    // Also add to TinyMCE iframes if they exist
    const addIframeListeners = () => {
      const iframes = document.querySelectorAll('iframe');
      iframes.forEach(iframe => {
        try {
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
          if (iframeDoc) {
            iframeDoc.addEventListener('mousedown', handleClickOutside);
            iframeDoc.addEventListener('touchstart', handleClickOutside);
          }
        } catch (e) {
          // Ignore cross-origin iframe errors
          console.debug('Cannot access iframe:', e);
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
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      
      // Remove iframe listeners
      const iframes = document.querySelectorAll('iframe');
      iframes.forEach(iframe => {
        try {
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
          if (iframeDoc) {
            iframeDoc.removeEventListener('mousedown', handleClickOutside);
            iframeDoc.removeEventListener('touchstart', handleClickOutside);
          }
        } catch (e) {
          // Ignore cross-origin iframe errors
        }
      });
      
      observer.disconnect();
    };
  }, [ref, handler, enabled]);
};

export default useClickOutside;

