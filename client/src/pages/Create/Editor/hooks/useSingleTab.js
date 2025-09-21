import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

/**
 * A React hook that ensures URLs matching a specific pattern can only be open in one tab.
 * If another tab is already open with the matching URL, this redirects to a specified path.
 *
 * @param {Object} options - Configuration options
 * @param {string} options.urlPattern - URL pattern to enforce single tab (default: "/createpost/")
 * @param {string} options.storageKey - Key used in localStorage (default: "createpost-tab")
 * @param {number} options.heartbeatInterval - Interval in ms to check if the tab is still active (default: 1000)
 * @param {string} options.messageText - Text to show when another tab is already open (default: "You already have an editor open in another tab.")
 * @param {string} options.redirectPath - Path to redirect to if another tab is already open (default: "/profile")
 * @returns {boolean} - Returns true if this is the active tab, false otherwise
 */
export default function useSingleTab({
  urlPattern = "/createpost/",
  storageKey = "createpost-tab",
  heartbeatInterval = 1000,
  messageText = "You already have an editor open in another tab.",
  redirectPath = "/profile",
} = {}) {
  const navigate = useNavigate();
  const isActiveTab = useRef(false);
  const heartbeatTimerId = useRef(null);

  useEffect(() => {
    // Only apply the logic if the URL matches the pattern
    if (!window.location.pathname.startsWith(urlPattern)) {
      return;
    }

    // Generate a unique ID for this tab
    const tabId = Date.now().toString();

    // Function to check if this tab can be the active tab
    const checkTabStatus = () => {
      const currentActiveTab = localStorage.getItem(storageKey);

      // If no active tab is registered, or this is already the active tab
      if (!currentActiveTab || currentActiveTab === tabId) {
        // Set this tab as active and update the timestamp
        localStorage.setItem(storageKey, tabId);
        localStorage.setItem(`${storageKey}-timestamp`, Date.now().toString());
        isActiveTab.current = true;
        return true;
      }

      // Check if the other tab is still active (within the last 3 heartbeats)
      const lastHeartbeat = parseInt(
        localStorage.getItem(`${storageKey}-timestamp`) || "0",
      );
      const timeSinceLastHeartbeat = Date.now() - lastHeartbeat;

      if (timeSinceLastHeartbeat > heartbeatInterval * 3) {
        // The other tab seems inactive, take over
        localStorage.setItem(storageKey, tabId);
        localStorage.setItem(`${storageKey}-timestamp`, Date.now().toString());
        isActiveTab.current = true;
        return true;
      }

      // Another tab is active
      isActiveTab.current = false;
      return false;
    };

    // Initial check
    const canProceed = checkTabStatus();

    if (!canProceed) {
      // Alert the user and redirect
      alert(messageText);
      navigate(redirectPath, { replace: true });
      return;
    }

    // Set up a heartbeat to keep this tab registered as active
    heartbeatTimerId.current = setInterval(() => {
      if (isActiveTab.current) {
        localStorage.setItem(`${storageKey}-timestamp`, Date.now().toString());
      }
    }, heartbeatInterval);

    // Handle navigation within the app (if using client-side routing)
    const handleRouteChange = () => {
      if (
        !window.location.pathname.startsWith(urlPattern) &&
        isActiveTab.current
      ) {
        cleanup();
      } else if (
        window.location.pathname.startsWith(urlPattern) &&
        !isActiveTab.current
      ) {
        checkTabStatus();
      }
    };

    // Cleanup function to be called when unmounting or navigating away
    const cleanup = () => {
      if (isActiveTab.current) {
        localStorage.removeItem(storageKey);
        localStorage.removeItem(`${storageKey}-timestamp`);
        isActiveTab.current = false;
      }

      if (heartbeatTimerId.current) {
        clearInterval(heartbeatTimerId.current);
      }
    };

    // Register event listeners
    window.addEventListener("beforeunload", cleanup);
    window.addEventListener("popstate", handleRouteChange);

    // React Router doesn't always trigger popstate events, so we need to patch history methods
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function () {
      originalPushState.apply(this, arguments);
      handleRouteChange();
    };

    history.replaceState = function () {
      originalReplaceState.apply(this, arguments);
      handleRouteChange();
    };

    // Cleanup on unmount
    return () => {
      cleanup();
      window.removeEventListener("beforeunload", cleanup);
      window.removeEventListener("popstate", handleRouteChange);
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, [
    urlPattern,
    storageKey,
    heartbeatInterval,
    messageText,
    redirectPath,
    navigate,
  ]);

  return isActiveTab.current;
}
