import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const useMetaPixel = () => {
  const location = useLocation();

  // Initial page is already tracked by index.html
  const lastTrackedUrl = useRef(
    window.location.pathname +
    window.location.search +
    window.location.hash
  );

  useEffect(() => {
    const currentUrl =
      location.pathname +
      location.search +
      location.hash;

    // Prevent duplicate tracking
    if (lastTrackedUrl.current === currentUrl) {
      return;
    }

    lastTrackedUrl.current = currentUrl;

    // Track React Router navigation
    if (typeof window.fbq === "function") {
      window.fbq("track", "PageView");
    }
  }, [
    location.pathname,
    location.search,
    location.hash,
  ]);
};

export default useMetaPixel;